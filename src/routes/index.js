const express = require('express');
const authRoutes = require('./authRoutes');
const presenceRoutes = require('./presenceRoutes');
const officeLocationRoutes = require('./officeLocationRoutes');
const adminRoutes = require('./adminRoutes');
const notificationRoutes = require('./notificationRoutes');

const router = express.Router();

// API Routes
router.use('/auth', authRoutes);
router.use('/presence', presenceRoutes);
router.use('/office-location', officeLocationRoutes);
router.use('/admin', adminRoutes);
router.use('/notifications', notificationRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is running!',
    timestamp: new Date().toISOString(),
    version: '2.0.0'
  });
});

module.exports = router;
