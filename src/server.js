require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/db');
const cookieParser = require('cookie-parser');
const routes = require('./routes');
const { errorHandler, notFound } = require('./middlewares/errorHandler');
const { requestLogger, responseTimeTracker } = require('./middlewares/requestLogger');
const { initializeScheduler } = require('./services/scheduler');
const { testEmailConfiguration } = require('./services/emailService');
const { logger } = require('./utils');

const app = express();

/**
 * * Middleware setup
 */

app.use(
  cors({
    origin: 'http://localhost:3000',
    credentials: true
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// Middleware untuk tracking response time dan logging
app.use(responseTimeTracker);
app.use(requestLogger);

/** * * Database connection
 */
connectDB()
  .then(async () => {
    logger.logInfo('Database connected successfully');

    // Test email configuration
    await testEmailConfiguration();

    // Initialize scheduler after database connection
    initializeScheduler();
  })
  .catch((error) => {
    logger.logError('Database connection failed', error);
    process.exit(1); // Exit the process with failure
  });

/** * * Routes setup
 */

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to the Attendance API',
    version: '2.0.0',
    features: [
      'JWT Authentication with Refresh Token',
      'Forgot Password with OTP',
      'Real-time Notifications',
      'Automatic Attendance Reminders',
      'Location-based Attendance',
      'Admin Dashboard',
      'Weekly & Monthly Reports'
    ]
  });
});

// API Routes
app.use('/api', routes);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  logger.logInfo(`Server started on port ${PORT}`);
});
