const asyncHandler = require('express-async-handler');
const { OfficeLocation } = require('../models');

// @desc    Buat lokasi kantor
// @route   POST /api/office-location
// @access  Private (Admin only)
exports.createOfficeLocation = asyncHandler(async (req, res) => {
  const { name, lat, lng, radius } = req.body;

  const officeLocation = await OfficeLocation.create({
    name,
    lat,
    lng,
    radius: radius || 100
  });

  res.status(201).json({
    success: true,
    message: 'Lokasi kantor berhasil dibuat',
    data: {
      officeLocation
    }
  });
});

// @desc    Dapatkan semua lokasi kantor
// @route   GET /api/office-location
// @access  Private
exports.getOfficeLocations = asyncHandler(async (req, res) => {
  const officeLocations = await OfficeLocation.find();

  res.json({
    success: true,
    data: {
      officeLocations
    }
  });
});

// @desc    Dapatkan lokasi kantor berdasarkan ID
// @route   GET /api/office-location/:id
// @access  Private
exports.getOfficeLocationById = asyncHandler(async (req, res) => {
  const officeLocation = await OfficeLocation.findById(req.params.id);

  if (!officeLocation) {
    return res.status(404).json({
      success: false,
      message: 'Lokasi kantor tidak ditemukan'
    });
  }

  res.json({
    success: true,
    data: {
      officeLocation
    }
  });
});

// @desc    Perbarui lokasi kantor
// @route   PUT /api/office-location/:id
// @access  Private (Admin only)
exports.updateOfficeLocation = asyncHandler(async (req, res) => {
  const { name, lat, lng, radius } = req.body;

  let officeLocation = await OfficeLocation.findById(req.params.id);

  if (!officeLocation) {
    return res.status(404).json({
      success: false,
      message: 'Lokasi kantor tidak ditemukan'
    });
  }

  officeLocation = await OfficeLocation.findByIdAndUpdate(
    req.params.id,
    { name, lat, lng, radius },
    { new: true, runValidators: true }
  );

  res.json({
    success: true,
    message: 'Lokasi kantor berhasil diupdate',
    data: {
      officeLocation
    }
  });
});

// @desc    Hapus lokasi kantor
// @route   DELETE /api/office-location/:id
// @access  Private (Admin only)
exports.deleteOfficeLocation = asyncHandler(async (req, res) => {
  const officeLocation = await OfficeLocation.findById(req.params.id);

  if (!officeLocation) {
    return res.status(404).json({
      success: false,
      message: 'Lokasi kantor tidak ditemukan'
    });
  }

  await OfficeLocation.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: 'Lokasi kantor berhasil dihapus'
  });
});

// @desc    Cek apakah koordinat berada dalam radius kantor
// @route   POST /api/office-location/validate
// @access  Private
exports.validateLocation = asyncHandler(async (req, res) => {
  const { lat, lng } = req.body;

  const officeLocation = await OfficeLocation.findOne();

  if (!officeLocation) {
    return res.status(400).json({
      success: false,
      message: 'Lokasi kantor belum dikonfigurasi'
    });
  }

  const isWithinRadius = officeLocation.isWithinRadius(lat, lng);
  const distance = officeLocation.getDistanceFrom(lat, lng);

  res.json({
    success: true,
    data: {
      isWithinRadius,
      distance,
      officeLocation: {
        name: officeLocation.name,
        radius: officeLocation.radius
      }
    }
  });
});
