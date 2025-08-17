const router = require('express').Router();
const { protect } = require('../middleware/authMiddleware');
const { getMyRides, addRide, updateRide, deleteRide, searchRides } = require('../controllers/rideController');

router.get('/mine', protect, getMyRides);
router.get('/search', protect, searchRides);
router.get('/__ping', (_req, res) => res.json({ ok: true, where: 'rides router' }));

router.post('/', protect, addRide);
router.put('/:id', protect, updateRide);
router.delete('/:id', protect, deleteRide);

module.exports = router;
