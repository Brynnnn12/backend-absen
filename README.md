# Backend Absen - Attendance Management System

A comprehensive attendance management backend system built with Express.js and MongoDB, featuring JWT authentication, location-based attendance tracking, automated reminders, and real-time notifications.

## 🚀 Features

- **JWT Authentication** with refresh token support
- **Forgot Password** functionality with OTP verification
- **Location-based Attendance** tracking
- **Real-time Notifications** system
- **Automatic Attendance Reminders** with scheduled tasks
- **Admin Dashboard** for management
- **Weekly & Monthly Reports** generation
- **Email Integration** for notifications and password reset
- **Role-based Access Control** (Admin/Employee)

## 🛠️ Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens) with refresh tokens
- **Email Service**: Nodemailer
- **Validation**: Joi
- **Password Hashing**: bcryptjs
- **File Upload**: Multer
- **Scheduled Tasks**: node-cron
- **Testing**: Jest with Supertest
- **Code Quality**: ESLint + Prettier
- **Process Management**: Nodemon (development)

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (v16.0.0 or higher)
- **npm** (v7.0.0 or higher)
- **MongoDB** (v4.4 or higher)
- **Git** for version control

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Brynnnn12/backend-absen.git
   cd backend-absen
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.development .env
   ```
   
   Update the `.env` file with your configuration (see [Environment Variables](#environment-variables) section).

4. **Start MongoDB**
   
   Make sure MongoDB is running on your system:
   ```bash
   # For MongoDB installed locally
   mongod
   
   # For MongoDB service (Linux/macOS)
   sudo systemctl start mongod
   # or
   sudo service mongod start
   ```

## 🗄️ Database Setup

### MongoDB Configuration

1. **Create a MongoDB database** for the application
2. **Update the connection string** in your `.env` file
3. **Seed the database** with initial data:

   ```bash
   # Seed admin user
   npm run seed:admin
   
   # Seed employee users
   npm run seed:employees
   
   # Seed all data
   npm run seed:all
   ```

For detailed seeding information, refer to [SEEDERS.md](SEEDERS.md).

## ⚙️ Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGO_URI=mongodb://localhost:27017/backend-absen

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key
JWT_EXPIRE=7d
JWT_REFRESH_EXPIRE=30d

# Email Configuration (for password reset and notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=Sistem Absensi <your-email@gmail.com>

# Frontend URL (for CORS)
CLIENT_URL=http://localhost:3000
```

For detailed email setup instructions, see [EMAIL_SETUP.md](EMAIL_SETUP.md).

## 🚀 Running the Application

### Development Mode
```bash
npm run dev
```
This starts the server with nodemon for automatic restarts on file changes.

### Production Mode
```bash
npm start
```

### Other Available Scripts
```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format

# Check code formatting
npm run format:check
```

The server will start on `http://localhost:5000` (or the port specified in your `.env` file).

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Health Check
```http
GET /api/health
```

### Main Endpoints

| Endpoint | Description |
|----------|-------------|
| `POST /api/auth/register` | User registration |
| `POST /api/auth/login` | User login |
| `POST /api/auth/refresh` | Refresh JWT token |
| `POST /api/auth/forgot-password` | Request password reset |
| `POST /api/auth/reset-password` | Reset password with OTP |
| `GET /api/presence` | Get attendance records |
| `POST /api/presence/check-in` | Check in attendance |
| `POST /api/presence/check-out` | Check out attendance |
| `GET /api/office-location` | Get office locations |
| `POST /api/office-location` | Create office location (Admin) |
| `GET /api/admin/users` | Get all users (Admin) |
| `GET /api/admin/reports` | Generate reports (Admin) |
| `GET /api/notifications` | Get notifications |

For detailed API testing examples, see [POSTMAN_TESTING.md](POSTMAN_TESTING.md).

## 📁 Project Structure

```
backend-absen/
├── src/
│   ├── config/           # Configuration files
│   │   └── db.js         # Database connection
│   ├── controllers/      # Route controllers
│   ├── helpers/          # Helper functions
│   ├── middlewares/      # Express middlewares
│   ├── models/           # Mongoose models
│   │   ├── User.js       # User model
│   │   ├── Presence.js   # Attendance model
│   │   ├── OfficeLocation.js
│   │   └── ...
│   ├── routes/           # API routes
│   │   ├── authRoutes.js
│   │   ├── presenceRoutes.js
│   │   └── ...
│   ├── services/         # Business logic services
│   ├── utils/            # Utility functions
│   └── server.js         # Application entry point
├── tests/                # Test files
├── seeders/              # Database seeders
├── .env.development      # Environment template
├── package.json
└── README.md
```

## 🧪 Testing

This project uses Jest for testing with Supertest for API testing.

```bash
# Run all tests
npm test

# Run tests in watch mode (for development)
npm run test:watch

# Generate coverage report
npm run test:coverage
```

Test files are located in the `tests/` directory and follow the naming convention `*.test.js`.

## 🔨 Development Tools

This project includes several development tools for code quality:

- **ESLint**: Code linting with Node.js best practices
- **Prettier**: Code formatting
- **Jest**: Testing framework
- **Nodemon**: Auto-restart during development

For detailed development setup, see [DEVELOPMENT.md](DEVELOPMENT.md).

## 🤝 Contributing

We welcome contributions to improve this project! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes** following the coding standards
4. **Run tests and linting**
   ```bash
   npm run lint
   npm test
   ```
5. **Commit your changes**
   ```bash
   git commit -m "feat: add your feature description"
   ```
6. **Push to your branch**
   ```bash
   git push origin feature/your-feature-name
   ```
7. **Create a Pull Request**

### Coding Standards

- Follow ESLint configuration
- Use Prettier for code formatting
- Write tests for new features
- Follow conventional commit messages
- Keep functions small and focused
- Add appropriate comments for complex logic

## 📄 License

This project is licensed under the ISC License. See the [LICENSE](LICENSE) file for details.

## 📞 Support

If you encounter any issues or have questions:

1. Check the existing documentation files
2. Review the [Issues](https://github.com/Brynnnn12/backend-absen/issues) section
3. Create a new issue with detailed information

## 🔄 Version History

- **v2.0.0** - Current version with enhanced features
  - JWT refresh token support
  - Improved authentication
  - Real-time notifications
  - Enhanced admin features

---

**Built with ❤️ for efficient attendance management**
