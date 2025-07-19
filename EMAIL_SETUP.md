# Email Configuration Guide

## Setup Email untuk Forgot Password & Welcome Email

### 1. Konfigurasi .env

Update file `.env` dengan konfigurasi email Anda:

```env
# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=Sistem Absensi <your-email@gmail.com>
```

### 2. Setup Gmail App Password (Recommended)

Jika menggunakan Gmail:

1. Buka Google Account Settings
2. Pilih Security → 2-Step Verification
3. Generate App Password untuk aplikasi
4. Gunakan App Password sebagai `EMAIL_PASS`

### 3. Fitur Email yang Tersedia

#### Forgot Password

- **Endpoint**: `POST /api/auth/forgot-password`
- **Body**: `{ "email": "user@example.com" }`
- **Response**: Mengirim kode reset 6 digit ke email user
- **Fallback**: Jika email gagal, akan kirim notifikasi internal

#### Welcome Email

- **Trigger**: Saat user register
- **Otomatis**: Dikirim setelah registrasi berhasil
- **Fallback**: Registrasi tetap berhasil meski email gagal

### 4. Test Endpoints

#### Test Forgot Password

```bash
curl -X POST http://localhost:5000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

#### Test Register (dengan welcome email)

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name":"Test User",
    "email":"test@example.com",
    "password":"password123"
  }'
```

### 5. Error Handling

- Email service menggunakan try-catch
- Jika email gagal, sistem tetap berfungsi
- Error log tersimpan untuk debugging
- User tetap mendapat fallback notification

### 6. Email Templates

Template sudah include:

- Design responsif HTML
- Branding sistem absensi
- Security warnings
- Professional formatting

### 7. Production Notes

- Gunakan service email yang reliable (SendGrid, AWS SES, etc.)
- Set rate limiting untuk forgot password
- Monitor email delivery rates
- Backup dengan SMS jika diperlukan
