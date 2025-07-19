const express = require('express');
const {
  createOfficeLocation,
  getOfficeLocations,
  getOfficeLocationById,
  updateOfficeLocation,
  deleteOfficeLocation,
  validateLocation
} = require('../controllers/officeLocationController');
const { authenticate, adminOnly } = require('../middlewares/auth');
const {
  validate,
  officeLocationSchema,
  presenceSchema
} = require('../middlewares/validation');

const router = express.Router();

// All routes are protected
router.use(authenticate);

// Public routes (for all authenticated users)
router.get('/', getOfficeLocations);
router.get('/:id', getOfficeLocationById);
router.post('/validate', validate(presenceSchema), validateLocation);

// Admin only routes
router.post(
  '/',
  adminOnly,
  validate(officeLocationSchema),
  createOfficeLocation
);
router.put(
  '/:id',
  adminOnly,
  validate(officeLocationSchema),
  updateOfficeLocation
);
router.delete('/:id', adminOnly, deleteOfficeLocation);

module.exports = router;
