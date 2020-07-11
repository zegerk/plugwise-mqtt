/**
 * Error handling wrapper
 */
export interface ExtError<ErrorType extends number> {
  type: ErrorType
  message: string
  error?: Error
}
