const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
    {
        email: { type: String, required: true },
        message: { type: String, required: true },
        isRead: { type: Boolean, default: false },
        createdAt: { type: Date, default: Date.now },
    },
    { timestamps: true }
);
notificationSchema.set('toJSON', {
    transform: (doc, ret) => {
        delete ret.__v;
        return ret;
    }
});
module.exports = mongoose.model('Notification', notificationSchema, 'Notification');