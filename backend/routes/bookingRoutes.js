const router = require('express').Router();
const { protect } = require('../middleware/authMiddleware');
const { requestBooking, decideBooking } = require('../controllers/bookingController');

router.post('/', protect, requestBooking);
router.post('/:id/decision', protect, decideBooking);

module.exports = router;
