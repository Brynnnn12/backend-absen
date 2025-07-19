const mongoose = require('mongoose');

const presenceSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    date: {
      type: Date,
      required: true
    },
    clock_in: {
      type: Date,
      required: true
    },
    clock_out: {
      type: Date,
      default: null
    },
    location_in: {
      lat: {
        type: Number,
        required: true
      },
      lng: {
        type: Number,
        required: true
      }
    },
    location_out: {
      lat: {
        type: Number,
        default: null
      },
      lng: {
        type: Number,
        default: null
      }
    },
    status: {
      type: String,
      enum: ['ontime', 'late'],
      required: true
    }
  },
  { timestamps: true }
);

// Index untuk optimasi query berdasarkan user dan tanggal
presenceSchema.index({ user: 1, date: 1 });

// Virtual untuk mendapatkan durasi kerja
presenceSchema.virtual('workDuration').get(function () {
  if (this.clock_in && this.clock_out) {
    return Math.round((this.clock_out - this.clock_in) / (1000 * 60)); // dalam menit
  }
  return null;
});

// Ensure virtual fields are serialized
presenceSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Presence', presenceSchema);
