/**
 * Error codes for Plugwise
 */
import {ExtError, ExtErrorAttributes} from '../error'

export enum PlugwiseError {
  NoDataRecieved,
  XmlParserError,
  GetRequestFailed,
  PutRequestFailed,
}

export const getRequestFailed = (
  error: Error,
): ExtError<PlugwiseError.GetRequestFailed> => ({
  type: PlugwiseError.GetRequestFailed,
  message: 'Get request to Plugwise failed',
  error: error,
})

export const putRequestFailed = (
  error: Error,
  attr: ExtErrorAttributes,
): ExtError<PlugwiseError.PutRequestFailed> => ({
  type: PlugwiseError.PutRequestFailed,
  message: 'Put request to Plugwise failed',
  error,
  attr,
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
