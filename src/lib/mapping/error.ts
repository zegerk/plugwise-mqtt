import AbstractError from '../error'

/**
 * Errors for Mapping object
 */
export default class MappingError extends AbstractError {
  static readonly errors = {
    noDomainObjectsFound: AbstractError.buildErrorFunction({
      code: 101,
      message: 'No domain objects found',
    }),
  }
}
