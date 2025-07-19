const asyncHandler = require('express-async-handler');
const { User, Presence } = require('../models');

// @desc    Dapatkan semua pengguna
// @route   GET /api/admin/users
// @access  Private (Admin only)
exports.getAllUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, role, search } = req.query;

  // Build query
  const query = {};

  if (role) {
    query.role = role;
  }

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }

  // Get users with pagination
  const users = await User.find(query)
    .select('-password')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await User.countDocuments(query);

  res.json({
    success: true,
    data: {
      users,
      pagination: {
        current: parseInt(page, 10),
        pages: Math.ceil(total / limit),
        total
      }
    }
  });
});

// @desc    Dapatkan pengguna berdasarkan ID
// @route   GET /api/admin/users/:id
// @access  Private (Admin only)
exports.getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User tidak ditemukan'
    });
  }

  res.json({
    success: true,
    data: {
      user
    }
  });
});

// @desc    Perbarui pengguna
// @route   PUT /api/admin/users/:id
// @access  Private (Admin only)
exports.updateUser = asyncHandler(async (req, res) => {
  const { name, email, role } = req.body;

  let user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User tidak ditemukan'
    });
  }

  user = await User.findByIdAndUpdate(
    req.params.id,
    { name, email, role },
    { new: true, runValidators: true }
  ).select('-password');

  res.json({
    success: true,
    message: 'User berhasil diupdate',
    data: {
      user
    }
  });
});

// @desc    Hapus pengguna
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin only)
exports.deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User tidak ditemukan'
    });
  }

  // Delete user's presence records
  await Presence.deleteMany({ user: req.params.id });

  // Delete user
  await User.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: 'User berhasil dihapus'
  });
});

// @desc    Dapatkan semua catatan kehadiran
// @route   GET /api/admin/presence
// @access  Private (Admin only)
exports.getAllPresence = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, userId, status, date } = req.query;

  // Build query
  const query = {};

  if (userId) {
    query.user = userId;
  }

  if (status) {
    query.status = status;
  }

  if (date) {
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);
    query.date = { $gte: startDate, $lte: endDate };
  }

  // Get presence records with pagination
  const presences = await Presence.find(query)
    .populate('user', 'name email role')
    .sort({ date: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Presence.countDocuments(query);

  res.json({
    success: true,
    data: {
      presences,
      pagination: {
        current: parseInt(page, 10),
        pages: Math.ceil(total / limit),
        total
      }
    }
  });
});

// @desc    Dapatkan statistik kehadiran
// @route   GET /api/admin/stats
// @access  Private (Admin only)
exports.getAttendanceStats = asyncHandler(async (req, res) => {
  const { month, year } = req.query;

  // Default to current month/year if not provided
  const currentDate = new Date();
  const targetYear = year ? parseInt(year, 10) : currentDate.getFullYear();
  const targetMonth = month ? parseInt(month, 10) : currentDate.getMonth() + 1;

  // Date range for the specified month
  const startDate = new Date(targetYear, targetMonth - 1, 1);
  const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59);

  // Get statistics
  const [totalUsers, totalPresenceThisMonth, ontimeCount, lateCount] =
    await Promise.all([
      User.countDocuments({ role: 'karyawan' }),
      Presence.countDocuments({
        date: { $gte: startDate, $lte: endDate }
      }),
      Presence.countDocuments({
        date: { $gte: startDate, $lte: endDate },
        status: 'ontime'
      }),
      Presence.countDocuments({
        date: { $gte: startDate, $lte: endDate },
        status: 'late'
      })
    ]);

  // Calculate working days in month (assuming Mon-Fri)
  const workingDays = getWorkingDaysInMonth(targetYear, targetMonth - 1);
  const attendanceRate =
    totalUsers > 0
      ? ((totalPresenceThisMonth / (totalUsers * workingDays)) * 100).toFixed(2)
      : 0;

  res.json({
    success: true,
    data: {
      totalUsers,
      totalPresenceThisMonth,
      ontimeCount,
      lateCount,
      workingDays,
      attendanceRate: parseFloat(attendanceRate),
      month: targetMonth,
      year: targetYear
    }
  });
});

// Helper function to calculate working days in a month
function getWorkingDaysInMonth(year, month) {
  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0);
  let workingDays = 0;

  for (
    let date = new Date(startDate);
    date <= endDate;
    date.setDate(date.getDate() + 1)
  ) {
    const dayOfWeek = date.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      // Not Sunday (0) or Saturday (6)
      workingDays++;
    }
  }

  return workingDays;
}
