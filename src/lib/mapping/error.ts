/**
 * Error codes for Plugwise
 */
import {ExtError} from '../error'

export enum MappingError {
  NoDomainObjectsFoundError,
  MissingRequiredSettingsError,
}

export const noDomainObjectsFoundError = (): ExtError<
  MappingError.NoDomainObjectsFoundError
> => ({
  type: MappingError.NoDomainObjectsFoundError,
  message: 'No domain objects found',
})
