const Booking = require('../models/Booking');
const Ride = require('../models/Ride');

const requestBooking = async (req, res) => {
    const { rideId, seats = 1, message = '' } = req.body;
    try {
        const ride = await Ride.findById(rideId);
        if (!ride) return res.status(404).json({ message: 'Ride not found' });
        if (String(ride.driver) === String(req.user._id)) return res.status(400).json({ message: 'Cannot book your own ride' });

        const booking = await Booking.create({ ride: ride._id, passenger: req.user._id, seats, message });
        req.app.get('io').emit('rides:updated', { type: 'booking:pending', rideId: ride._id });
        res.status(201).json(booking);
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
};

const decideBooking = async (req, res) => {
    const { status } = req.body; // 'accepted' | 'rejected'
    try {
        const booking = await Booking.findById(req.params.id).populate('ride');
        if (!booking) return res.status(404).json({ message: 'Not found' });
        if (String(booking.ride.driver) !== String(req.user._id)) return res.status(403).json({ message: 'Not your ride' });
        if (!['accepted', 'rejected'].includes(status)) return res.status(400).json({ message: 'Invalid status' });

        booking.status = status;
        await booking.save();

        if (status === 'accepted') {
            const ride = await Ride.findById(booking.ride._id);
            ride.seatsAvailable = Math.max(0, ride.seatsAvailable - booking.seats);
            await ride.save();
        }
        req.app.get('io').emit('rides:updated', { type: 'booking:resolved', rideId: booking.ride._id });
        res.json(booking);
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
};

module.exports = { requestBooking, decideBooking };
