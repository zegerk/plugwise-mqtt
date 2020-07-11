/**
 * Error codes for Plugwise
 */
import {ExtError} from '../error'

export enum PlugwiseError {
  NoDataRecieved,
  XmlParserError,
  GetRequestFailed,
}

export const getRequestFailed = (
  error: Error,
): ExtError<PlugwiseError.GetRequestFailed> => ({
  type: PlugwiseError.GetRequestFailed,
  message: 'Get request to Plugwise faileds',
  error: error,
})

export const xmlParserError = (
  error: Error,
): ExtError<PlugwiseError.XmlParserError> => ({
  type: PlugwiseError.XmlParserError,
  message: 'Error parsing Plugwise XML',
  error: error,
})

export const noDataRecievedError = (): ExtError<
  PlugwiseError.NoDataRecieved
> => ({
  type: PlugwiseError.NoDataRecieved,
  message: 'No data received from Plugwise',
})
