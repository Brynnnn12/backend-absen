/**
 * Email helper functions for sending notifications
 */

/**
 * Generate welcome email template
 * @param {string} userName - User name
 * @param {string} userEmail - User email
 * @returns {Object} Email template
 */
exports.generateWelcomeEmail = (userName, userEmail) => {
  return {
    to: userEmail,
    subject: 'Selamat Datang di Sistem Absensi',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Selamat Datang, ${userName}!</h2>
        <p>Akun Anda telah berhasil dibuat di Sistem Absensi kami.</p>
        <p>Email: <strong>${userEmail}</strong></p>
        <p>Silakan login menggunakan kredensial yang telah Anda buat.</p>
        <hr>
        <p style="font-size: 12px; color: #666;">
          Email ini dikirim secara otomatis, mohon tidak membalas email ini.
        </p>
      </div>
    `,
    text: `Selamat Datang, ${userName}! Akun Anda telah berhasil dibuat di Sistem Absensi kami dengan email: ${userEmail}`
  };
};

/**
 * Generate attendance reminder email template
 * @param {string} userName - User name
 * @param {string} userEmail - User email
 * @returns {Object} Email template
 */
exports.generateAttendanceReminderEmail = (userName, userEmail) => {
  return {
    to: userEmail,
    subject: 'Reminder: Jangan Lupa Absen Hari Ini',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Reminder Absensi</h2>
        <p>Halo ${userName},</p>
        <p>Ini adalah pengingat untuk melakukan absensi hari ini.</p>
        <p>Jangan lupa untuk:</p>
        <ul>
          <li>Clock in saat tiba di kantor</li>
          <li>Clock out saat pulang</li>
          <li>Pastikan lokasi GPS Anda aktif</li>
        </ul>
        <p>Terima kasih!</p>
        <hr>
        <p style="font-size: 12px; color: #666;">
          Email ini dikirim secara otomatis, mohon tidak membalas email ini.
        </p>
      </div>
    `,
    text: `Halo ${userName}, jangan lupa untuk melakukan absensi hari ini!`
  };
};

/**
 * Generate late attendance notification email
 * @param {string} userName - User name
 * @param {string} userEmail - User email
 * @param {Date} clockInTime - Clock in time
 * @returns {Object} Email template
 */
exports.generateLateAttendanceEmail = (userName, userEmail, clockInTime) => {
  const timeString = clockInTime.toLocaleTimeString('id-ID');

  return {
    to: userEmail,
    subject: 'Notifikasi: Keterlambatan Absensi',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #ff6b35;">Notifikasi Keterlambatan</h2>
        <p>Halo ${userName},</p>
        <p>Kami mencatat bahwa Anda terlambat melakukan clock in pada:</p>
        <p><strong>Waktu: ${timeString}</strong></p>
        <p>Harap lebih memperhatikan waktu kedatangan untuk ke depannya.</p>
        <p>Terima kasih atas pengertiannya.</p>
        <hr>
        <p style="font-size: 12px; color: #666;">
          Email ini dikirim secara otomatis, mohon tidak membalas email ini.
        </p>
      </div>
    `,
    text: `Halo ${userName}, Anda terlambat melakukan clock in pada ${timeString}. Harap lebih memperhatikan waktu kedatangan.`
  };
};

/**
 * Generate monthly attendance report email
 * @param {string} userName - User name
 * @param {string} userEmail - User email
 * @param {Object} attendanceSummary - Attendance summary data
 * @returns {Object} Email template
 */
exports.generateMonthlyReportEmail = (
  userName,
  userEmail,
  attendanceSummary
) => {
  const { totalDays, ontimeDays, lateDays, totalWorkHours, month, year } =
    attendanceSummary;

  return {
    to: userEmail,
    subject: `Laporan Absensi Bulanan - ${month}/${year}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Laporan Absensi Bulanan</h2>
        <p>Halo ${userName},</p>
        <p>Berikut adalah laporan absensi Anda untuk bulan ${month}/${year}:</p>
        <table style="border-collapse: collapse; width: 100%; margin: 20px 0;">
          <tr style="background-color: #f5f5f5;">
            <td style="border: 1px solid #ddd; padding: 8px;"><strong>Total Hari Masuk</strong></td>
            <td style="border: 1px solid #ddd; padding: 8px;">${totalDays} hari</td>
          </tr>
          <tr>
            <td style="border: 1px solid #ddd; padding: 8px;"><strong>Tepat Waktu</strong></td>
            <td style="border: 1px solid #ddd; padding: 8px;">${ontimeDays} hari</td>
          </tr>
          <tr style="background-color: #f9f9f9;">
            <td style="border: 1px solid #ddd; padding: 8px;"><strong>Terlambat</strong></td>
            <td style="border: 1px solid #ddd; padding: 8px;">${lateDays} hari</td>
          </tr>
          <tr>
            <td style="border: 1px solid #ddd; padding: 8px;"><strong>Total Jam Kerja</strong></td>
            <td style="border: 1px solid #ddd; padding: 8px;">${totalWorkHours} jam</td>
          </tr>
        </table>
        <p>Terima kasih atas dedikasi Anda!</p>
        <hr>
        <p style="font-size: 12px; color: #666;">
          Email ini dikirim secara otomatis, mohon tidak membalas email ini.
        </p>
      </div>
    `,
    text: `Laporan Absensi ${month}/${year} - Total: ${totalDays} hari, Tepat waktu: ${ontimeDays}, Terlambat: ${lateDays}, Jam kerja: ${totalWorkHours} jam`
  };
};

/**
 * Generate password reset email template
 * @param {string} userName - User name
 * @param {string} userEmail - User email
 * @param {string} resetToken - Password reset token
 * @returns {Object} Email template
 */
exports.generatePasswordResetEmail = (userName, userEmail, resetToken) => {
  return {
    to: userEmail,
    subject: 'Reset Password - Sistem Absensi',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Reset Password</h2>
        <p>Halo ${userName},</p>
        <p>Kami menerima permintaan untuk reset password akun Anda.</p>
        <p>Kode reset password: <strong style="font-size: 18px; color: #007bff;">${resetToken}</strong></p>
        <p>Kode ini berlaku selama 15 menit.</p>
        <p>Jika Anda tidak meminta reset password, abaikan email ini.</p>
        <hr>
        <p style="font-size: 12px; color: #666;">
          Email ini dikirim secara otomatis, mohon tidak membalas email ini.
        </p>
      </div>
    `,
    text: `Halo ${userName}, kode reset password Anda: ${resetToken}. Berlaku selama 15 menit.`
  };
};

/**
 * Generate admin notification email for late employees
 * @param {string} adminEmail - Admin email
 * @param {Array} lateEmployees - Array of late employees
 * @param {Date} date - Date
 * @returns {Object} Email template
 */
exports.generateLateEmployeesNotificationEmail = (
  adminEmail,
  lateEmployees,
  date
) => {
  const dateString = date.toLocaleDateString('id-ID');
  const lateList = lateEmployees
    .map(
      (emp) =>
        `- ${emp.user.name} (${
          emp.user.email
        }) - Clock in: ${emp.clock_in.toLocaleTimeString('id-ID')}`
    )
    .join('\n');

  return {
    to: adminEmail,
    subject: `Laporan Keterlambatan - ${dateString}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #ff6b35;">Laporan Keterlambatan Karyawan</h2>
        <p>Tanggal: <strong>${dateString}</strong></p>
        <p>Karyawan yang terlambat hari ini:</p>
        <ul>
          ${lateEmployees
    .map(
      (emp) =>
        `<li>${emp.user.name} (${
          emp.user.email
        }) - Clock in: ${emp.clock_in.toLocaleTimeString('id-ID')}</li>`
    )
    .join('')}
        </ul>
        <p>Total karyawan terlambat: <strong>${
  lateEmployees.length
}</strong></p>
        <hr>
        <p style="font-size: 12px; color: #666;">
          Email ini dikirim secara otomatis, mohon tidak membalas email ini.
        </p>
      </div>
    `,
    text: `Laporan Keterlambatan ${dateString}:\n${lateList}\n\nTotal: ${lateEmployees.length} karyawan`
  };
};

/**
 * Format email for sending (can be extended with actual email service)
 * @param {Object} emailTemplate - Email template object
 * @returns {Object} Formatted email object
 */
exports.formatEmail = (emailTemplate) => {
  return {
    to: emailTemplate.to,
    subject: emailTemplate.subject,
    html: emailTemplate.html,
    text: emailTemplate.text,
    timestamp: new Date()
  };
};
