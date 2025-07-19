/**
 * Email service using nodemailer
 */

const nodemailer = require('nodemailer');
const { logger } = require('../utils');

// Create transporter
const createTransporter = () => {
  // Cek apakah konfigurasi email tersedia
  const hasEmailConfig = process.env.EMAIL_HOST &&
                        process.env.EMAIL_USER &&
                        process.env.EMAIL_PASS;

  // In test mode only, use fake transporter
  if (process.env.NODE_ENV === 'test' || !hasEmailConfig) {
    return {
      sendMail: async (mailOptions) => {
        logger.logInfo('📧 [FAKE MODE] Email would be sent:', {
          to: mailOptions.to,
          subject: mailOptions.subject,
          from: mailOptions.from
        });

        return {
          messageId: 'fake-' + Date.now(),
          response: 'OK (Fake Mode - No Email Config)'
        };
      }
    };
  }

  // Real SMTP for development and production
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT, 10),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

/**
 * Send email
 * @param {Object} emailOptions - Email options
 * @returns {Promise} Email send result
 */
const sendEmail = async (emailOptions) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: emailOptions.to,
      subject: emailOptions.subject,
      html: emailOptions.html,
      text: emailOptions.text
    };

    const result = await transporter.sendMail(mailOptions);
    logger.logInfo(`Email sent successfully to ${emailOptions.to}`, {
      messageId: result.messageId,
      subject: emailOptions.subject
    });

    return {
      success: true,
      messageId: result.messageId
    };
  } catch (error) {
    logger.logError(`Failed to send email to ${emailOptions.to}`, error);
    throw error;
  }
};

/**
 * Send password reset email
 * @param {string} email - Recipient email
 * @param {string} userName - User name
 * @param {string} resetCode - Reset code
 * @returns {Promise} Email send result
 */
exports.sendPasswordResetEmail = async (email, userName, resetCode) => {
  const emailOptions = {
    to: email,
    subject: 'Reset Password - Sistem Absensi',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .reset-code { background: #007bff; color: white; padding: 15px; font-size: 24px; font-weight: bold; text-align: center; border-radius: 8px; margin: 20px 0; letter-spacing: 3px; }
          .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Reset Password</h1>
          </div>
          <div class="content">
            <h2>Halo ${userName}!</h2>
            <p>Kami menerima permintaan untuk reset password akun Anda di Sistem Absensi.</p>
            
            <p><strong>Kode Reset Password Anda:</strong></p>
            <div class="reset-code">${resetCode}</div>
            
            <div class="warning">
              <strong>⚠️ Penting:</strong>
              <ul>
                <li>Kode ini berlaku selama <strong>15 menit</strong></li>
                <li>Jangan bagikan kode ini kepada siapa pun</li>
                <li>Gunakan kode ini untuk reset password di aplikasi</li>
              </ul>
            </div>
            
            <p>Jika Anda tidak meminta reset password, abaikan email ini dan password Anda akan tetap aman.</p>
            
            <p>Untuk keamanan akun Anda, segera ganti password setelah berhasil reset.</p>
            
            <p>Terima kasih,<br><strong>Tim Sistem Absensi</strong></p>
          </div>
          <div class="footer">
            <p>Email ini dikirim secara otomatis, mohon tidak membalas email ini.</p>
            <p>© ${new Date().getFullYear()} Sistem Absensi. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Reset Password - Sistem Absensi
      
      Halo ${userName},
      
      Kami menerima permintaan untuk reset password akun Anda.
      
      Kode Reset Password: ${resetCode}
      
      Kode ini berlaku selama 15 menit. Jangan bagikan kode ini kepada siapa pun.
      
      Jika Anda tidak meminta reset password, abaikan email ini.
      
      Terima kasih,
      Tim Sistem Absensi
    `
  };

  return await sendEmail(emailOptions);
};

/**
 * Send welcome email
 * @param {string} email - Recipient email
 * @param {string} userName - User name
 * @returns {Promise} Email send result
 */
exports.sendWelcomeEmail = async (email, userName) => {
  const emailOptions = {
    to: email,
    subject: 'Selamat Datang di Sistem Absensi!',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .feature-list { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Selamat Datang!</h1>
          </div>
          <div class="content">
            <h2>Halo ${userName}!</h2>
            <p>Selamat datang di <strong>Sistem Absensi</strong>! Akun Anda telah berhasil dibuat dan siap digunakan.</p>
            
            <div class="feature-list">
              <h3>✨ Fitur yang dapat Anda gunakan:</h3>
              <ul>
                <li>📍 <strong>Absensi GPS</strong> - Clock in/out dengan validasi lokasi</li>
                <li>📊 <strong>Laporan Real-time</strong> - Lihat histori absensi Anda</li>
                <li>🔔 <strong>Notifikasi Otomatis</strong> - Pengingat dan update penting</li>
                <li>📱 <strong>Dashboard Personal</strong> - Pantau performa kehadiran</li>
                <li>🕐 <strong>Tracking Waktu Kerja</strong> - Hitung jam kerja otomatis</li>
              </ul>
            </div>
            
            <p><strong>Tips untuk memulai:</strong></p>
            <ol>
              <li>Login menggunakan email dan password yang Anda buat</li>
              <li>Pastikan GPS aktif saat melakukan absensi</li>
              <li>Clock in sebelum pukul 08:00 untuk tidak terlambat</li>
              <li>Jangan lupa clock out saat pulang</li>
            </ol>
            
            <p>Jika ada pertanyaan atau butuh bantuan, jangan ragu untuk menghubungi admin.</p>
            
            <p>Selamat bekerja!<br><strong>Tim Sistem Absensi</strong></p>
          </div>
          <div class="footer">
            <p>Email ini dikirim secara otomatis, mohon tidak membalas email ini.</p>
            <p>© ${new Date().getFullYear()} Sistem Absensi. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Selamat Datang di Sistem Absensi!
      
      Halo ${userName},
      
      Selamat datang di Sistem Absensi! Akun Anda telah berhasil dibuat.
      
      Fitur yang tersedia:
      - Absensi GPS dengan validasi lokasi
      - Laporan real-time
      - Notifikasi otomatis
      - Dashboard personal
      - Tracking waktu kerja
      
      Tips: Login dengan email dan password Anda, pastikan GPS aktif, dan clock in sebelum 08:00.
      
      Selamat bekerja!
      Tim Sistem Absensi
    `
  };

  return await sendEmail(emailOptions);
};

/**
 * Send attendance notification email
 * @param {string} email - Recipient email
 * @param {string} userName - User name
 * @param {string} type - Type (late, reminder, etc.)
 * @param {Object} data - Additional data
 * @returns {Promise} Email send result
 */
exports.sendAttendanceNotificationEmail = async (
  email,
  userName,
  type,
  data = {}
) => {
  let subject, html, text;

  switch (type) {
  case 'late':
    subject = '⚠️ Notifikasi Keterlambatan Absensi';
    html = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #dc3545 0%, #fd7e14 100%); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .warning { background: #f8d7da; border-left: 4px solid #dc3545; padding: 15px; margin: 20px 0; border-radius: 4px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>⚠️ Notifikasi Keterlambatan</h1>
            </div>
            <div class="content">
              <h2>Halo ${userName}!</h2>
              <div class="warning">
                <p><strong>Kami mencatat bahwa Anda terlambat melakukan clock in hari ini.</strong></p>
                <p>Waktu clock in: <strong>${
  data.clockInTime || 'N/A'
}</strong></p>
              </div>
              <p>Harap lebih memperhatikan waktu kedatangan untuk ke depannya. Waktu kerja dimulai pukul 08:00.</p>
              <p>Terima kasih atas pengertiannya.</p>
            </div>
          </div>
        </body>
        </html>
      `;
    text = `Notifikasi Keterlambatan\n\nHalo ${userName}, Anda terlambat clock in pada ${
      data.clockInTime || 'N/A'
    }. Harap lebih memperhatikan waktu kedatangan.`;
    break;

  case 'reminder':
    subject = '🔔 Reminder: Jangan Lupa Absen Hari Ini';
    html = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #007bff 0%, #6f42c1 100%); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .reminder-box { background: #d1ecf1; border-left: 4px solid #bee5eb; padding: 15px; margin: 20px 0; border-radius: 4px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔔 Reminder Absensi</h1>
            </div>
            <div class="content">
              <h2>Halo ${userName}!</h2>
              <div class="reminder-box">
                <p><strong>Ini adalah pengingat untuk melakukan absensi hari ini.</strong></p>
              </div>
              <p>Jangan lupa untuk:</p>
              <ul>
                <li>✅ Clock in saat tiba di kantor (sebelum 08:00)</li>
                <li>✅ Clock out saat pulang</li>
                <li>✅ Pastikan lokasi GPS Anda aktif</li>
              </ul>
              <p>Terima kasih!</p>
            </div>
          </div>
        </body>
        </html>
      `;
    text = `Reminder Absensi\n\nHalo ${userName}, jangan lupa untuk melakukan absensi hari ini. Clock in sebelum 08:00 dan pastikan GPS aktif.`;
    break;

  default:
    subject = '📊 Notifikasi Absensi';
    html = `<p>Halo ${userName}, ada update terkait absensi Anda.</p>`;
    text = `Halo ${userName}, ada update terkait absensi Anda.`;
  }

  const emailOptions = {
    to: email,
    subject,
    html,
    text
  };

  return await sendEmail(emailOptions);
};

/**
 * Send monthly report email
 * @param {string} email - Recipient email
 * @param {string} userName - User name
 * @param {Object} reportData - Report data
 * @returns {Promise} Email send result
 */
exports.sendMonthlyReportEmail = async (email, userName, reportData) => {
  const { month, year, totalDays, ontimeDays, lateDays, totalWorkHours } =
    reportData;

  const emailOptions = {
    to: email,
    subject: `📊 Laporan Absensi Bulanan - ${month}/${year}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .stats-table { background: white; border-radius: 8px; overflow: hidden; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .stats-table th { background: #007bff; color: white; padding: 12px; text-align: left; }
          .stats-table td { padding: 12px; border-bottom: 1px solid #eee; }
          .stats-table tr:nth-child(even) { background: #f8f9fa; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📊 Laporan Absensi Bulanan</h1>
          </div>
          <div class="content">
            <h2>Halo ${userName}!</h2>
            <p>Berikut adalah laporan absensi Anda untuk bulan <strong>${month}/${year}</strong>:</p>
            
            <table class="stats-table" style="width: 100%; border-collapse: collapse;">
              <tr>
                <th>Kategori</th>
                <th>Jumlah</th>
              </tr>
              <tr>
                <td><strong>Total Hari Masuk</strong></td>
                <td>${totalDays} hari</td>
              </tr>
              <tr>
                <td><strong>Tepat Waktu</strong></td>
                <td>${ontimeDays} hari</td>
              </tr>
              <tr>
                <td><strong>Terlambat</strong></td>
                <td>${lateDays} hari</td>
              </tr>
              <tr>
                <td><strong>Total Jam Kerja</strong></td>
                <td>${totalWorkHours} jam</td>
              </tr>
              <tr>
                <td><strong>Persentase Ketepatan Waktu</strong></td>
                <td>${
  totalDays > 0 ? Math.round((ontimeDays / totalDays) * 100) : 0
}%</td>
              </tr>
            </table>
            
            <p>Terima kasih atas dedikasi dan kerja keras Anda!</p>
            
            <p>Salam,<br><strong>Tim Sistem Absensi</strong></p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Laporan Absensi Bulanan ${month}/${year}
      
      Halo ${userName},
      
      Berikut laporan absensi Anda:
      - Total Hari Masuk: ${totalDays} hari
      - Tepat Waktu: ${ontimeDays} hari
      - Terlambat: ${lateDays} hari
      - Total Jam Kerja: ${totalWorkHours} jam
      - Persentase Ketepatan Waktu: ${
  totalDays > 0 ? Math.round((ontimeDays / totalDays) * 100) : 0
}%
      
      Terima kasih atas dedikasi Anda!
      
      Tim Sistem Absensi
    `
  };

  return await sendEmail(emailOptions);
};

/**
 * Test email configuration
 * @returns {Promise} Test result
 */
exports.testEmailConfiguration = async () => {
  try {
    const hasEmailConfig = process.env.EMAIL_HOST &&
                          process.env.EMAIL_USER &&
                          process.env.EMAIL_PASS;

    if (!hasEmailConfig) {
      logger.logInfo('📧 Email service: FAKE mode (no config)');
      return { success: true, mode: 'fake' };
    }

    const transporter = createTransporter();
    await transporter.verify();
    logger.logInfo('📧 Email service: READY (real emails enabled)');
    return { success: true, mode: 'real' };
  } catch (error) {
    logger.logError('❌ Email configuration test failed', error);
    return { success: false, error: error.message };
  }
};
