const asyncHandler = require('express-async-handler');
const { Presence, OfficeLocation, Notification } = require('../models');
const { logger, dateHelper } = require('../utils');

// @desc    Clock in
// @route   POST /api/presence/clock-in
// @access  Private
exports.clockIn = asyncHandler(async (req, res) => {
  const { lat, lng } = req.body;
  const userId = req.user._id;

  // Dapatkan tanggal hari ini (awal hari)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Cek apakah pengguna sudah clock in hari ini
  const existingPresence = await Presence.findOne({
    user: userId,
    date: {
      $gte: today,
      $lt: tomorrow
    }
  });

  if (existingPresence) {
    return res.status(400).json({
      success: false,
      message: 'Anda sudah melakukan clock in hari ini'
    });
  }

  // Dapatkan lokasi kantor untuk validasi
  const officeLocation = await OfficeLocation.findOne();
  if (!officeLocation) {
    return res.status(400).json({
      success: false,
      message: 'Lokasi kantor belum dikonfigurasi'
    });
  }

  // Cek apakah pengguna berada dalam radius kantor
  const isWithinRadius = officeLocation.isWithinRadius(lat, lng);
  if (!isWithinRadius) {
    const distance = officeLocation.getDistanceFrom(lat, lng);
    return res.status(400).json({
      success: false,
      message: `Anda berada di luar radius kantor (${distance}m dari kantor)`
    });
  }

  // Determine status (late if after 8 AM)
  const clockInTime = new Date();
  const workStartTime = new Date();
  workStartTime.setHours(8, 0, 0, 0); // 08:00 AM

  const status = clockInTime > workStartTime ? 'late' : 'ontime';

  // Create presence record
  const presence = await Presence.create({
    user: userId,
    date: today,
    clock_in: clockInTime,
    location_in: { lat, lng },
    status
  });

  // Create notification for clock in
  const notificationTitle =
    status === 'late' ? 'Clock In Terlambat' : 'Clock In Berhasil';
  const notificationMessage =
    status === 'late'
      ? `Anda melakukan clock in terlambat pada ${dateHelper.formatTime(
        clockInTime
      )}. Harap lebih memperhatikan waktu kedatangan.`
      : `Anda berhasil melakukan clock in pada ${dateHelper.formatTime(
        clockInTime
      )}. Selamat bekerja!`;

  await Notification.createNotification(
    userId,
    notificationTitle,
    notificationMessage,
    'attendance',
    status === 'late' ? 'high' : 'medium',
    {
      presenceId: presence._id,
      clockInTime,
      status,
      location: { lat, lng }
    }
  );

  // Log attendance
  logger.logAttendance(userId, 'clock_in', {
    status,
    clockInTime,
    location: { lat, lng }
  });

  res.status(201).json({
    success: true,
    message: 'Clock in berhasil',
    data: {
      presence: {
        id: presence._id,
        clock_in: presence.clock_in,
        status: presence.status,
        location_in: presence.location_in
      }
    }
  });
});

// @desc    Clock out
// @route   POST /api/presence/clock-out
// @access  Private
exports.clockOut = asyncHandler(async (req, res) => {
  const { lat, lng } = req.body;
  const userId = req.user._id;

  // Get today's date
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Find today's presence record
  const presence = await Presence.findOne({
    user: userId,
    date: {
      $gte: today,
      $lt: tomorrow
    }
  });

  if (!presence) {
    return res.status(400).json({
      success: false,
      message: 'Anda belum melakukan clock in hari ini'
    });
  }

  if (presence.clock_out) {
    return res.status(400).json({
      success: false,
      message: 'Anda sudah melakukan clock out hari ini'
    });
  }

  // Get office location for validation
  const officeLocation = await OfficeLocation.findOne();
  if (!officeLocation) {
    return res.status(400).json({
      success: false,
      message: 'Lokasi kantor belum dikonfigurasi'
    });
  }

  // Cek apakah pengguna berada dalam radius kantor
  const isWithinRadius = officeLocation.isWithinRadius(lat, lng);
  if (!isWithinRadius) {
    const distance = officeLocation.getDistanceFrom(lat, lng);
    return res.status(400).json({
      success: false,
      message: `Anda berada di luar radius kantor (${distance}m dari kantor)`
    });
  }

  // Update presence record
  presence.clock_out = new Date();
  presence.location_out = { lat, lng };
  await presence.save();

  // Calculate work duration
  const workDuration = dateHelper.calculateWorkDuration(
    presence.clock_in,
    presence.clock_out
  );

  // Create notification for clock out
  await Notification.createNotification(
    userId,
    'Clock Out Berhasil',
    `Anda berhasil melakukan clock out pada ${dateHelper.formatTime(
      presence.clock_out
    )}. Total waktu kerja: ${dateHelper.formatDuration(workDuration)}.`,
    'attendance',
    'medium',
    {
      presenceId: presence._id,
      clockOutTime: presence.clock_out,
      workDuration,
      location: { lat, lng }
    }
  );

  // Log attendance
  logger.logAttendance(userId, 'clock_out', {
    clockOutTime: presence.clock_out,
    workDuration,
    location: { lat, lng }
  });

  res.json({
    success: true,
    message: 'Clock out berhasil',
    data: {
      presence: {
        id: presence._id,
        clock_in: presence.clock_in,
        clock_out: presence.clock_out,
        status: presence.status,
        workDuration: presence.workDuration,
        location_out: presence.location_out
      }
    }
  });
});

// @desc    Dapatkan riwayat kehadiran pengguna
// @route   GET /api/presence/history
// @access  Private
exports.getPresenceHistory = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { page = 1, limit = 10, month, year } = req.query;

  // Build query
  const query = { user: userId };

  if (month && year) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);
    query.date = { $gte: startDate, $lte: endDate };
  }

  // Get presence records with pagination
  const presences = await Presence.find(query)
    .sort({ date: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .populate('user', 'name email');

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

// @desc    Dapatkan status kehadiran hari ini
// @route   GET /api/presence/today
// @access  Private
exports.getTodayPresence = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // Get today's date
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const presence = await Presence.findOne({
    user: userId,
    date: {
      $gte: today,
      $lt: tomorrow
    }
  });

  res.json({
    success: true,
    data: {
      presence: presence || null,
      hasClockIn: !!presence,
      hasClockOut: !!presence?.clock_out
    }
  });
});
