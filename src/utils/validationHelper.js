/**
 * Validation utility functions
 */

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid email
 */
exports.isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} Validation result
 */
exports.validatePassword = (password) => {
  const result = {
    isValid: true,
    errors: []
  };

  if (!password || typeof password !== 'string') {
    result.isValid = false;
    result.errors.push('Password is required');
    return result;
  }

  if (password.length < 6) {
    result.isValid = false;
    result.errors.push('Password must be at least 6 characters long');
  }

  if (password.length > 50) {
    result.isValid = false;
    result.errors.push('Password must not exceed 50 characters');
  }

  if (!/(?=.*[a-z])/.test(password)) {
    result.errors.push('Password should contain at least one lowercase letter');
  }

  if (!/(?=.*[A-Z])/.test(password)) {
    result.errors.push('Password should contain at least one uppercase letter');
  }

  if (!/(?=.*\d)/.test(password)) {
    result.errors.push('Password should contain at least one number');
  }

  return result;
};

/**
 * Validate Indonesian phone number
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if valid
 */
exports.isValidIndonesianPhone = (phone) => {
  // Indonesian phone number patterns
  const phoneRegex = /^(\+62|62|0)8[1-9][0-9]{6,9}$/;
  return phoneRegex.test(phone.replace(/\s|-/g, ''));
};

/**
 * Validate MongoDB ObjectId
 * @param {string} id - ID to validate
 * @returns {boolean} True if valid ObjectId
 */
exports.isValidObjectId = (id) => {
  const objectIdRegex = /^[0-9a-fA-F]{24}$/;
  return objectIdRegex.test(id);
};

/**
 * Validate date string
 * @param {string} dateString - Date string to validate
 * @returns {boolean} True if valid date
 */
exports.isValidDate = (dateString) => {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
};

/**
 * Validate coordinates
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {Object} Validation result
 */
exports.validateCoordinates = (lat, lng) => {
  const result = {
    isValid: true,
    errors: []
  };

  if (typeof lat !== 'number' || isNaN(lat)) {
    result.isValid = false;
    result.errors.push('Latitude must be a valid number');
  } else if (lat < -90 || lat > 90) {
    result.isValid = false;
    result.errors.push('Latitude must be between -90 and 90');
  }

  if (typeof lng !== 'number' || isNaN(lng)) {
    result.isValid = false;
    result.errors.push('Longitude must be a valid number');
  } else if (lng < -180 || lng > 180) {
    result.isValid = false;
    result.errors.push('Longitude must be between -180 and 180');
  }

  return result;
};

/**
 * Validate time format (HH:MM)
 * @param {string} time - Time string to validate
 * @returns {boolean} True if valid time format
 */
exports.isValidTimeFormat = (time) => {
  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(time);
};

/**
 * Validate file extension
 * @param {string} filename - Filename to validate
 * @param {Array} allowedExtensions - Array of allowed extensions
 * @returns {boolean} True if valid extension
 */
exports.isValidFileExtension = (filename, allowedExtensions) => {
  const extension = filename.split('.').pop().toLowerCase();
  return allowedExtensions.includes(extension);
};

/**
 * Validate file size
 * @param {number} fileSize - File size in bytes
 * @param {number} maxSizeInMB - Maximum size in MB
 * @returns {boolean} True if valid size
 */
exports.isValidFileSize = (fileSize, maxSizeInMB) => {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  return fileSize <= maxSizeInBytes;
};

/**
 * Sanitize string input
 * @param {string} input - Input string to sanitize
 * @returns {string} Sanitized string
 */
exports.sanitizeString = (input) => {
  if (typeof input !== 'string') {
    return '';
  }

  return input
    .trim()
    .replace(/[<>'"]/g, '') // Remove potentially dangerous characters
    .substring(0, 255); // Limit length
};

/**
 * Validate pagination parameters
 * @param {string|number} page - Page number
 * @param {string|number} limit - Items per page
 * @returns {Object} Validated pagination parameters
 */
exports.validatePagination = (page, limit) => {
  const parsedPage = parseInt(page, 10) || 1;
  const parsedLimit = parseInt(limit, 10) || 10;

  return {
    page: Math.max(1, parsedPage),
    limit: Math.min(100, Math.max(1, parsedLimit)) // Max 100 items per page
  };
};

/**
 * Validate sort parameters
 * @param {string} sortBy - Field to sort by
 * @param {string} sortOrder - Sort order (asc/desc)
 * @param {Array} allowedFields - Array of allowed sort fields
 * @returns {Object} Validated sort parameters
 */
exports.validateSort = (sortBy, sortOrder, allowedFields) => {
  const validSortBy = allowedFields.includes(sortBy)
    ? sortBy
    : allowedFields[0];
  const validSortOrder = ['asc', 'desc'].includes(sortOrder)
    ? sortOrder
    : 'desc';

  return {
    sortBy: validSortBy,
    sortOrder: validSortOrder
  };
};
