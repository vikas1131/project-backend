const mongoose = require('mongoose');
const chai = require('chai');
const expect = chai.expect;
const Hazard = require('../../src/model/hazards.model'); // Adjust path as needed

// Connect to a test database before running the tests
before(async function () {
    await mongoose.connect('mongodb://127.0.0.1:27017/testdb', {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
    await Hazard.deleteMany(); // Clean up before running tests
});

// Close the connection after tests
after(async function () {
    await mongoose.connection.close();
});

describe('Hazard Model Test', function () {
    it('should create a new hazard record', async function () {
        const hazard = new Hazard({
            location: { latitude: 12.9716, longitude: 77.5946 },
            hazardType: 'Electrical',
            description: 'Exposed wires near a public area',
            riskLevel: 'high',
            address: '123 Street, City',
            pincode: '560001'
        });
        const savedHazard = await hazard.save();
        expect(savedHazard).to.have.property('_id');
        expect(savedHazard.hazardType).to.equal('Electrical');
        expect(savedHazard.riskLevel).to.equal('high');
    });

    it('should fail when latitude is missing', async function () {
        try {
            const hazard = new Hazard({
                location: { longitude: 77.5946 },
                hazardType: 'Chemical',
                description: 'Leakage detected',
                riskLevel: 'medium',
                address: '456 Road, City',
                pincode: '560002'
            });
            await hazard.save();
        } catch (error) {
            expect(error).to.exist;
            expect(error.errors['location.latitude']).to.exist;
        }
    });

    it('should fail when hazardType is missing', async function () {
        try {
            const hazard = new Hazard({
                location: { latitude: 12.9716, longitude: 77.5946 },
                description: 'Gas leak near residential area',
                riskLevel: 'high',
                address: '789 Avenue, City',
                pincode: '560003'
            });
            await hazard.save();
        } catch (error) {
            expect(error).to.exist;
            expect(error.errors.hazardType).to.exist;
        }
    });

    it('should fail when riskLevel is not one of the allowed values', async function () {
        try {
            const hazard = new Hazard({
                location: { latitude: 12.9716, longitude: 77.5946 },
                hazardType: 'Fire',
                description: 'Fire hazard near gas station',
                riskLevel: 'critical', // Invalid value
                address: '101 Block, City',
                pincode: '560004'
            });
            await hazard.save();
        } catch (error) {
            expect(error).to.exist;
            expect(error.errors.riskLevel).to.exist;
        }
    });
});
