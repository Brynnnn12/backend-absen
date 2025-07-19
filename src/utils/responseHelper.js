/**
 * Response utility functions for consistent API responses
 */

/**
 * Send success response
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Success message
 * @param {Object} data - Response data
 * @returns {Object} Response object
 */
exports.sendSuccess = (
  res,
  statusCode = 200,
  message = 'Success',
  data = null
) => {
  const response = {
    success: true,
    message,
    ...(data && { data })
  };

  return res.status(statusCode).json(response);
};

/**
 * Send error response
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Error message
 * @param {Object} errors - Error details
 * @returns {Object} Response object
 */
exports.sendError = (
  res,
  statusCode = 500,
  message = 'Internal Server Error',
  errors = null
) => {
  const response = {
    success: false,
    message,
    ...(errors && { errors })
  };

  return res.status(statusCode).json(response);
};

/**
 * Send paginated response
 * @param {Object} res - Express response object
 * @param {Array} data - Array of data
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @param {number} total - Total items
 * @param {string} message - Success message
 * @returns {Object} Response object
 */
exports.sendPaginatedResponse = (
  res,
  data,
  page,
  limit,
  total,
  message = 'Data retrieved successfully'
) => {
  const totalPages = Math.ceil(total / limit);

  const response = {
    success: true,
    message,
    data,
    pagination: {
      currentPage: parseInt(page, 10),
      totalPages,
      totalItems: total,
      itemsPerPage: parseInt(limit, 10),
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    }
  };

  return res.status(200).json(response);
};

/**
 * Send validation error response
 * @param {Object} res - Express response object
 * @param {Array|Object} errors - Validation errors
 * @returns {Object} Response object
 */
exports.sendValidationError = (res, errors) => {
  return this.sendError(res, 400, 'Validation Error', errors);
};

/**
 * Send unauthorized response
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @returns {Object} Response object
 */
exports.sendUnauthorized = (res, message = 'Unauthorized') => {
  return this.sendError(res, 401, message);
};

/**
 * Send forbidden response
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @returns {Object} Response object
 */
exports.sendForbidden = (res, message = 'Forbidden') => {
  return this.sendError(res, 403, message);
};

/**
 * Send not found response
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @returns {Object} Response object
 */
exports.sendNotFound = (res, message = 'Resource not found') => {
  return this.sendError(res, 404, message);
};

/**
 * Send created response
 * @param {Object} res - Express response object
 * @param {string} message - Success message
 * @param {Object} data - Response data
 * @returns {Object} Response object
 */
exports.sendCreated = (
  res,
  message = 'Resource created successfully',
  data = null
) => {
  return this.sendSuccess(res, 201, message, data);
};

/**
 * Send no content response
 * @param {Object} res - Express response object
 * @returns {Object} Response object
 */
exports.sendNoContent = (res) => {
  return res.status(204).send();
};

/**
 * Send bad request response
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @returns {Object} Response object
 */
exports.sendBadRequest = (res, message = 'Bad Request') => {
  return this.sendError(res, 400, message);
};

/**
 * Send conflict response
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @returns {Object} Response object
 */
exports.sendConflict = (res, message = 'Conflict') => {
  return this.sendError(res, 409, message);
};

/**
 * Send too many requests response
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @returns {Object} Response object
 */
exports.sendTooManyRequests = (res, message = 'Too Many Requests') => {
  return this.sendError(res, 429, message);
};
