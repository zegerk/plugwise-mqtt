import AbstractError from '../error'

/**
 * Errors for Mqtt object
 */
export default class MqttError extends AbstractError {
  static readonly errors = {
    failedClosingConnection: AbstractError.buildErrorFunction({
      code: 301,
      message: 'Failed closing connection',
    }),
    failedPublishing: AbstractError.buildErrorFunction({
      code: 302,
      message: 'Failed publishing',
    }),
    failedSubscribing: AbstractError.buildErrorFunction({
      code: 303,
      message: 'Failed subscribing',
    }),
    failedConnecting: AbstractError.buildErrorFunction({
      code: 304,
      message: 'Failed connecting',
    }),
  }
}
