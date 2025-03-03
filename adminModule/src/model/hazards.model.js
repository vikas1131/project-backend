const mongoose = require('mongoose');

const hazardSchema = new mongoose.Schema({
    location: {
        latitude: {
            type: Number,
            required: true
        },
        longitude: {
            type: Number,
            required: true
        },
    },
    
    hazardType: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    riskLevel: {
        type: String,
        enum: ["low", "medium", "high"],
        required: true
    },
    address: {
        type: String,
        required: true
    },
    pincode: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

const Hazard = mongoose.model('hazards', hazardSchema);
module.exports = Hazard;
