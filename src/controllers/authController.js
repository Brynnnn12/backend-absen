const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const {
  User,
  RefreshToken,
  PasswordReset,
  Notification
} = require('../models');
const { logger } = require('../utils');
const emailService = require('../services/emailService');
const { logAuthAction } = require('../middlewares/requestLogger');

// @desc    Daftar pengguna
// @route   POST /api/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  // Cek apakah pengguna sudah ada
  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json({
      success: false,
      message: 'Email sudah terdaftar'
    });
  }

  // Buat pengguna baru
  const user = await User.create({
    name,
    email,
    password,
    role: role || 'karyawan'
  });

  // Generate tokens
  const accessToken = user.generateAuthToken();
  const refreshToken = user.generateRefreshToken();

  // Simpan refresh token ke database
  await RefreshToken.create({
    user: user._id,
    token: refreshToken,
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    deviceInfo: {
      userAgent: req.headers['user-agent'],
      ip: req.ip,
      deviceType: req.device?.type || 'unknown'
    }
  });

  // Buat notifikasi selamat datang
  await Notification.createNotification(
    user._id,
    'Selamat Datang!',
    `Halo ${name}, selamat datang di sistem absensi. Jangan lupa untuk melakukan absensi setiap hari.`,
    'info',
    'medium'
  );

  // Kirim email selamat datang
  try {
    await emailService.sendWelcomeEmail(user.email, user.name);
  } catch (error) {
    logger.logError('Failed to send welcome email', error, {
      email: user.email,
      userId: user._id
    });
    // Jangan gagalkan registrasi jika email gagal
  }

  // Set cookies
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 15 * 60 * 1000 // 15 menit
  });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 hari
  });

  // Log registrasi
  logger.logAuth(user._id, 'register', req.ip, req.headers['user-agent']);

  res.status(201).json({
    success: true,
    message: 'User berhasil didaftarkan',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      accessToken,
      refreshToken
    }
  });
});

// @desc    Login pengguna
// @route   POST /api/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Cek apakah pengguna ada
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Email atau password salah'
    });
  }

  // Cek password
  const isPasswordMatch = await user.comparePassword(password);
  if (!isPasswordMatch) {
    return res.status(401).json({
      success: false,
      message: 'Email atau password salah'
    });
  }

  // Nonaktifkan refresh token lama untuk pengguna ini
  await RefreshToken.updateMany(
    { user: user._id, isActive: true },
    { isActive: false }
  );

  // Generate token baru
  const accessToken = user.generateAuthToken();
  const refreshToken = user.generateRefreshToken();

  // Simpan refresh token ke database
  await RefreshToken.create({
    user: user._id,
    token: refreshToken,
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    deviceInfo: {
      userAgent: req.headers['user-agent'],
      ip: req.ip,
      deviceType: req.device?.type || 'unknown'
    }
  });

  // Buat notifikasi login
  await Notification.createNotification(
    user._id,
    'Login Berhasil',
    `Anda berhasil login pada ${new Date().toLocaleString('id-ID')}`,
    'info',
    'low'
  );

  // Set cookies
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 15 * 60 * 1000 // 15 menit
  });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 hari
  });

  // Log login
  logger.logAuth(user._id, 'login', req.ip, req.headers['user-agent']);

  const responseData = {
    success: true,
    message: 'Login berhasil',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      accessToken,
      refreshToken
    }
  };

  // Set status code terlebih dahulu
  res.status(200);

  // Log authentication action dengan detail lengkap
  logAuthAction('login', req, res, {
    userId: user._id,
    email: user.email,
    role: user.role,
    name: user.name
  });

  res.json(responseData);
});

// @desc    Refresh access token
// @route   POST /api/auth/refresh
// @access  Public
exports.refresh = asyncHandler(async (req, res) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    return res.status(401).json({
      success: false,
      message: 'Refresh token tidak ditemukan'
    });
  }

  try {
    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    // Cek apakah refresh token ada di database
    const tokenRecord = await RefreshToken.findOne({
      token: refreshToken,
      user: decoded.id,
      isActive: true
    });

    if (!tokenRecord || !tokenRecord.isValid()) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token tidak valid'
      });
    }

    // Dapatkan pengguna
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User tidak ditemukan'
      });
    }

    // Generate new access token
    const newAccessToken = user.generateAuthToken();

    // Set new access token cookie
    res.cookie('accessToken', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 15 * 60 * 1000 // 15 minutes
    });

    res.json({
      success: true,
      message: 'Token berhasil diperbarui',
      data: {
        accessToken: newAccessToken
      }
    });
  } catch {
    res.status(401).json({
      success: false,
      message: 'Refresh token tidak valid'
    });
  }
});

// @desc    Logout pengguna
// @route   POST /api/auth/logout
// @access  Private
exports.logout = asyncHandler(async (req, res) => {
  const { refreshToken } = req.cookies;

  if (refreshToken) {
    // Deactivate refresh token
    await RefreshToken.updateOne({ token: refreshToken }, { isActive: false });
  }

  // Clear cookies
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');

  // Log logout
  logger.logAuth(
    req.user?.id || 'unknown',
    'logout',
    req.ip,
    req.headers['user-agent']
  );

  res.json({
    success: true,
    message: 'Logout berhasil'
  });
});

// @desc    Logout dari semua perangkat
// @route   POST /api/auth/logout-all
// @access  Private
exports.logoutAll = asyncHandler(async (req, res) => {
  // Deactivate all refresh tokens for this user
  await RefreshToken.updateMany(
    { user: req.user.id, isActive: true },
    { isActive: false }
  );

  // Clear cookies
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');

  // Log logout all
  logger.logAuth(req.user.id, 'logout-all', req.ip, req.headers['user-agent']);

  res.json({
    success: true,
    message: 'Logout dari semua perangkat berhasil'
  });
});

// @desc    Lupa password
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  // Cek apakah pengguna ada
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'Email tidak ditemukan'
    });
  }

  // Generate reset code
  const resetCode = user.generatePasswordResetCode();

  // Create password reset record
  await PasswordReset.create({
    user: user._id,
    email: user.email,
    resetCode,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent']
  });

  try {
    // Send email with reset code
    await emailService.sendPasswordResetEmail(user.email, user.name, resetCode);

    // Create notification as backup
    await Notification.createNotification(
      user._id,
      'Kode Reset Password Dikirim',
      `Kode reset password telah dikirim ke email ${user.email}. Silakan cek email Anda.`,
      'system',
      'high',
      { resetCode, type: 'password_reset' }
    );

    // Log forgot password
    logger.logSecurity('forgot-password', req.ip, { email, userId: user._id });

    res.json({
      success: true,
      message:
        'Kode reset password telah dikirim ke email Anda. Silakan cek email dan folder spam.'
    });
  } catch (error) {
    logger.logError('Failed to send reset password email', error, {
      email,
      userId: user._id
    });

    // If email fails, at least create notification
    await Notification.createNotification(
      user._id,
      'Kode Reset Password',
      `Kode reset password Anda: ${resetCode}. Kode berlaku selama 15 menit.`,
      'system',
      'high',
      { resetCode, type: 'password_reset' }
    );

    res.json({
      success: true,
      message:
        'Kode reset password telah dikirim melalui notifikasi. Silakan cek notifikasi Anda.'
    });
  }
});

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
exports.resetPassword = asyncHandler(async (req, res) => {
  const { email, resetCode, newPassword } = req.body;

  // Find password reset record
  const resetRecord = await PasswordReset.findOne({
    email,
    resetCode,
    isUsed: false
  });

  if (!resetRecord || !resetRecord.isValid()) {
    return res.status(400).json({
      success: false,
      message: 'Kode reset tidak valid atau sudah kadaluarsa'
    });
  }

  // Get user
  const user = await User.findById(resetRecord.user);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User tidak ditemukan'
    });
  }

  // Update password
  user.password = newPassword;
  await user.save();

  // Mark reset code as used
  await resetRecord.markAsUsed();

  // Deactivate all refresh tokens for this user
  await RefreshToken.updateMany(
    { user: user._id, isActive: true },
    { isActive: false }
  );

  // Create notification
  await Notification.createNotification(
    user._id,
    'Password Berhasil Direset',
    'Password Anda telah berhasil direset. Jika ini bukan Anda, segera hubungi admin.',
    'system',
    'high'
  );

  // Log password reset
  logger.logSecurity('password-reset', req.ip, { email, userId: user._id });

  res.json({
    success: true,
    message: 'Password berhasil direset. Silakan login dengan password baru.'
  });
});

// @desc    Dapatkan pengguna saat ini
// @route   GET /api/auth/me
// @access  Private
exports.getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');

  // Dapatkan hitungan notifikasi yang belum dibaca
  const unreadNotifications = await Notification.countDocuments({
    user: req.user.id,
    isRead: false
  });

  res.json({
    success: true,
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        unreadNotifications
      }
    }
  });
});

// @desc    Change password
// @route   POST /api/auth/change-password
// @access  Private
exports.changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  // Get user
  const user = await User.findById(req.user.id);

  // Check current password
  const isPasswordMatch = await user.comparePassword(currentPassword);
  if (!isPasswordMatch) {
    return res.status(400).json({
      success: false,
      message: 'Password saat ini salah'
    });
  }

  // Update password
  user.password = newPassword;
  await user.save();

  // Deactivate all refresh tokens except current one
  const currentRefreshToken = req.cookies.refreshToken;
  await RefreshToken.updateMany(
    {
      user: user._id,
      isActive: true,
      token: { $ne: currentRefreshToken }
    },
    { isActive: false }
  );

  // Create notification
  await Notification.createNotification(
    user._id,
    'Password Berhasil Diubah',
    'Password Anda telah berhasil diubah. Jika ini bukan Anda, segera hubungi admin.',
    'system',
    'medium'
  );

  // Log password change
  logger.logSecurity('password-change', req.ip, { userId: user._id });

  res.json({
    success: true,
    message: 'Password berhasil diubah'
  });
});
