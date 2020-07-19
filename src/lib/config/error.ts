/**
 * The error factory
 */
import errFact from '../error'

/**
 * Errors for Config object
 */
export default class ConfigError {
  static readonly errors = {
    loadingConfigFailed: errFact.cBuild('Loading config failed'),
    missingRequiredSettings: errFact.cBuild('Missing required config settings'),
  }
}
