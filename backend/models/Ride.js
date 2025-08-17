const mongoose = require('mongoose');

const RideSchema = new mongoose.Schema(
    {
        driver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        seatsTotal: { type: Number, required: true, min: 1 },
        seatsAvailable: { type: Number, required: true, min: 0 },
        pickup: {
            label: String,
            location: {
                type: { type: String, enum: ['Point'], default: 'Point' },
                coordinates: { type: [Number], required: true }
            }
        },
        dropoff: {
            label: String,
            location: {
                type: { type: String, enum: ['Point'], default: 'Point' },
                coordinates: { type: [Number], required: true }
            }
        },
        departAt: { type: Date, required: true },
        returnAt: { type: Date },
        price: { type: Number, default: 0 },
        notes: { type: String }
    },
    { timestamps: true }
);

RideSchema.index({ 'pickup.location': '2dsphere' });
RideSchema.index({ 'dropoff.location': '2dsphere' });
RideSchema.index({ departAt: 1 });

module.exports = mongoose.model('Ride', RideSchema);
