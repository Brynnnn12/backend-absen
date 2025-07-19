const Joi = require('joi');

// Middleware untuk validasi input
exports.validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    next();
  };
};

// Schema validasi untuk registrasi user
exports.userRegistrationSchema = Joi.object({
  name: Joi.string().min(3).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('admin', 'karyawan').optional()
});

// Schema validasi untuk login
exports.userLoginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

// Schema validasi untuk clock in/out
exports.presenceSchema = Joi.object({
  lat: Joi.number().required(),
  lng: Joi.number().required()
});

// Schema validasi untuk office location
exports.officeLocationSchema = Joi.object({
  name: Joi.string().min(3).max(50).required(),
  lat: Joi.number().required(),
  lng: Joi.number().required(),
  radius: Joi.number().min(10).max(1000).optional()
});

// Schema validasi untuk forgot password
exports.forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required()
});

// Schema validasi untuk reset password
exports.resetPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
  resetCode: Joi.string()
    .length(6)
    .pattern(/^[0-9]+$/)
    .required(),
  newPassword: Joi.string().min(6).required()
});

// Schema validasi untuk change password
exports.changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(6).required()
});

// Schema validasi untuk broadcast notification
exports.broadcastNotificationSchema = Joi.object({
  title: Joi.string().min(3).max(100).required(),
  message: Joi.string().min(10).max(500).required(),
  type: Joi.string()
    .valid('attendance', 'reminder', 'warning', 'info', 'system')
    .optional(),
  priority: Joi.string().valid('low', 'medium', 'high', 'urgent').optional(),
  userIds: Joi.array()
    .items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/))
    .optional()
});
