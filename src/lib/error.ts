import type {ExtError, ExtErrorCode, ExtErrorParameters} from '../types/error'

/**
 * Main error class for converting error codes to
 */
export default abstract class AbstractError {
  /**
   * Error factory
   *
   * @param {ExtErrorCode} errorCode the error code
   * @param {ExtErrorParameters} errorParameters optional parameters
   *
   * @return {ExtError}
   */
  public static error(
    errorCode: ExtErrorCode,
    errorParameters?: ExtErrorParameters,
  ): ExtError {
    return {
      ...errorCode,
      ...errorParameters,
    }
  }

  /**
   * Use curry to build function
   *
   * @param {any} extErrorCode
   * @param {ExtErrorParameters} errorParameters
   * @return {function}
   */
  static buildErrorFunction: Function = (extErrorCode: {
    code: number
    message: string
  }) => (errorParameters?: ExtErrorParameters) =>
    AbstractError.error(
      {
        code: extErrorCode.code,
        message: extErrorCode.message,
      },
      errorParameters,
    )
}
