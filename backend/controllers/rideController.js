const Ride = require('../models/Ride');

const EARTH_RADIUS_METERS = 6378137;

const isValidLngLat = (lng, lat) =>
    Number.isFinite(lng) && Number.isFinite(lat) &&
    lng >= -180 && lng <= 180 && lat >= -90 && lat <= 90;

const getMyRides = async (req, res) => {
    try {
        const rides = await Ride.find({ driver: req.user._id }).sort('-createdAt');
        res.json(rides);
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
};

const addRide = async (req, res) => {
    try {
        const b = req.body;
        const seatsTotal = Number(b.seatsTotal);
        const seatsAvailable = Number(b.seatsAvailable);
        const price = b.price !== undefined && b.price !== '' ? Number(b.price) : 0;
        const departAt = new Date(b.departAt);

        const okCoords = (p) =>
            p && p.location && Array.isArray(p.location.coordinates) &&
            p.location.coordinates.length === 2 &&
            p.location.coordinates.every((n) => Number.isFinite(n));

        if (
            !Number.isFinite(seatsTotal) || seatsTotal < 1 ||
            !Number.isFinite(seatsAvailable) || seatsAvailable < 0 ||
            !(departAt instanceof Date) || isNaN(departAt.getTime()) ||
            !okCoords(b.pickup) || !okCoords(b.dropoff)
        ) {
            return res.status(400).json({ message: 'Invalid ride payload' });
        }

        const ride = await Ride.create({
            driver: req.user._id,
            seatsTotal,
            seatsAvailable,
            pickup: b.pickup,
            dropoff: b.dropoff,
            departAt,
            price,
            notes: b.notes || ''
        });

        req.app.get('io')?.emit('ride:new', ride);
        res.status(201).json(ride);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const updateRide = async (req, res) => {
    try {
        const ride = await Ride.findById(req.params.id);
        if (!ride) return res.status(404).json({ message: 'Ride not found' });
        if (String(ride.driver) !== String(req.user._id)) {
            return res.status(403).json({ message: 'Not your ride' });
        }

        const fields = ['seatsTotal', 'seatsAvailable', 'pickup', 'dropoff', 'departAt', 'returnAt', 'price', 'notes'];
        fields.forEach((k) => { if (req.body[k] !== undefined) ride[k] = req.body[k]; });

        const updated = await ride.save();
        req.app.get('io')?.emit('ride:update', updated);
        res.json(updated);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const deleteRide = async (req, res) => {
    try {
        const ride = await Ride.findById(req.params.id);
        if (!ride) return res.status(404).json({ message: 'Ride not found' });
        if (String(ride.driver) !== String(req.user._id)) {
            return res.status(403).json({ message: 'Not your ride' });
        }

        await ride.deleteOne();
        req.app.get('io')?.emit('ride:update', { _id: ride._id, deleted: true });
        res.json({ message: 'Ride deleted' });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
};

const searchRides = async (req, res) => {
    try {
        const { pickup, dropoff, radiusKm = 5, departAt, windowMin = 60, minSeats = 1 } = req.query;

        const radiusMeters = Number(radiusKm) * 1000;
        const radiusRadians = radiusMeters / EARTH_RADIUS_METERS;

        let start, end;
        if (departAt) {
            start = new Date(departAt);
            if (isNaN(start.getTime())) return res.status(400).json({ message: 'Invalid departAt' });
            end = new Date(start.getTime() + Number(windowMin) * 60 * 1000);
        } else {
            start = new Date(Date.now() - 10 * 60 * 1000);
            end = undefined;
        }

        let plng, plat, dlng, dlat;
        if (pickup) [plng, plat] = pickup.split(',').map(Number);
        if (dropoff) [dlng, dlat] = dropoff.split(',').map(Number);

        if (pickup && !isValidLngLat(plng, plat)) return res.status(400).json({ message: 'Invalid pickup (lng,lat)' });
        if (dropoff && !isValidLngLat(dlng, dlat)) return res.status(400).json({ message: 'Invalid dropoff (lng,lat)' });

        const pipeline = [];

        if (pickup) {
            pipeline.push({
                $geoNear: {
                    near: { type: 'Point', coordinates: [plng, plat] },
                    key: 'pickup.location',
                    distanceField: 'pickupDistance',
                    maxDistance: radiusMeters,
                    spherical: true
                }
            });
        } else if (dropoff) {
            pipeline.push({
                $geoNear: {
                    near: { type: 'Point', coordinates: [dlng, dlat] },
                    key: 'dropoff.location',
                    distanceField: 'dropoffDistance',
                    maxDistance: radiusMeters,
                    spherical: true
                }
            });
        } else {
            pipeline.push({ $match: {} });
        }

        const match = {
            seatsAvailable: { $gte: Number(minSeats) },
            ...(start && end ? { departAt: { $gte: start, $lte: end } } : { departAt: { $gte: start } })
        };

        if (pickup && dropoff) {
            match['dropoff.location'] = {
                $geoWithin: { $centerSphere: [[dlng, dlat], radiusRadians] }
            };
        }

        pipeline.push({ $match: match });
        pipeline.push({ $sort: { departAt: 1 } });
        pipeline.push({ $limit: 100 });

        const results = await Ride.aggregate(pipeline);
        res.json(results);
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
};

module.exports = { getMyRides, addRide, updateRide, deleteRide, searchRides };
