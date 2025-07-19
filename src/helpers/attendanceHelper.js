/**
 * Attendance helper functions
 */

const { Presence, OfficeLocation } = require('../models');
const {
  getTodayDateRange,
  getMonthRange,
  isLate,
  calculateWorkDuration
} = require('../utils/dateHelper');
const {
  calculateDistance
} = require('../utils/locationHelper');

/**
 * Check if user can clock in
 * @param {string} userId - User ID
 * @returns {Object} Check result
 */
exports.canClockIn = async (userId) => {
  const { startOfDay, endOfDay } = getTodayDateRange();

  const existingPresence = await Presence.findOne({
    user: userId,
    date: { $gte: startOfDay, $lt: endOfDay }
  });

  return {
    canClockIn: !existingPresence,
    reason: existingPresence ? 'Sudah melakukan clock in hari ini' : null,
    existingPresence
  };
};

/**
 * Check if user can clock out
 * @param {string} userId - User ID
 * @returns {Object} Check result
 */
exports.canClockOut = async (userId) => {
  const { startOfDay, endOfDay } = getTodayDateRange();

  const todayPresence = await Presence.findOne({
    user: userId,
    date: { $gte: startOfDay, $lt: endOfDay }
  });

  if (!todayPresence) {
    return {
      canClockOut: false,
      reason: 'Belum melakukan clock in hari ini',
      presence: null
    };
  }

  if (todayPresence.clock_out) {
    return {
      canClockOut: false,
      reason: 'Sudah melakukan clock out hari ini',
      presence: todayPresence
    };
  }

  return {
    canClockOut: true,
    reason: null,
    presence: todayPresence
  };
};

/**
 * Validate location for attendance
 * @param {number} lat - User latitude
 * @param {number} lng - User longitude
 * @returns {Object} Validation result
 */
exports.validateAttendanceLocation = async (lat, lng) => {
  const officeLocation = await OfficeLocation.findOne();

  if (!officeLocation) {
    return {
      isValid: false,
      reason: 'Lokasi kantor belum dikonfigurasi',
      distance: null,
      officeLocation: null
    };
  }

  const distance = calculateDistance(
    lat,
    lng,
    officeLocation.lat,
    officeLocation.lng
  );
  const isValid = distance <= officeLocation.radius;

  return {
    isValid,
    reason: isValid
      ? null
      : `Anda berada di luar radius kantor (${distance}m dari kantor)`,
    distance,
    officeLocation
  };
};

/**
 * Calculate attendance status
 * @param {Date} clockInTime - Clock in time
 * @returns {string} Status (ontime/late)
 */
exports.calculateAttendanceStatus = (clockInTime) => {
  return isLate(clockInTime) ? 'late' : 'ontime';
};

/**
 * Get user attendance summary for a month
 * @param {string} userId - User ID
 * @param {number} year - Year
 * @param {number} month - Month (1-12)
 * @returns {Object} Attendance summary
 */
exports.getUserAttendanceSummary = async (userId, year, month) => {
  const { startOfMonth, endOfMonth } = getMonthRange(year, month);

  const presences = await Presence.find({
    user: userId,
    date: { $gte: startOfMonth, $lte: endOfMonth }
  }).sort({ date: 1 });

  const summary = {
    totalDays: presences.length,
    ontimeDays: presences.filter((p) => p.status === 'ontime').length,
    lateDays: presences.filter((p) => p.status === 'late').length,
    totalWorkHours: 0,
    averageWorkHours: 0,
    presences
  };

  // Calculate total work hours
  const workMinutes = presences.reduce((total, presence) => {
    if (presence.clock_in && presence.clock_out) {
      return (
        total + calculateWorkDuration(presence.clock_in, presence.clock_out)
      );
    }
    return total;
  }, 0);

  summary.totalWorkHours = Math.round((workMinutes / 60) * 100) / 100; // Hours with 2 decimal places
  summary.averageWorkHours =
    summary.totalDays > 0
      ? Math.round((summary.totalWorkHours / summary.totalDays) * 100) / 100
      : 0;

  return summary;
};

/**
 * Get attendance statistics for admin
 * @param {number} year - Year
 * @param {number} month - Month (1-12)
 * @returns {Object} Attendance statistics
 */
exports.getAttendanceStatistics = async (year, month) => {
  const { startOfMonth, endOfMonth } = getMonthRange(year, month);

  const [totalPresences, ontimeCount, lateCount, uniqueUsers] =
    await Promise.all([
      Presence.countDocuments({
        date: { $gte: startOfMonth, $lte: endOfMonth }
      }),
      Presence.countDocuments({
        date: { $gte: startOfMonth, $lte: endOfMonth },
        status: 'ontime'
      }),
      Presence.countDocuments({
        date: { $gte: startOfMonth, $lte: endOfMonth },
        status: 'late'
      }),
      Presence.distinct('user', {
        date: { $gte: startOfMonth, $lte: endOfMonth }
      })
    ]);

  return {
    totalPresences,
    ontimeCount,
    lateCount,
    activeUsers: uniqueUsers.length,
    ontimePercentage:
      totalPresences > 0 ? Math.round((ontimeCount / totalPresences) * 100) : 0,
    latePercentage:
      totalPresences > 0 ? Math.round((lateCount / totalPresences) * 100) : 0
  };
};

/**
 * Get today's attendance status for user
 * @param {string} userId - User ID
 * @returns {Object} Today's attendance status
 */
exports.getTodayAttendanceStatus = async (userId) => {
  const { startOfDay, endOfDay } = getTodayDateRange();

  const todayPresence = await Presence.findOne({
    user: userId,
    date: { $gte: startOfDay, $lt: endOfDay }
  });

  const status = {
    hasClockIn: !!todayPresence,
    hasClockOut: !!todayPresence?.clock_out,
    presence: todayPresence,
    canClockIn: !todayPresence,
    canClockOut: !!(todayPresence && !todayPresence.clock_out)
  };

  if (todayPresence) {
    status.workDuration = todayPresence.clock_out
      ? calculateWorkDuration(todayPresence.clock_in, todayPresence.clock_out)
      : null;
  }

  return status;
};

/**
 * Get late employees for today
 * @returns {Array} Array of late employees
 */
exports.getTodayLateEmployees = async () => {
  const { startOfDay, endOfDay } = getTodayDateRange();

  const latePresences = await Presence.find({
    date: { $gte: startOfDay, $lt: endOfDay },
    status: 'late'
  }).populate('user', 'name email');

  return latePresences;
};

/**
 * Get employees who haven't clocked in today
 * @returns {Array} Array of absent employees
 */
exports.getTodayAbsentEmployees = async () => {
  const { User } = require('../models');
  const { startOfDay, endOfDay } = getTodayDateRange();

  // Get all employees
  const allEmployees = await User.find({ role: 'karyawan' }).select(
    '_id name email'
  );

  // Get employees who have clocked in today
  const presentEmployees = await Presence.find({
    date: { $gte: startOfDay, $lt: endOfDay }
  }).distinct('user');

  // Filter absent employees
  const absentEmployees = allEmployees.filter(
    (employee) =>
      !presentEmployees.some(
        (presentId) => presentId.toString() === employee._id.toString()
      )
  );

  return absentEmployees;
};

/**
 * Check if it's still valid time to clock in (before 10 AM)
 * @returns {boolean} True if still valid time
 */
exports.isValidClockInTime = () => {
  const now = new Date();
  const cutoffTime = new Date();
  cutoffTime.setHours(10, 0, 0, 0); // 10:00 AM

  return now <= cutoffTime;
};

/**
 * Check if it's valid time to clock out (after 4 PM)
 * @returns {boolean} True if valid time to clock out
 */
exports.isValidClockOutTime = () => {
  const now = new Date();
  const minClockOutTime = new Date();
  minClockOutTime.setHours(16, 0, 0, 0); // 4:00 PM

  return now >= minClockOutTime;
};
