/**
 * The error factory
 */
import errFact from '../error'

/**
 * Errors for Mapping object
 */
export default class MappingError {
  static readonly errors = {
    noDomainObjectsFound: errFact.cBuild('No domain objects found'),
  }
}
