import AbstractError from '../error'

/**
 * Errors for Mqtt object
 */
export default class PlugwiseError extends AbstractError {
  static readonly errors = {
    noDataRecieved: AbstractError.buildErrorFunction({
      code: 401,
      message: 'No data received from Plugwise',
    }),
    xmlParsingFailed: AbstractError.buildErrorFunction({
      code: 402,
      message: 'Failed parsing plugwise XML',
    }),
    getRequestFailed: AbstractError.buildErrorFunction({
      code: 403,
      message: 'GET request to Plugwise failed',
    }),
    putRequestFailed: AbstractError.buildErrorFunction({
      code: 404,
      message: 'PUT request to Plugwise failed',
    }),
  }
}
