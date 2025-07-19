/**
 * Notification service for automatic notifications
 */

const { User, Presence, Notification } = require('../models');
const { dateHelper, logger } = require('../utils');

/**
 * Send daily attendance reminder
 */
exports.sendDailyAttendanceReminder = async () => {
  try {
    const now = new Date();
    const currentHour = now.getHours();

    // Send reminder at 7:30 AM
    if (currentHour !== 7 || now.getMinutes() !== 30) {
      return;
    }

    // Get all active employees
    const employees = await User.find({ role: 'karyawan' }).select('_id name');

    // Get today's presence records
    const { startOfDay, endOfDay } = dateHelper.getTodayDateRange();
    const todayPresences = await Presence.find({
      date: { $gte: startOfDay, $lt: endOfDay }
    }).distinct('user');

    // Find employees who haven't clocked in yet
    const employeesWithoutClockIn = employees.filter(
      (emp) =>
        !todayPresences.some(
          (presenceUserId) => presenceUserId.toString() === emp._id.toString()
        )
    );

    // Send reminder notifications
    const notifications = employeesWithoutClockIn.map((emp) => ({
      user: emp._id,
      title: 'Reminder: Jangan Lupa Absen',
      message: `Halo ${emp.name}, jangan lupa untuk melakukan absensi hari ini. Waktu kerja dimulai pukul 08:00.`,
      type: 'reminder',
      priority: 'medium',
      data: {
        reminderType: 'daily_attendance',
        sentAt: new Date()
      }
    }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
      logger.logInfo(
        `Sent daily attendance reminder to ${notifications.length} employees`
      );
    }
  } catch (error) {
    logger.logError('Error sending daily attendance reminder', error);
  }
};

/**
 * Send late arrival notifications
 */
exports.sendLateArrivalNotifications = async () => {
  try {
    const now = new Date();
    const currentHour = now.getHours();

    // Check at 8:15 AM for late arrivals
    if (currentHour !== 8 || now.getMinutes() !== 15) {
      return;
    }

    // Get today's late presences
    const { startOfDay, endOfDay } = dateHelper.getTodayDateRange();
    const latePresences = await Presence.find({
      date: { $gte: startOfDay, $lt: endOfDay },
      status: 'late'
    }).populate('user', 'name');

    // Send notifications to late employees
    const notifications = latePresences.map((presence) => ({
      user: presence.user._id,
      title: 'Keterlambatan Tercatat',
      message: `Anda terlambat melakukan clock in pada ${dateHelper.formatTime(
        presence.clock_in
      )}. Harap lebih memperhatikan waktu kedatangan.`,
      type: 'warning',
      priority: 'high',
      data: {
        presenceId: presence._id,
        clockInTime: presence.clock_in,
        notificationType: 'late_arrival'
      }
    }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
      logger.logInfo(
        `Sent late arrival notifications to ${notifications.length} employees`
      );
    }
  } catch (error) {
    logger.logError('Error sending late arrival notifications', error);
  }
};

/**
 * Send end of day clock out reminder
 */
exports.sendClockOutReminder = async () => {
  try {
    const now = new Date();
    const currentHour = now.getHours();

    // Send reminder at 5:00 PM
    if (currentHour !== 17 || now.getMinutes() !== 0) {
      return;
    }

    // Get today's presences without clock out
    const { startOfDay, endOfDay } = dateHelper.getTodayDateRange();
    const presencesWithoutClockOut = await Presence.find({
      date: { $gte: startOfDay, $lt: endOfDay },
      clock_out: { $exists: false }
    }).populate('user', 'name');

    // Send reminder notifications
    const notifications = presencesWithoutClockOut.map((presence) => ({
      user: presence.user._id,
      title: 'Reminder: Clock Out',
      message: `Halo ${presence.user.name}, jangan lupa untuk melakukan clock out sebelum pulang.`,
      type: 'reminder',
      priority: 'medium',
      data: {
        presenceId: presence._id,
        reminderType: 'clock_out',
        sentAt: new Date()
      }
    }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
      logger.logInfo(
        `Sent clock out reminder to ${notifications.length} employees`
      );
    }
  } catch (error) {
    logger.logError('Error sending clock out reminder', error);
  }
};

/**
 * Send weekly attendance summary
 */
exports.sendWeeklyAttendanceSummary = async () => {
  try {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const currentHour = now.getHours();

    // Send on Friday at 6:00 PM
    if (dayOfWeek !== 5 || currentHour !== 18 || now.getMinutes() !== 0) {
      return;
    }

    // Calculate week start and end
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay() + 1); // Monday
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 4); // Friday
    weekEnd.setHours(23, 59, 59, 999);

    // Get all employees
    const employees = await User.find({ role: 'karyawan' }).select('_id name');

    for (const employee of employees) {
      // Get employee's weekly presences
      const weeklyPresences = await Presence.find({
        user: employee._id,
        date: { $gte: weekStart, $lte: weekEnd }
      });

      const totalDays = weeklyPresences.length;
      const lateDays = weeklyPresences.filter(
        (p) => p.status === 'late'
      ).length;
      const ontimeDays = totalDays - lateDays;

      // Calculate total work hours
      const totalWorkMinutes = weeklyPresences.reduce((total, presence) => {
        if (presence.clock_in && presence.clock_out) {
          return (
            total +
            dateHelper.calculateWorkDuration(
              presence.clock_in,
              presence.clock_out
            )
          );
        }
        return total;
      }, 0);

      const totalWorkHours = Math.round((totalWorkMinutes / 60) * 100) / 100;

      // Create summary notification
      await Notification.createNotification(
        employee._id,
        'Ringkasan Absensi Minggu Ini',
        `Ringkasan minggu ini: ${totalDays} hari masuk, ${ontimeDays} tepat waktu, ${lateDays} terlambat. Total jam kerja: ${totalWorkHours} jam.`,
        'info',
        'medium',
        {
          weekStart,
          weekEnd,
          totalDays,
          ontimeDays,
          lateDays,
          totalWorkHours,
          summaryType: 'weekly'
        }
      );
    }

    logger.logInfo(
      `Sent weekly attendance summary to ${employees.length} employees`
    );
  } catch (error) {
    logger.logError('Error sending weekly attendance summary', error);
  }
};

/**
 * Clean old notifications
 */
exports.cleanOldNotifications = async () => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const result = await Notification.deleteMany({
      createdAt: { $lt: thirtyDaysAgo },
      isRead: true
    });

    if (result.deletedCount > 0) {
      logger.logInfo(`Cleaned ${result.deletedCount} old notifications`);
    }
  } catch (error) {
    logger.logError('Error cleaning old notifications', error);
  }
};

/**
 * Send birthday greetings
 */
exports.sendBirthdayGreetings = async () => {
  try {
    const now = new Date();
    const currentHour = now.getHours();

    // Send at 9:00 AM
    if (currentHour === 9 && now.getMinutes() === 0) {
      // Note: This would require a birthday field in User model
      // Implementation for birthday wishes would go here
    }
    // For now, we'll skip this feature
  } catch (error) {
    logger.logError('Error sending birthday greetings', error);
  }
};

/**
 * Send monthly attendance report notification
 */
exports.sendMonthlyReportNotification = async () => {
  try {
    const now = new Date();
    const dayOfMonth = now.getDate();
    const currentHour = now.getHours();

    // Send on the 1st of each month at 10:00 AM
    if (dayOfMonth !== 1 || currentHour !== 10 || now.getMinutes() !== 0) {
      return;
    }

    // Get all employees
    const employees = await User.find({ role: 'karyawan' }).select('_id name');

    // Get previous month data
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    for (const employee of employees) {
      const monthlyPresences = await Presence.find({
        user: employee._id,
        date: { $gte: lastMonth, $lt: thisMonth }
      });

      const totalDays = monthlyPresences.length;
      const lateDays = monthlyPresences.filter(
        (p) => p.status === 'late'
      ).length;
      const ontimeDays = totalDays - lateDays;

      const monthName = lastMonth.toLocaleDateString('id-ID', {
        month: 'long',
        year: 'numeric'
      });

      await Notification.createNotification(
        employee._id,
        `Laporan Absensi ${monthName}`,
        `Laporan bulan ${monthName}: ${totalDays} hari masuk, ${ontimeDays} tepat waktu, ${lateDays} terlambat.`,
        'info',
        'medium',
        {
          month: lastMonth.getMonth() + 1,
          year: lastMonth.getFullYear(),
          totalDays,
          ontimeDays,
          lateDays,
          reportType: 'monthly'
        }
      );
    }

    logger.logInfo(
      `Sent monthly report notifications to ${employees.length} employees`
    );
  } catch (error) {
    logger.logError('Error sending monthly report notifications', error);
  }
};
