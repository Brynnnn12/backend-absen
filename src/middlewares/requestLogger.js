/* eslint-disable no-trailing-spaces */
/**
 * Middleware untuk logging HTTP requests dengan informasi lengkap
 * Menampilkan method, route, response time, dan informasi user
 */

const { logger } = require('../utils');

/**
 * Middleware untuk logging setiap HTTP request
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware function
 */
const requestLogger = (req, res, next) => {
  // Catat waktu mulai request
  const startTime = Date.now();
  
  // Simpan original send method
  const originalSend = res.send;
  
  // Override res.send untuk menangkap response
  res.send = function(data) {
    // Hitung response time
    const responseTime = Date.now() - startTime;
    
    // Dapatkan informasi user jika tersedia
    const userInfo = req.user ? {
      userId: req.user._id,
      email: req.user.email,
      role: req.user.role
    } : null;
    
    // Format log message
    const logData = {
      method: req.method,
      route: req.originalUrl || req.url,
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      ...(userInfo && { user: userInfo }),
      timestamp: new Date().toISOString()
    };
    
    // Tentukan level log berdasarkan status code
    let logLevel = 'INFO';
    if (res.statusCode >= 400 && res.statusCode < 500) {
      logLevel = 'WARN';
    } else if (res.statusCode >= 500) {
      logLevel = 'ERROR';
    }
    
    // Log request dengan format yang rapi
    const message = `${req.method} ${req.originalUrl || req.url} - ${res.statusCode} - ${responseTime}ms`;
    
    // Log ke file (dengan detail lengkap) - tanpa console log
    if (logLevel === 'ERROR') {
      logger.logError(message, null, logData);
    } else if (logLevel === 'WARN') {
      logger.logWarning(message, logData);
    } else {
      logger.logInfo(message, logData);
    }
    
    // Log ke console dengan format sederhana saja
    /* eslint-disable no-console */
    console.log(`[${new Date().toLocaleString('id-ID')}] ${logLevel} ${message}`);
    if (userInfo) {
      console.log(`   User: ${userInfo.email} (${userInfo.role})`);
    }
    /* eslint-enable no-console */
    
    // Panggil original send method
    return originalSend.call(this, data);
  };
  
  next();
};

/**
 * Middleware khusus untuk logging authentication actions
 * @param {string} action - Jenis aksi (login, register, logout, dll)
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Object} additionalData - Data tambahan untuk log
 */
const logAuthAction = (action, req, res, additionalData = {}) => {
  // Hitung response time dari startTime yang disimpan di request
  const responseTime = req.startTime ? `${Date.now() - req.startTime}ms` : 'N/A';
  
  const authLogData = {
    method: req.method,
    route: req.originalUrl || req.url,
    action: action,
    statusCode: res.statusCode,
    responseTime: responseTime,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString(),
    ...additionalData
  };
  
  const message = `AUTH ${action.toUpperCase()} - ${req.method} ${req.originalUrl || req.url} - ${res.statusCode} - ${responseTime}`;
  
  // Log authentication action
  logger.logAuth(
    additionalData.userId || 'unknown',
    action,
    authLogData.ip,
    authLogData.userAgent,
    authLogData
  );
  
  // Console log untuk authentication (format sederhana)
  /* eslint-disable no-console */
  console.log(`[${new Date().toLocaleString('id-ID')}] AUTH ${message}`);
  if (additionalData.email) {
    console.log(`   Email: ${additionalData.email}`);
  }
  console.log('   ---');
  /* eslint-enable no-console */
};

/**
 * Middleware untuk tracking response time
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware function
 */
const responseTimeTracker = (req, res, next) => {
  const startTime = Date.now();
  
  // Simpan startTime di request object untuk digunakan nanti
  req.startTime = startTime;
  
  // Hook ke event 'finish' hanya untuk tracking, bukan untuk set header
  res.on('finish', () => {
    const responseTime = Date.now() - startTime;
    // Hanya log response time, jangan set header
    req.responseTime = responseTime;
  });
  
  next();
};

module.exports = {
  requestLogger,
  logAuthAction,
  responseTimeTracker
};
