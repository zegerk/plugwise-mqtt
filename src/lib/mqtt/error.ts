/**
 * Error codes for Plugwise
 */
import {ExtError, ExtErrorAttributes} from '../error'

export enum MqttError {
  FailedClosingConnectionsError,
  PublishingError,
  SubscribeError,
  ConnectError,
}

export const connectError = (
  error: Error,
): ExtError<MqttError.ConnectError> => ({
  type: MqttError.ConnectError,
  message: 'Failed connecting to MQTT',
  error,
})

export const failedClosingConnectionsError = (): ExtError<
  MqttError.FailedClosingConnectionsError
> => ({
  type: MqttError.FailedClosingConnectionsError,
  message: 'No domain objects found',
})

export const subscribeError = (
  error: Error,
  attr: ExtErrorAttributes,
): ExtError<MqttError.SubscribeError> => ({
  type: MqttError.SubscribeError,
  message: 'Subscribing to topic failed',
  error,
  attr,
})

export const publishingError = (
  error: Error,
  attr: ExtErrorAttributes,
): ExtError<MqttError.PublishingError> => ({
  type: MqttError.PublishingError,
  message: 'Publishing message failed',
  error,
  attr,
})
