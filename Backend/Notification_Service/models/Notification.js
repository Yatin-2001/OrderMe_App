import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['INFO', 'ORDER', 'SYSTEM', 'ADMIN'],
        default: 'INFO'
    },
    status: {
        type: String,
        enum: ['PENDING', 'SENT', 'READ'],
        default: 'PENDING'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
});

export const Notification = mongoose.model('Notification', notificationSchema);
