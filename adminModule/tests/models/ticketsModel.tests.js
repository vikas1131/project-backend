const mongoose = require('mongoose');
const { expect } = require('chai');
const Ticket = require('../../src/model/tickets.model');

before(async () => {
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect('mongodb://127.0.0.1:27017/test_db', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
    }
});

after(async () => {
    await mongoose.connection.close();
});

describe('Ticket Model Tests', () => {
    beforeEach(async () => {
        await Ticket.deleteMany({}); // Ensure a clean test DB
    });

    it('should create a ticket with valid fields', async () => {
        const ticket = new Ticket({
            _id: Date.now(), // Generate a unique number ID
            userEmail: 'user@example.com',
            serviceType: 'installation',
            location: { latitude: 12.9716, longitude: 77.5946 },
            address: '123 Street, City',
            pincode: '560001',
            description: 'Test description',
            priority: 'high',
            status: 'open'
        });

        const savedTicket = await ticket.save();
        expect(savedTicket).to.have.property('_id');
        expect(savedTicket.userEmail).to.equal('user@example.com');
    });

    it('should default status to open', async () => {
        const ticket = new Ticket({
            _id: Date.now(), // Use a unique Number-based ID
            userEmail: 'user@example.com',
            serviceType: 'installation',
            location: { latitude: 12.9716, longitude: 77.5946 },
            address: '123 Street, City',
            pincode: '560001',
            description: 'Test description',
            priority: 'medium'
        });

        const savedTicket = await ticket.save();
        expect(savedTicket.status).to.equal('open'); // Default status
    });
});
