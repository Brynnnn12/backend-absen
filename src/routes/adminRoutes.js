const express = require('express');
const {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getAllPresence,
  getAttendanceStats
} = require('../controllers/adminController');
const { authenticate, adminOnly } = require('../middlewares/auth');

const router = express.Router();

// All routes are protected and admin only
router.use(authenticate);
router.use(adminOnly);

// User management routes
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

// Presence management routes
router.get('/presence', getAllPresence);
router.get('/stats', getAttendanceStats);

module.exports = router;
