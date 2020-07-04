import * as fs from 'fs'
import * as yaml from 'js-yaml'
import {exit} from 'process'

import {logger} from './logger'
import {config} from '../types/config'

/**
 * Helper constant for the MQTT topic configuration, using this constant
 * will result in publishing all available data
 */
const MQTT_MESSAGE_COMPLETE = 'complete'
const CONFIG_FILE = process.env.CONFIG || 'config.yml'

export let plugwiseConfig:config

/**
 * Check if the template for full message is being used
 *
 * @param {string} messageTemplate
 * @return {boolean}
 */
export function isCompleteMessageTemplate(messageTemplate: string) {
  return messageTemplate === MQTT_MESSAGE_COMPLETE
}

(() => {
  const plugwiseBaseConfig = {
    plugwiseUpdate: true,
    logLevel: process.env.LOGLEVEL || 'info',
    plugwise: {
      baseUrl: process.env.PLUGWISE_PASSWORD,
      username: process.env.PLUGWISE_USERNAME || 'smile',
      password: process.env.PLUGWISE_BASE_URL,
      pullPause: parseInt(process.env.PLUGWISE_PULL_PAUSE || '5000'),
    },
    mqtt: {
      dryRun: false,
      server: process.env.MQTT_SERVER,
      port: parseInt(process.env.MQTT_PORT || '1183'),
      topics: {},
    },
  }

  if ( fs.existsSync(CONFIG_FILE) ) {
    try {
      plugwiseConfig = {
        ...plugwiseBaseConfig,
        ...Object(
            yaml.safeLoad(fs.readFileSync(CONFIG_FILE, 'utf8')),
        ),
      }

      /**
       * Settings alreay contains a basic template which is merged with
       * environment variables and the config from the yaml file; obligatory
       * which have not been set will still be false
       *
       * @todo better validation
       */

      /*
      (!plugwiseConfig.plugwise ||
        typeof plugwiseConfig.plugwise.base_url === 'undefined' ||
        typeof plugwiseConfig.plugwise.password === 'undefined') &&
        logger.error({msg: 'Plugwise configuration option(s) missing'}) &&
        exit(1)
      */
    } catch (e) {
      logger.error({msg: 'loading config.yml failed', error: e})
      exit(1)
    }
  } else {
    logger.info({msg: 'No settings file found', file: CONFIG_FILE})

    if (!plugwiseBaseConfig.plugwise.baseUrl ||
        !plugwiseBaseConfig.plugwise.password ||
        !plugwiseBaseConfig.mqtt.server) {
      logger.error({
        msg: 'Missing required configuration options',
        config: plugwiseBaseConfig,
      })
      exit(1)
    }

    if (!Object.keys(plugwiseBaseConfig.mqtt.topics).length) {
      logger.warn('No MQTT topics have been set, not much will be published')
    }

    plugwiseConfig = <config>plugwiseBaseConfig
  }
})()

