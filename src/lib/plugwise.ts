import axios from 'axios'

import {logger} from './logger'
import {plugwiseConfig} from './config'
import Mapping from './mapping'
import {template} from './helpers'

export type PlugwiseObjectClass = 'Gateway' | 'Location' | 'Module'

/**
 * Main Pluwise class
 */
export default class Plugwise {
  private static instance: Plugwise

  private mapping: Mapping = Mapping.getInstance()

  /**
   * Constructor
   */
  public constructor() {
    this.connect()

    this.initialize()
  }

  /**
   * Singleton pattern
   *
   * @return {Plugwise}
   */
  static getInstance(): Plugwise {
    if (!Plugwise.instance) {
      Plugwise.instance = new Plugwise()
    }

    return Plugwise.instance
  }

  /**
   * Build the mapping class
   */
  private async initialize() {
    const domainObjects = await this.getDomainObjects()

    if (domainObjects) {
      this.mapping.buildApplianceMapping(domainObjects)
      return true
    }

    logger.error(
        `Cannot initialize mapping in Plugwise class,
        some features will not be available`,
    )
    return false
  }

  /**
   * There is no real "connect", this function retrieves the
   * Gateway data to check if all is well
   */
  private async connect() {
    logger.info('Connecting to gateway')
    const gateway = await this.plugwiseRequest(
        this.getPlugwiseDomainObjectsUrl(0, 'Gateway'),
    )

    if (!gateway) {
      return false
    }

    const gatewayModel =
      String(gateway).match(/<vendor_model>(.*)<\/vendor_model>/)

    logger.info({
      msg: 'Connected to gateway',
      vendor_model: (<Array<string>>gatewayModel)[1],
    })

    this.mapping = Mapping.getInstance()

    return true
  }

  /**
   * Big todo here
   *
   * @param {string} applianceId
   * @param {number} temperature
   */
  public async setThermostat(applianceId: string, temperature: number) {
    let locationId:string | boolean = false
    let thermostatId:string | boolean = false

    logger.info({msg: 'setThermostat', applianceId, temperature})

    if ((locationId = this.mapping.getApplianceLocationId(applianceId)) &&
        (thermostatId = this.mapping.getLocationThermostatId(locationId))) {
      logger.info({
        msg: 'setThermostat',
        locationId, thermostatId, temperature,
      })

      const url =
        template(
            plugwiseConfig.plugwise.baseUrl +
            'core/direct_objects;id={locationId}/thermostat;id={thermostatId}',
            {locationId, thermostatId},
        )

      const plugwiseMessage =
        template(
            '<thermostat_functionality>' +
            '<setpoint>{temperature}</setpoint>' +
            '</thermostat_functionality>',
            {temperature},
        )

      return this.plugwiseUpdateRequest(url, plugwiseMessage)
    }

    logger.warn({
      msg: 'Cannot set thermostat',
      locationId, thermostatId, temperature,
    })

    return false
  }

  /**
   * Returns all objects connected to Plugwise
   */
  public async getDomainObjects() {
    /**
     * Timestamp 0 -> return all objects
     */
    logger.debug('fetching domain objects')
    return await this.plugwiseRequest(this.getPlugwiseDomainObjectsUrl(0))
  }

  /**
   * Get all objects updated since timestamp (ms)
   *
   * @param {number} timestamp timestamp in ms
   */
  public async getUpdatedObjects(timestamp: number) {
    return await this.plugwiseRequest(
        this.getPlugwiseDomainObjectsUrl(timestamp),
    )
  }

  /**
   * Plugwise request wrapper
   *
   * @param {string} url
   */
  public async plugwiseRequest(url: string) {
    logger.debug(url)
    try {
      /**
       * Note we are directly returning the data object
       * and coverting it to a string
       */
      return String((await axios.get(url, {
        auth: {
          username: plugwiseConfig.plugwise.username,
          password: plugwiseConfig.plugwise.password,
        },
      })).data)
    } catch (err) {
      logger.error({msg: 'Request failed', url, err})
      return false
    }
  }

  /**
   * @todo response checking
   *
   * @param {string} url
   * @param {string} message
   */
  public async plugwiseUpdateRequest(url: string, message: string) {
    logger.info({msg: 'updating plugwise', url, message})

    try {
      const result = await axios.put(url, message, {
        auth: {
          username: plugwiseConfig.plugwise.username,
          password: plugwiseConfig.plugwise.password,
        },
      })
      return result.status === 200
    } catch (err) {
      logger.error({
        msg: 'plugwiseUpdateRequest', err, url, message,
      })
      return false
    }
  }

  /**
   * object classes : Gateway, Location, Module (and more?)
   *
   * Work in progress
   *
   * @param {number} timestamp
   * @param {PlugwiseObjectClass[]} objectClass
   *
   * @return {sting}
   */
  public getPlugwiseDomainObjectsUrl(
      timestamp: number,
      objectClass?: PlugwiseObjectClass[] | PlugwiseObjectClass,
  ) {
    let url = plugwiseConfig.plugwise.baseUrl

    url += 'core/domain_objects;@locale=en-US'

    if (timestamp) {
      url += ';modified_date:ge:{timestamp}' +
             ';deleted_date:ge:0' +
             ';@memberModifiedDate={timestamp}'

      url = url.replace('{timestamp}', String(timestamp))
    }

    if (objectClass != null) {
      url += ';class=' +
             (Array.isArray(objectClass) ? objectClass.join(',') : objectClass)
    }

    return url
  }
}

