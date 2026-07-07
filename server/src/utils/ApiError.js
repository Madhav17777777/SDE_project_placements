// Custom error class thrown from anywhere in the app (controllers, services,
// middlewares). The centralized error middleware knows how to turn one of
// these into the standard response envelope; anything that ISN'T an ApiError
// (a genuine bug) is treated as an unexpected 500 and logged with full stack.

class ApiError extends Error {
  /**
   * @param {number} statusCode - HTTP status code
   * @param {string} message - human readable message
   * @param {string[]} errors - field-level validation errors, if any
   * @param {string} [stack]
   */
  constructor(statusCode, message = 'Something went wrong', errors = [], stack = '') {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.success = false;
    this.errors = errors;
    this.data = null;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  static badRequest(message = 'Bad request', errors = []) {
    return new ApiError(400, message, errors);
  }

  static unauthorized(message = 'Unauthorized') {
    return new ApiError(401, message);
  }

  static forbidden(message = 'Forbidden') {
    return new ApiError(403, message);
  }

  static notFound(message = 'Resource not found') {
    return new ApiError(404, message);
  }

  static conflict(message = 'Conflict') {
    return new ApiError(409, message);
  }

  static internal(message = 'Internal server error') {
    return new ApiError(500, message);
  }
}

export default ApiError;
