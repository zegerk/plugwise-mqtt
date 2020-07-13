/**
 * Error handling wrapper
 */
export interface ExtError<ErrorType extends number> {
  type: ErrorType
  message: string
  error?: Error
  attr?: ExtErrorAttributes
}

/**
 * Allow dumping just about anything in the extended
 * attributes
 */
export interface ExtErrorAttributes {
  [key: string]: string | boolean | object
}
