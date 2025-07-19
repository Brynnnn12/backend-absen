const express = require('express');
const {
  register,
  login,
  logout,
  logoutAll,
  getMe,
  refresh,
  forgotPassword,
  resetPassword,
  changePassword
} = require('../controllers/authController');
const { authenticate } = require('../middlewares/auth');
const {
  validate,
  userRegistrationSchema,
  userLoginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema
} = require('../middlewares/validation');

const router = express.Router();

// Public routes
router.post('/register', validate(userRegistrationSchema), register);
router.post('/login', validate(userLoginSchema), login);
router.post('/refresh', refresh);
router.post('/forgot-password', validate(forgotPasswordSchema), forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), resetPassword);

// Protected routes
router.post('/logout', authenticate, logout);
router.post('/logout-all', authenticate, logoutAll);
router.get('/me', authenticate, getMe);
router.post(
  '/change-password',
  authenticate,
  validate(changePasswordSchema),
  changePassword
);

module.exports = router;
