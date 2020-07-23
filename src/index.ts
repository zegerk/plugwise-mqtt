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
import PlugwiseError from './lib/plugwise/error'
import Mqtt from './lib/mqtt'
import Singleton from './lib/singleton'
import {exit} from 'process'

let plugwise: Plugwise
let mqtt: Mqtt

/**
 * Get all updates values from Plugwise since timestamp and send them
 * to the MQTT class to handle
 *
 * @param {number} timestamp in ms, will be converted to seconds get
 * all updates since timestamp
 *
 * @return {number} timestamp in milliseconds of the latest update found
 */
async function update(timestamp: number) {
  const statusMessage: statusMqttMessage = {
    updateTime: new Date(timestamp).toISOString(),
    updateCount: 0,
  }

  /**
   * Timestamp handling in the XML is in milliseconds, timestamp handling
   * on the url is in seconds; round down to avoid missing a second
   */
  const result = await plugwise.getUpdatedObjects(Math.floor(timestamp / 1000))

  if (!result) {
    const error = PlugwiseError.errors.noDataRecieved()

    logger.error(error)
    statusMessage.err = error

    mqtt.status(statusMessage)
    /**
     * Return the same timestamp so next update will be just a retry
     */
    return timestamp
  }

  return parsePlugwiseResult(result, timestamp)
}

/**
 * Convert an appliance pointlog (single measurement) to
 * an mqtt message object
 *
 * @param {any} pointLog
 * @param {any} appliance corresponding appliance
 * @return {plugwiseMqttMessage}
 */
function convertPointlog(pointLog: any, appliance: any) {
  const fieldName: string = pointLog.type[0]
  const rawFieldValue: string | number = pointLog.period[0].measurement[0]._

  const fieldValue: string | number = !isNaN(Number(rawFieldValue))
    ? parseFloat(String(rawFieldValue))
    : rawFieldValue

  /**
   * both key, value and key: value are set in the message
   *
   * { fieldName: temperature_theromstat,
   *   fieldValue: 22.1,
   *   temperature_thermostat: 22.1 }
   */
  return {
    ts: new Date(pointLog.period[0].measurement[0].$.log_date).getTime(),
    id: appliance.$.id,
    name: appliance.name[0],
    type: appliance.type[0],
    fieldName: fieldName,
    fieldValue: fieldValue,
    [fieldName]: fieldValue,
  }
}

/**
 * Convert the plugwise timestamped appliance to relevant mqtt message
 * objects
 *
 * @param {any} appliance appliance
 * @param {number} timestamp required for filtering of the values
 * @return {plugwiseMqttMessage[]} returns the array of messages
 * and the newest timestamp found; which can be used as a starting
 * timestamp for the next sync
 */
function convertPointlogs(
  appliance: any,
  timestamp: number,
): {messages: plugwiseMqttMessage[]; timestamp: number} {
  /**
   * Set to current timestamp, in case no updates are retrieved this will
   * be the next timesatmp
   */
  let maxApplianceTimestamp = timestamp

  return {
    messages: (appliance.logs[0].point_log || []).reduce(function (
      logsAccumulator: any,
      pointLog: any,
    ) {
      if (pointLog.period) {
        return logsAccumulator
      }

      /**
       * Computed twice; but it is more structured to do the timestamp
       * check here, and is confusing to add this value to the converPointLog
       * function
       */
      const applianceValueTimestamp = new Date(
        pointLog.period[0].measurement[0].$.log_date,
      ).getTime()

      /**
       * If a single value is updated the full list of data fields
       * for an appliance is returned, filter on update timestamp for
       * the values in order to send the ones actually updated to MQTT
       */
      if (applianceValueTimestamp > timestamp) {
        const applianceData: plugwiseMqttMessage = convertPointlog(
          pointLog,
          appliance,
        )

        logger.debug(JSON.stringify(applianceData))

        /**
         * Track the timestamp of the latest update so we can
         * return it later to start the next update from that
         * point in time
         */
        maxApplianceTimestamp = Math.max(
          maxApplianceTimestamp,
          applianceValueTimestamp,
        )

        return [...logsAccumulator, applianceData]
      }

      /**
       * For this pointlog the timestamp is out of scope, so nothing
       * to accumulate
       */
      return logsAccumulator
    },
    []),
    timestamp: maxApplianceTimestamp,
  }
}

/**
 * Convert the plugwise timestamped appliance to relevant mqtt message
 * objects
 *
 * @param {any[]} appliances list of appliances
 * @param {number} timestamp required for filtering of the values
 * @return {plugwiseMqttMessage[]} returns the array of messages
 * and the newest timestamp found; which can be used as a starting
 * timestamp for the next sync
 */
function convertAppliances(
  appliances: any[],
  timestamp: number,
): {messages: plugwiseMqttMessage[]; timestamp: number} {
  /**
   * Set to current timestamp, in case no updates are retrieved this will
   * be the next timesatmp
   */
  let maxApplianceTimestamp = timestamp

  return {
    messages: appliances.reduce(function (accumulator: any, appliance: any) {
      if (!appliance.logs) {
        return accumulator
      }

      const pointLogsResult: {
        messages: plugwiseMqttMessage[]
        timestamp: number
      } = convertPointlogs(appliance, timestamp)

      /**
       * Track the timestamp of the latest update so we can
       * return it later to start the next update from that
       * point in time
       */
      maxApplianceTimestamp = Math.max(
        maxApplianceTimestamp,
        pointLogsResult.timestamp,
      )

      return [...accumulator, ...pointLogsResult.messages]
    }, []),
    timestamp: maxApplianceTimestamp,
  }
}

/**
 * @param {string} result raw XML string
 * @param {number} timestamp in ms, will be converted to seconds get
 * all updates since timestamp
 *
 * @return {number} timestamp in milliseconds of the latest update found
 */
async function parsePlugwiseResult(result: string, timestamp: number) {
  let convertResult: {
    messages: plugwiseMqttMessage[]
    timestamp: number
  } = {messages: [], timestamp}

  /**
   * Loop through the returned data a build a list of MQTT messages containing
   * only the data we need
   *
   * Note parseString is using a callback (!)
   *
   * @return {boolean} result status - more details in topic
   */
  parseString(result, function (err, result: any) {
    if (err) {
      const error = PlugwiseError.errors.xmlParsingFailed({err})
      logger.error(error)
      publishMessages([], timestamp, err)
      return false
    }

    /**
     * Data and error check done, next convert the Plugwise data to
     * relevant MQTT message objects
     */
    convertResult = convertAppliances(
      result.domain_objects.appliance || [],
      timestamp,
    )

    publishMessages(convertResult.messages, timestamp)
    return true
  })

  /**
   * In order not to miss any updates the latest update timestamp
   * is returned so it can be used as a starting point for the next
   * update
   */
  return convertResult.timestamp
}

/**
 * Publish messages
 *
 * @param {plugwiseMqttMessage[]} messages messages
 * @param {number} timestamp timestamp of the sync
 * @param {error} err
 */
function publishMessages(
  messages: plugwiseMqttMessage[],
  timestamp: number,
  err?: Error,
) {
  const statusMessage: statusMqttMessage = {
    updateTime: new Date(timestamp).toISOString(),
    updateCount: 0,
    err: err,
  }

  /*
   * @todo make a more pluggable structure to handle the messages to
   * other outputs besides mqtt
   */
  mqtt.publish(messages)

  /**
   * Bit hacky for now
   */
  statusMessage.updateCount = messages.length
  mqtt.status(statusMessage)
}

/**
 * Main loop
 */
;(async () => {
  let polling = true

  /**
   * When process should stop: stop the loop and
   * kill the MQTT connections
   */
  process.on('SIGINT', async function () {
    logger.info('Stopping Plugwise polling')
    polling = false
    logger.info('Stopping MQTT')
    try {
      await mqtt.shutdown()
      exit(0)
    } catch (e) {
      exit(1)
    }
  })

  logger.info('Start main loop')

  plugwise = Singleton.getInstance(Plugwise)
  mqtt = Singleton.getInstance(Mqtt)

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
  while (plugwiseConfig.plugwisePolling && polling) {
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
    await delay(plugwiseConfig.plugwise.pollInterval)
  }
})()
