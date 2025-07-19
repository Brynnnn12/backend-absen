/**
 * Date utility functions for attendance system
 */

/**
 * Get start and end of today
 * @returns {Object} { startOfDay, endOfDay }
 */
exports.getTodayDateRange = () => {
  const today = new Date();
  const startOfDay = new Date(today);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(today);
  endOfDay.setHours(23, 59, 59, 999);

  return { startOfDay, endOfDay };
};

/**
 * Get start and end of a specific date
 * @param {Date|string} date - The date
 * @returns {Object} { startOfDay, endOfDay }
 */
exports.getDateRange = (date) => {
  const targetDate = new Date(date);
  const startOfDay = new Date(targetDate);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(targetDate);
  endOfDay.setHours(23, 59, 59, 999);

  return { startOfDay, endOfDay };
};

/**
 * Get start and end of current month
 * @returns {Object} { startOfMonth, endOfMonth }
 */
exports.getCurrentMonthRange = () => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0,
    23,
    59,
    59,
    999
  );

  return { startOfMonth, endOfMonth };
};

/**
 * Get start and end of specific month
 * @param {number} year - The year
 * @param {number} month - The month (1-12)
 * @returns {Object} { startOfMonth, endOfMonth }
 */
exports.getMonthRange = (year, month) => {
  const startOfMonth = new Date(year, month - 1, 1);
  const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

  return { startOfMonth, endOfMonth };
};

/**
 * Calculate working days in a month (Monday to Friday)
 * @param {number} year - The year
 * @param {number} month - The month (0-11, JavaScript month indexing)
 * @returns {number} Number of working days
 */
exports.getWorkingDaysInMonth = (year, month) => {
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
};

/**
 * Check if current time is late (after 8 AM)
 * @param {Date} clockInTime - The clock in time
 * @returns {boolean} True if late
 */
exports.isLate = (clockInTime = new Date()) => {
  const workStartTime = new Date(clockInTime);
  workStartTime.setHours(8, 0, 0, 0); // 8:00 AM

  return clockInTime > workStartTime;
};

/**
 * Format duration in minutes to hours and minutes
 * @param {number} minutes - Duration in minutes
 * @returns {string} Formatted duration (e.g., "8h 30m")
 */
exports.formatDuration = (minutes) => {
  if (!minutes || minutes < 0) {
    return '0m';
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours === 0) {
    return `${remainingMinutes}m`;
  } else if (remainingMinutes === 0) {
    return `${hours}h`;
  } else {
    return `${hours}h ${remainingMinutes}m`;
  }
};

/**
 * Calculate work duration between clock in and clock out
 * @param {Date} clockIn - Clock in time
 * @param {Date} clockOut - Clock out time
 * @returns {number} Duration in minutes
 */
exports.calculateWorkDuration = (clockIn, clockOut) => {
  if (!clockIn || !clockOut) {
    return 0;
  }

  const duration = clockOut - clockIn;
  return Math.round(duration / (1000 * 60)); // Convert to minutes
};

/**
 * Get time difference from now
 * @param {Date} date - The date to compare
 * @returns {string} Time difference (e.g., "2 hours ago", "in 30 minutes")
 */
exports.getTimeAgo = (date) => {
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) {
    return 'just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }
};

/**
 * Check if date is weekend
 * @param {Date} date - The date to check
 * @returns {boolean} True if weekend
 */
exports.isWeekend = (date) => {
  const dayOfWeek = date.getDay();
  return dayOfWeek === 0 || dayOfWeek === 6; // Sunday or Saturday
};

/**
 * Get formatted date string
 * @param {Date} date - The date
 * @param {string} locale - Locale (default: 'id-ID')
 * @returns {string} Formatted date
 */
exports.formatDate = (date, locale = 'id-ID') => {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
};

/**
 * Get formatted time string
 * @param {Date} date - The date
 * @param {string} locale - Locale (default: 'id-ID')
 * @returns {string} Formatted time
 */
exports.formatTime = (date, locale = 'id-ID') => {
  return new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).format(date);
};
