import mongoose from 'mongoose';

const address = new mongoose.Schema({
    name: String,
    address: String,
    pincode: String,
    coordinates: {
        lat: Number,
        lng: Number,
    },
});

const orderSchema = new mongoose.Schema({
    orderId: { type: String, required: true },
    items: [
        {
            productId: String,
            quantity: Number,
        },
    ],
    status: {
        type: String,
        enum: ['CREATED', 'RESERVED', 'PAID', 'SHIPPED', 'PICKUP SCHEDULED', 'PICKUP FAILED', 'DELIVERED', 'FAILED', 'CANCELLED', 'REFUND INITIATED'],
        default: 'CREATED',
    },
    userAddress: {
        type: address,
        required: true
    },
    // To get details for payment and shipment
    paymentId: {type: String},
    shipmentId: { type: String }

})



module.exports = mongoose.model('Order', orderSchema);