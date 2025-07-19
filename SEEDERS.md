# Database Seeders

Database seeders untuk membuat data awal dalam aplikasi absensi karyawan.

## 📋 Available Seeders

### 1. Admin Seeder
Membuat user admin default untuk aplikasi.

```bash
npm run seed:admin
```

**Default Admin Account:**
- Email: `admin@absensi.com`
- Password: `admin123456`
- Role: `admin`

### 2. Employee Seeder
Membuat sample employee users untuk testing.

```bash
npm run seed:employees
```

**Sample Employee Accounts:**
- Budi Santoso (`budi@absensi.com`) - Password: `password123`
- Siti Nurhaliza (`siti@absensi.com`) - Password: `password123`
- Ahmad Wijaya (`ahmad@absensi.com`) - Password: `password123`

### 3. All Seeders
Menjalankan semua seeders sekaligus.

```bash
npm run seed:all
```

## 🔐 Security Notes

⚠️ **PENTING**: Ganti password default setelah login pertama kali!

- Password default hanya untuk development dan testing
- Gunakan password yang kuat untuk production
- Jangan commit password production ke repository

## 📝 Usage Examples

### Development Setup
```bash
# 1. Install dependencies
npm install

# 2. Setup environment variables
cp .env.example .env

# 3. Seed database
npm run seed:all

# 4. Start application
npm start
```

### Production Setup
```bash
# 1. Seed only admin user
npm run seed:admin

# 2. Create employees via admin panel
# (Recommended for production)
```

## 🛠️ Customization

### Modify Admin Data
Edit `seeders/adminSeeder.js`:

```javascript
const adminData = {
  name: 'Your Admin Name',
  email: 'youradmin@company.com',
  password: 'your-secure-password',
  role: 'admin'
};
```

### Add More Employees
Edit `seeders/employeeSeeder.js`:

```javascript
const employeeData = [
  {
    name: 'Employee Name',
    email: 'employee@company.com',
    password: 'secure-password',
    role: 'karyawan'
  },
  // Add more employees here...
];
```

## 🔄 Re-running Seeders

Seeders akan skip jika user dengan email yang sama sudah ada:

```bash
# Safe to run multiple times
npm run seed:admin

# Output jika admin sudah ada:
# ℹ️ Admin user already exists
```

## 🗂️ File Structure

```
seeders/
├── adminSeeder.js      # Admin user seeder
├── employeeSeeder.js   # Employee users seeder
└── index.js           # Main seeder (runs all)
```
