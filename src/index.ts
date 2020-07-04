/**
 * Plugwise to MQTT and MQTT to Plugwise
 *
 * This script send Plugwise updates to MQTT topics and listens to MQTT
 * topics to update values (set the thermostat temperature)
 *
 * The script is twofold, firstly it can be used to get all Plugwise updates
 * in MQTT as a JSON string the configured topic(s) - this can, for example, be
 * used with Thingsboard to create graphs
 *
 * Secondly the script sends updates to MQTT for each data field (temperature,
 * valve position) and listens to these topics to send updates to Plugwise,
 * mainly used for setting the temperature
 *
 * Timestamps are UTC
 *
 * Project scaffolded using https://github.com/bitjson/typescript-starter
 *
 * @author Zeger Knops - <zeger@zeger.nl>
 */

import {parseString} from 'xml2js'

import {plugwiseMqttMessage, statusMqttMessage} from './types/mqtt'

import {delay} from './lib/helpers'
import {logger} from './lib/logger'
import {plugwiseConfig} from './lib/config'

import Plugwise from './lib/plugwise'
import Mqtt from './lib/mqtt'

let plugwise:Plugwise
let mqtt:Mqtt

/**
 * Get all updates values from Plugwise since timestamp and send them
 * to the MQTT class to handle
 *
 * @param {number}timestamp in ms, will be converted to seconds get
 * all updates since timestamp
 *
 * @return {number} timestamp in milliseconds of the latest update found
 */
async function update(timestamp: number) {
  /**
   * Set to current timestamp, in case no updates are retrieved this will
   * be the next timesatmp
   */
  let maxApplianceTimestamp = timestamp
  const statusMessage: statusMqttMessage =
    {updateTime: (new Date(timestamp)).toISOString(), updateCount: 0}

  const result = await plugwise.getUpdatedObjects(Math.floor(timestamp / 1000))

  if (!result) {
    logger.error('No data received from Plugwise')
    mqtt.status(statusMessage)
    return timestamp
  }

  /**
   * Loop through the returned data a build a list of MQTT messages containing
   * only the data we need
   */
  parseString(result, function(err, result: any) {
    /**
     * @todo
     */
    if (err) {
      throw (err)
    }

    const mqttMessages = (result.domain_objects.appliance || []).reduce(
        function(accumulator: any, appliance: any) {
          if (!appliance.logs) {
            return accumulator
          }

          const pointLogs = appliance.logs[0].point_log.reduce(
              function(logsAccumulator: any, pointLog: any) {
                if (!pointLog.period) {
                  return logsAccumulator
                }

                const applianceValueTimestamp =
                  new Date(
                      pointLog.period[0].measurement[0].$.log_date,
                  ).getTime()

                /**
                 * If a single value is updated the full list of data fields
                 * for an appliance is returned, filter on update timestamp for
                 * the values in order to send the ones actually updated to MQTT
                 */
                if (applianceValueTimestamp > timestamp) {
                  const fieldName: string = pointLog.type[0]
                  const fieldValue: string = pointLog.period[0].measurement[0]._

                  const applianceData: plugwiseMqttMessage = {
                    ts: applianceValueTimestamp,
                    id: appliance.$.id,
                    name: appliance.name[0],
                    type: appliance.type[0],
                    fieldName: fieldName,
                    /**
                     * Make real numbers from numeric string so they will be
                     * encoded properly later on
                     */
                    fieldValue: !isNaN(Number(fieldValue)) ?
                      parseFloat(fieldValue) :
                      fieldValue,
                  }

                  /**
                   * both key, value and key: value are set in the message
                   *
                   * { fieldName: temperature_theromstat,
                   *   fieldValue: 22.1,
                   *   temperature_thermostat: 22.1 }
                   */
                  applianceData[fieldName] = applianceData[fieldValue]

                  logger.debug(JSON.stringify(applianceData))

                  /**
                   * Track the timestamp of the latest update so we can
                   * return it later to start the next update from that
                   * point in time
                   */
                  maxApplianceTimestamp =
                    Math.max(maxApplianceTimestamp, applianceValueTimestamp)

                  return [...logsAccumulator, applianceData]
                }

                return logsAccumulator
              }, [])
          return [...accumulator, ...pointLogs]
        }, [])

    /**
     * After all messages have been collected they are offloaded to the
     * mqtt class
     *
     * @todo make a more pluggable structure to handle the messages to
     * other outputs besides mqtt
     */
    mqtt.publish(mqttMessages)

    statusMessage.updateCount = mqttMessages.length
    mqtt.status(statusMessage)
  })

  /**
   * In order not to miss any updates the latest update time stamp
   * is returned so it can be used as a starting point for the next
   * update
   */
  return maxApplianceTimestamp
}

/**
 * Main loop
 */
(async () => {
  logger.info('Start main loop')

  plugwise = Plugwise.getInstance()
  mqtt = Mqtt.getInstance()

  /**
   * Starting timestamp at 0 return all objects in Plugwise so
   * the unitial update is a full sync
   */
  let timestamp = 0

  /**
   * @todo listen to OS / MQTT to stop / start loop
   *
   * Disabling this loop in the config will result in the app only handling
   * temperature settings
   */
  while (plugwiseConfig.plugwiseUpdate) {
    /**
     * the update call returns the timestamp of the last update found in
     * milliseonds
     */
    logger.info({msg: 'Update start', timestamp})
    timestamp = await update(timestamp)
    logger.info({msg: 'Update end', newTimestamp: timestamp})

    /**
     * Avoid hammering plugwise
     */
    await delay(plugwiseConfig.plugwise.pullPause)
  }
})()
