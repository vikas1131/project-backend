const mongoose = require('mongoose');

const User = require('./users.model');

const Engineer = require('./engineers.model');

const ticketSchema = new mongoose.Schema({
    _id: {
        type: Number,
        required: true
    },
    userEmail: {
        type: String,
        ref: User,
        required: true,
    },
    serviceType: {
        type: String,
        enum: ['installation', 'fault'],
        required: true,
    },
    location: {
        latitude: {
            type: Number,
            required: true,
        },
        longitude: {
            type: Number,
            required: true,
        },
    },
    address: {
        type: String,
        required: true,
    },
    pincode: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        required: true
    },
    status: {
        type: String,
        enum: ['open', 'in-progress', 'completed', 'failed', 'deferred'],
        required: true,
        default: 'open',
    },
    accepted: {
        type: Boolean,
        default: false,
    },
    engineerEmail: {
        type: String,
        ref: Engineer,
        default: null,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});



const tickets = mongoose.model('tickets', ticketSchema);

module.exports = tickets;