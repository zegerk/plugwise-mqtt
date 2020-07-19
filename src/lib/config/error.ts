import AbstractError from '../error'

/**
 * Errors for Config object
 */
export default class ConfigError extends AbstractError {
  static readonly errors = {
    loadingConfigFailed: AbstractError.buildErrorFunction({
      code: 201,
      message: 'Loading config failed',
    }),
    missingRequiredSettings: AbstractError.buildErrorFunction({
      code: 202,
      message: 'Missing required config settings',
    }),
  }
}
