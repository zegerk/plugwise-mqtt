import type {ExtError, ExtErrorCode, ExtErrorParameters} from '../types/error'

/**
 * Main error class for converting error codes to
 */
export default abstract class AbstractError {
  /**
   * Error ID counter
   */
  private static errorId: number = 1000

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
   * @param {string} message
   * @param {ExtErrorParameters} errorParameters
   * @return {function}
   */
  static cBuild: Function = (message: string) =>
    AbstractError.build(AbstractError.errorId++, message)

  /**
   * Use curry to build function
   *
   * @param {number} code
   * @param {string} message
   * @param {ExtErrorParameters} errorParameters
   * @return {function}
   */
  static build: Function = (code: number, message: string) => (
    errorParameters?: ExtErrorParameters,
  ) =>
    AbstractError.error(
      {
        code,
        message,
      },
      errorParameters,
    )
}
