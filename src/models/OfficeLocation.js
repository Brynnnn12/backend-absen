const mongoose = require('mongoose');

const officeLocationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true
    },
    lat: {
      type: Number,
      required: true
    },
    lng: {
      type: Number,
      required: true
    },
    radius: {
      type: Number,
      required: true,
      default: 100 // radius dalam meter
    }
  },
  { timestamps: true }
);

// Method untuk mengecek apakah koordinat berada dalam radius kantor
officeLocationSchema.methods.isWithinRadius = function (userLat, userLng) {
  const R = 6371000; // Radius bumi dalam meter
  const dLat = ((userLat - this.lat) * Math.PI) / 180;
  const dLng = ((userLng - this.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((this.lat * Math.PI) / 180) *
      Math.cos((userLat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance dalam meter

  return distance <= this.radius;
};

// Method untuk menghitung jarak dari koordinat user
officeLocationSchema.methods.getDistanceFrom = function (userLat, userLng) {
  const R = 6371000; // Radius bumi dalam meter
  const dLat = ((userLat - this.lat) * Math.PI) / 180;
  const dLng = ((userLng - this.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((this.lat * Math.PI) / 180) *
      Math.cos((userLat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance dalam meter

  return Math.round(distance);
};

module.exports = mongoose.model('OfficeLocation', officeLocationSchema);
