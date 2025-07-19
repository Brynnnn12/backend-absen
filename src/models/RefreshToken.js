const mongoose = require('mongoose');

const refreshTokenSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    token: {
      type: String,
      required: true,
      unique: true
    },
    expires: {
      type: Date,
      required: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
    deviceInfo: {
      userAgent: String,
      ip: String,
      deviceType: String
    }
  },
  { timestamps: true }
);

// Index untuk performance
refreshTokenSchema.index({ user: 1, isActive: 1 });
refreshTokenSchema.index({ expires: 1 }, { expireAfterSeconds: 0 });

// Method untuk check apakah token masih valid
refreshTokenSchema.methods.isValid = function () {
  return this.isActive && this.expires > new Date();
};

// Method untuk deactivate token
refreshTokenSchema.methods.deactivate = function () {
  this.isActive = false;
  return this.save();
};

module.exports = mongoose.model('RefreshToken', refreshTokenSchema);
