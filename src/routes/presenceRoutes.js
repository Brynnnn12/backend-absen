const express = require('express');
const {
  clockIn,
  clockOut,
  getPresenceHistory,
  getTodayPresence
} = require('../controllers/presenceController');
const { authenticate } = require('../middlewares/auth');
const { validate, presenceSchema } = require('../middlewares/validation');

const router = express.Router();

// All routes are protected
router.use(authenticate);

router.post('/clock-in', validate(presenceSchema), clockIn);
router.post('/clock-out', validate(presenceSchema), clockOut);
router.get('/history', getPresenceHistory);
router.get('/today', getTodayPresence);

module.exports = router;
