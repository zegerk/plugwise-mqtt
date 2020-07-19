/**
 * Error handling wrapper
 */
export type ExtError = ExtErrorCode & ExtErrorParameters

export type ExtErrorParameters = {
  error?: Error
  attr?: ExtErrorAttributes
}

export type ExtErrorType = number
export type ExtErrorName = string
export type ExtErrorCodes = Record<ExtErrorName, ExtErrorCode>
export type ExtErrorCode = {code: ExtErrorType; message: string}

/**
 * Allow dumping just about anything in the extended
 * attributes
 */
export type ExtErrorAttributes = {
  [key: string]: string | boolean | object
}
