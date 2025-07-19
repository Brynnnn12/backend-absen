const jwt = require('jsonwebtoken');
const { User } = require('../models');

// Middleware untuk verifikasi token
exports.authenticate = async (req, res, next) => {
  try {
    const token =
      req.header('Authorization')?.replace('Bearer ', '') ||
      req.cookies.accessToken;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token tidak ditemukan, akses ditolak'
      });
    }

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Token tidak valid, user tidak ditemukan'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token sudah expired, silakan refresh token'
      });
    }

    res.status(401).json({
      success: false,
      message: 'Token tidak valid'
    });
  }
};

// Middleware untuk otorisasi berdasarkan role
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Anda tidak memiliki akses'
      });
    }

    next();
  };
};

// Middleware untuk validasi admin
exports.adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Akses hanya untuk admin'
    });
  }
  next();
};
