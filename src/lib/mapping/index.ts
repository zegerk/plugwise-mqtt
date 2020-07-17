import {parseString} from 'xml2js'
import {logger} from '../logger'
import {noDomainObjectsFoundError} from './error'

/**
 * Appliance mapping - required to route and update from applianceId
 * to an actual HTTP "PUT"
 */
export default class Mapping {
  /*
   * Mapping of appliance to appliance static variables, such as
   * location
   */
  private applianceMapping: {[index: string]: {locationId: string}} = {}

  /**
   * Mapping of location to appliances and actuators, for example:
   * the ID to send in the put request to set a thermostat temperture
   * is in this object
   */
  private locationMapping: {[index: string]: {thermostatId: string}} = {}

  /**
   * Nothing to do here
   */
  public constructor() {}

  /**
   * Return the thermostatId (note this is not the appliance id
   * of thermostat (!)) which we need to update the thermostat setting
   *
   * @param {String} locationId
   * @return {boolean | string}
   */
  public getLocationThermostatId(locationId: string) {
    if (
      this.locationMapping[locationId] &&
      this.locationMapping[locationId].thermostatId
    ) {
      return this.locationMapping[locationId].thermostatId
    }
    return false
  }

  /**
   * Get the locationId for an appliance, this can be used to
   * retrieve the thermostatId to set the temperature
   *
   * @param {string} applianceId
   * @return {boolean | string}
   */
  public getApplianceLocationId(applianceId: string) {
    if (
      this.applianceMapping[applianceId] &&
      this.applianceMapping[applianceId].locationId
    ) {
      return this.applianceMapping[applianceId].locationId
    }
    return false
  }

  /**
   * Store the relationship between appliance ID an the underlying control
   * ids, for example a thermostat appliance has a distinct ID for its child
   * named "thermostat" which is used to actually set the thermostat value
   *
   * @param {string} domainObjects
   * @return {string | boolean}
   */
  public async buildApplianceMapping(domainObjects: string) {
    logger.info('Start building appliance map')

    if (!domainObjects) {
      logger.error(noDomainObjectsFoundError())
      return false
    }

    return await this.buildMapping(domainObjects)
  }

  /**
   * Buld the action appliance mapping
   *
   * @param {string} domainObjects
   */
  private async buildMapping(domainObjects: string) {
    // yeah it is shit to do this - has some issues with the bind
    const self = this

    /**
     * parseString uses a callback, so we wrap it in a promise to make
     * sure this function is called synchroneous, we need this data before
     * we can handle updates from MQTT -> Plugwise
     */
    return new Promise((resolve, reject) =>
      parseString(domainObjects, function (err, result) {
        if (err) {
          logger.error({msg: 'Building appliance mapping failed', error: err})
          reject(err)
        }
        ;(result.domain_objects.appliance || []).reduce(function (
          _accumulator: never,
          appliance: any,
        ) {
          appliance.location &&
            (self.applianceMapping[appliance.$.id] = {
              locationId: appliance.location[0].$.id,
            })
        },
        [])
        ;(result.domain_objects.location || []).reduce(function (
          _accumulator: never,
          location: any,
        ) {
          ;(location.actuator_functionalities || []).reduce(function (
            _accumulator: never,
            actuatorFuncionality: any,
          ) {
            actuatorFuncionality.thermostat_functionality &&
              (self.locationMapping[location.$.id] = {
                thermostatId:
                  actuatorFuncionality.thermostat_functionality[0].$.id,
              })
          },
          [])
        },
        [])

        logger.info('Appliance mapping done')
        resolve(true)
      }),
    )
  }
}
