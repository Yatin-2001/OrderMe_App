import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },

    // List of orders
    orderList: {
        type: [String],
        default: []
    },

}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);