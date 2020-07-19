/**
 * The error factory
 */
import errFact from '../error'

/**
 * Errors for Mqtt object
 */
export default class MqttError {
  static readonly errors = {
    failedClosingConnection: errFact.cBuild('Failed closing connection'),
    failedPublishing: errFact.cBuild('Failed publishing'),
    failedSubscribing: errFact.cBuild('Failed subscribing'),
    failedConnecting: errFact.cBuild('Failed connecting'),
  }
}
