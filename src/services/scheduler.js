/**
 * Scheduler for automatic notifications and tasks
 */

const cron = require('node-cron');
const notificationService = require('./notificationService');
const { logger } = require('../utils');

/**
 * Initialize all scheduled tasks
 */
exports.initializeScheduler = () => {
  // Daily attendance reminder at 7:30 AM (Monday to Friday)
  cron.schedule(
    '30 7 * * 1-5',
    async () => {
      logger.logInfo('Running daily attendance reminder task');
      await notificationService.sendDailyAttendanceReminder();
    },
    {
      timezone: 'Asia/Jakarta'
    }
  );

  // Late arrival notifications at 8:15 AM (Monday to Friday)
  cron.schedule(
    '15 8 * * 1-5',
    async () => {
      logger.logInfo('Running late arrival notification task');
      await notificationService.sendLateArrivalNotifications();
    },
    {
      timezone: 'Asia/Jakarta'
    }
  );

  // Clock out reminder at 5:00 PM (Monday to Friday)
  cron.schedule(
    '0 17 * * 1-5',
    async () => {
      logger.logInfo('Running clock out reminder task');
      await notificationService.sendClockOutReminder();
    },
    {
      timezone: 'Asia/Jakarta'
    }
  );

  // Weekly attendance summary on Friday at 6:00 PM
  cron.schedule(
    '0 18 * * 5',
    async () => {
      logger.logInfo('Running weekly attendance summary task');
      await notificationService.sendWeeklyAttendanceSummary();
    },
    {
      timezone: 'Asia/Jakarta'
    }
  );

  // Monthly report notification on 1st of each month at 10:00 AM
  cron.schedule(
    '0 10 1 * *',
    async () => {
      logger.logInfo('Running monthly report notification task');
      await notificationService.sendMonthlyReportNotification();
    },
    {
      timezone: 'Asia/Jakarta'
    }
  );

  // Clean old notifications daily at 2:00 AM
  cron.schedule(
    '0 2 * * *',
    async () => {
      logger.logInfo('Running notification cleanup task');
      await notificationService.cleanOldNotifications();
    },
    {
      timezone: 'Asia/Jakarta'
    }
  );

  // Clean old logs weekly on Sunday at 3:00 AM
  cron.schedule(
    '0 3 * * 0',
    async () => {
      logger.logInfo('Running log cleanup task');
      logger.cleanOldLogs(30); // Keep logs for 30 days
    },
    {
      timezone: 'Asia/Jakarta'
    }
  );

  // Check for absent employees at 10:00 AM (Monday to Friday)
  cron.schedule(
    '0 10 * * 1-5',
    async () => {
      logger.logInfo('Running absent employee check task');
      await checkAbsentEmployees();
    },
    {
      timezone: 'Asia/Jakarta'
    }
  );

  logger.logInfo('Scheduler initialized successfully');
};

/**
 * Check for absent employees and notify admin
 */
const checkAbsentEmployees = async () => {
  try {
    const { User, Presence, Notification } = require('../models');
    const { dateHelper } = require('../utils');

    const { startOfDay, endOfDay } = dateHelper.getTodayDateRange();

    // Get all employees
    const allEmployees = await User.find({ role: 'karyawan' }).select(
      '_id name email'
    );

    // Get employees who have clocked in today
    const presentEmployees = await Presence.find({
      date: { $gte: startOfDay, $lt: endOfDay }
    }).distinct('user');

    // Find absent employees
    const absentEmployees = allEmployees.filter(
      (employee) =>
        !presentEmployees.some(
          (presentId) => presentId.toString() === employee._id.toString()
        )
    );

    if (absentEmployees.length > 0) {
      // Get admin users
      const admins = await User.find({ role: 'admin' }).select('_id');

      // Create notifications for admins
      const adminNotifications = admins.map((admin) => ({
        user: admin._id,
        title: 'Laporan Karyawan Tidak Hadir',
        message: `${
          absentEmployees.length
        } karyawan belum melakukan absensi hari ini: ${absentEmployees
          .map((emp) => emp.name)
          .join(', ')}`,
        type: 'warning',
        priority: 'high',
        data: {
          absentEmployees: absentEmployees.map((emp) => ({
            id: emp._id,
            name: emp.name,
            email: emp.email
          })),
          date: new Date(),
          reportType: 'absent_employees'
        }
      }));

      await Notification.insertMany(adminNotifications);
      logger.logInfo(
        `Notified admins about ${absentEmployees.length} absent employees`
      );
    }
  } catch (error) {
    logger.logError('Error checking absent employees', error);
  }
};
