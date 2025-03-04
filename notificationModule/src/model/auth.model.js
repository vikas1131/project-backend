const mongoose = require('mongoose');

const authSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['user', 'engineer', 'admin'],
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Auth = mongoose.model('authentications', authSchema);
module.exports = Auth;