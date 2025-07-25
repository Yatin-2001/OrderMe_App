const mongoose = require('mongoose');

const shipmentSchema = new mongoose.Schema({
    shipmentId: {type: String, required: true},
    orderId: String,
    status: {
        type: String,
        enum: ['PENDING', 'CANCELLED', 'SHIPPED', 'DELIVERED', 'FAILED', 'PICKUP SCHEDULED', 'PICKUP SUCCCESSFUL', 'PICKUP FAILED'],
        default: 'PENDING'
    },
    scheduledDay: {
        type: Date,
        defaukt: Date.now
    },
    isPickupRequired: {
        type: Boolean
    },
    pickupSchedule: {
        type: Date
    }

}, { timestamps: true });

module.exports = mongoose.model('Shipment', shipmentSchema);
