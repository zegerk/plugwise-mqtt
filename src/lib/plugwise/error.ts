/**
 * The error factory
 */
import errFact from '../error'

/**
 * Errors for Mqtt object
 */
export default class PlugwiseError {
  static readonly errors = {
    noDataRecieved: errFact.cBuild('No data received from Plugwise'),
    xmlParsingFailed: errFact.cBuild('Failed parsing plugwise XML'),
    getRequestFailed: errFact.cBuild('GET request to Plugwise failed'),
    putRequestFailed: errFact.cBuild('PUT request to Plugwise failed'),
  }
}
