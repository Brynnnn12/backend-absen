/**
 * Logger utility functions
 */

const fs = require('fs');
const path = require('path');

// Create logs directory if it doesn't exist
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

/**
 * Log levels
 */
const LOG_LEVELS = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG'
};

/**
 * Get current timestamp
 * @returns {string} Formatted timestamp
 */
const getTimestamp = () => {
  return new Date().toISOString();
};

/**
 * Format log message
 * @param {string} level - Log level
 * @param {string} message - Log message
 * @param {Object} meta - Additional metadata
 * @returns {string} Formatted log message
 */
const formatLogMessage = (level, message, meta = {}) => {
  const timestamp = getTimestamp();
  const metaString =
    Object.keys(meta).length > 0 ? ` | Meta: ${JSON.stringify(meta)}` : '';
  return `[${timestamp}] [${level}] ${message}${metaString}\n`;
};

/**
 * Write log to file
 * @param {string} level - Log level
 * @param {string} message - Log message
 * @param {Object} meta - Additional metadata
 */
const writeToFile = (level, message, meta = {}) => {
  const logMessage = formatLogMessage(level, message, meta);
  const date = new Date().toISOString().split('T')[0];
  const filename = path.join(logsDir, `app-${date}.log`);

  fs.appendFileSync(filename, logMessage);
};

/**
 * Log error message
 * @param {string} message - Error message
 * @param {Error|Object} error - Error object or metadata
 */
exports.logError = (message, error = {}) => {
  const meta =
    error instanceof Error
      ? {
        stack: error.stack,
        name: error.name,
        message: error.message
      }
      : error;

  // Hanya tulis ke file, tidak ke console
  writeToFile(LOG_LEVELS.ERROR, message, meta);
};

/**
 * Log warning message
 * @param {string} message - Warning message
 * @param {Object} meta - Additional metadata
 */
exports.logWarning = (message, meta = {}) => {
  // Hanya tulis ke file, tidak ke console
  writeToFile(LOG_LEVELS.WARN, message, meta);
};

/**
 * Log info message
 * @param {string} message - Info message
 * @param {Object} meta - Additional metadata
 */
exports.logInfo = (message, meta = {}) => {
  // Hanya tulis ke file, tidak ke console
  writeToFile(LOG_LEVELS.INFO, message, meta);
};

/**
 * Log debug message (only in development)
 * @param {string} message - Debug message
 * @param {Object} meta - Additional metadata
 */
exports.logDebug = (message, meta = {}) => {
  if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line no-console
    console.log(`🐛 [DEBUG] ${message}`, meta);
    writeToFile(LOG_LEVELS.DEBUG, message, meta);
  }
};

/**
 * Log attendance activity
 * @param {string} userId - User ID
 * @param {string} action - Action performed (clock_in, clock_out)
 * @param {Object} details - Additional details
 */
exports.logAttendance = (userId, action, details = {}) => {
  const message = `User ${userId} performed ${action}`;
  const meta = {
    userId,
    action,
    timestamp: new Date(),
    ...details
  };

  this.logInfo(message, meta);
};

/**
 * Log authentication activity
 * @param {string} userId - User ID
 * @param {string} action - Action performed (login, logout, register)
 * @param {string} ip - IP address
 * @param {string} userAgent - User agent
 */
exports.logAuth = (userId, action, ip, userAgent) => {
  const message = `User ${userId} performed ${action}`;
  const meta = {
    userId,
    action,
    ip,
    userAgent,
    timestamp: new Date()
  };

  this.logInfo(message, meta);
};

/**
 * Log API request
 * @param {string} method - HTTP method
 * @param {string} url - Request URL
 * @param {string} userId - User ID (if authenticated)
 * @param {number} statusCode - Response status code
 * @param {number} responseTime - Response time in ms
 */
exports.logRequest = (method, url, userId, statusCode, responseTime) => {
  const message = `${method} ${url} - ${statusCode} (${responseTime}ms)`;
  const meta = {
    method,
    url,
    userId: userId || 'anonymous',
    statusCode,
    responseTime,
    timestamp: new Date()
  };

  if (statusCode >= 400) {
    this.logWarning(message, meta);
  } else {
    this.logInfo(message, meta);
  }
};

/**
 * Log database operation
 * @param {string} operation - Database operation (create, update, delete, find)
 * @param {string} collection - Collection/table name
 * @param {Object} details - Operation details
 */
exports.logDatabase = (operation, collection, details = {}) => {
  const message = `Database ${operation} on ${collection}`;
  const meta = {
    operation,
    collection,
    timestamp: new Date(),
    ...details
  };

  this.logDebug(message, meta);
};

/**
 * Log security event
 * @param {string} event - Security event type
 * @param {string} ip - IP address
 * @param {Object} details - Event details
 */
exports.logSecurity = (event, ip, details = {}) => {
  const message = `Security event: ${event} from ${ip}`;
  const meta = {
    event,
    ip,
    timestamp: new Date(),
    ...details
  };

  this.logWarning(message, meta);
};

/**
 * Clean old log files (older than specified days)
 * @param {number} daysToKeep - Number of days to keep logs
 */
exports.cleanOldLogs = (daysToKeep = 30) => {
  try {
    const files = fs.readdirSync(logsDir);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    files.forEach((file) => {
      if (file.startsWith('app-') && file.endsWith('.log')) {
        const filePath = path.join(logsDir, file);
        const stats = fs.statSync(filePath);

        if (stats.mtime < cutoffDate) {
          fs.unlinkSync(filePath);
          this.logInfo(`Deleted old log file: ${file}`);
        }
      }
    });
  } catch (error) {
    this.logError('Error cleaning old log files', error);
  }
};

/**
 * Get log statistics
 * @returns {Object} Log statistics
 */
exports.getLogStats = () => {
  try {
    const files = fs.readdirSync(logsDir);
    const logFiles = files.filter(
      (file) => file.startsWith('app-') && file.endsWith('.log')
    );

    let totalSize = 0;
    const fileStats = logFiles.map((file) => {
      const filePath = path.join(logsDir, file);
      const stats = fs.statSync(filePath);
      totalSize += stats.size;

      return {
        file,
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime
      };
    });

    return {
      totalFiles: logFiles.length,
      totalSize,
      files: fileStats
    };
  } catch (error) {
    this.logError('Error getting log statistics', error);
    return null;
  }
};
