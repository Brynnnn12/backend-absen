const mongoose = require('mongoose');

const passwordResetSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    email: {
      type: String,
      required: true
    },
    resetCode: {
      type: String,
      required: true
    },
    expires: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 15 * 60 * 1000) // 15 minutes
    },
    isUsed: {
      type: Boolean,
      default: false
    },
    ipAddress: String,
    userAgent: String
  },
  { timestamps: true }
);

// Index untuk performance dan auto-delete expired documents
passwordResetSchema.index({ expires: 1 }, { expireAfterSeconds: 0 });
passwordResetSchema.index({ user: 1, isUsed: 1 });

// Method untuk check apakah reset code masih valid
passwordResetSchema.methods.isValid = function () {
  return !this.isUsed && this.expires > new Date();
};

// Method untuk mark as used
passwordResetSchema.methods.markAsUsed = function () {
  this.isUsed = true;
  return this.save();
};

module.exports = mongoose.model('PasswordReset', passwordResetSchema);
