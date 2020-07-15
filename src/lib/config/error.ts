/**
 * Error codes for Plugwise
 */
import {ExtError, ExtErrorAttributes} from '../error'

export enum ConfigError {
  ConfigLoadingError,
  MissingRequiredSettingsError,
}

export const configLoadingError = (
  error: Error,
): ExtError<ConfigError.ConfigLoadingError> => ({
  type: ConfigError.ConfigLoadingError,
  message: 'Loading config failed',
  error,
})

export const missingRequiredSettingsError = (
  attr: ExtErrorAttributes,
): ExtError<ConfigError.MissingRequiredSettingsError> => ({
  type: ConfigError.MissingRequiredSettingsError,
  message: 'Missing required config settings',
  attr,
})
