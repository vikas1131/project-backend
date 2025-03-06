const mongoose = require('mongoose');

const engineerSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        ref: 'auth'
    },
    name: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    specialization: {
        type: String,
        enum: ['Installation', 'Fault'],
        default: 'Installation'
    },
    availability: {
        type: [String],
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        required: true
    },
    address: {
        type: String,
        required: true
    },
    city:{
        type:String,
        required: true
    },
    pincode:{
        type: String,
        required: true
    },
    location: {
        latitude: { type: Number, required: true },
        longitude: { type: Number, required: true },
        address: { type: String, required: true }
    },
    securityQuestion: {
        type: String,
        required: true
    },
    securityAnswer: {
        type: String,
        required: true
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    isEngineer: {
        type: Boolean,
        default: false
    },
    isUser: {
        type: Boolean,
        default: false
    },
    currentTasks: {
        type: Number,
        default: 0
    },
    assignedTasks: {
        type: [Number],
        default: []
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

const Engineer = mongoose.model('engineer', engineerSchema);
module.exports = Engineer;
