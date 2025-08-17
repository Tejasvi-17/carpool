const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema(
    {
        ride: { type: mongoose.Schema.Types.ObjectId, ref: 'Ride', required: true },
        passenger: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        seats: { type: Number, default: 1, min: 1 },
        status: { type: String, enum: ['pending', 'accepted', 'rejected', 'cancelled'], default: 'pending' },
        message: String
    },
    { timestamps: true }
);

BookingSchema.index({ ride: 1, passenger: 1 }, { unique: true });

module.exports = mongoose.model('Booking', BookingSchema);
