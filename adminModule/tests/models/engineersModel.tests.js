const mongoose = require('mongoose');
const chai = require('chai');
const expect = chai.expect;
const Engineer = require('../../src/model/engineers.model'); // Adjust path as needed

// Connect to a test database before running the tests
before(async function () {
    await mongoose.connect('mongodb://127.0.0.1:27017/testdb', {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
    await Engineer.deleteMany(); // Clean up before running tests
});

// Close the connection after tests
after(async function () {
    await mongoose.connection.close();
});

describe('Engineer Model Test', function () {
    it('should create a new engineer record', async function () {
        const engineer = new Engineer({
            email: 'engineer@example.com',
            name: 'John Doe',
            phone: '1234567890',
            specialization: 'Installation',
            availability: ['Monday', 'Wednesday', 'Friday'],
            address: '123 Street, City',
            pincode: '123456',
            location: { latitude: 12.9716, longitude: 77.5946, address: 'Bangalore, India' },
            securityQuestion: 'What is your pet name?',
            securityAnswer: 'Fluffy',
            isAdmin: false,
            isEngineer: true,
            isUser: false,
            currentTasks: 2,
            assignedTasks: [101, 102]
        });
        const savedEngineer = await engineer.save();
        expect(savedEngineer).to.have.property('_id');
        expect(savedEngineer.email).to.equal('engineer@example.com');
        expect(savedEngineer.name).to.equal('John Doe');
        expect(savedEngineer.specialization).to.equal('Installation');
    });

    it('should fail when email is missing', async function () {
        try {
            const engineer = new Engineer({
                name: 'John Doe',
                phone: '1234567890',
                availability: ['Monday', 'Wednesday', 'Friday'],
                address: '123 Street, City',
                pincode: '123456',
                location: { latitude: 12.9716, longitude: 77.5946, address: 'Bangalore, India' },
                securityQuestion: 'What is your pet name?',
                securityAnswer: 'Fluffy',
                isAdmin: false,
                isEngineer: true,
                isUser: false
            });
            await engineer.save();
        } catch (error) {
            expect(error).to.exist;
            expect(error.errors.email).to.exist;
        }
    });

    it('should enforce unique email constraint', async function () {
        try {
            const engineer1 = new Engineer({
                email: 'unique@example.com',
                name: 'Alice',
                phone: '9876543210',
                availability: ['Tuesday', 'Thursday'],
                address: '456 Road, City',
                pincode: '654321',
                location: { latitude: 13.0827, longitude: 80.2707, address: 'Chennai, India' },
                securityQuestion: 'What is your mother’s maiden name?',
                securityAnswer: 'Smith',
                isAdmin: false,
                isEngineer: true,
                isUser: false
            });
            await engineer1.save();

            const engineer2 = new Engineer({
                email: 'unique@example.com',
                name: 'Bob',
                phone: '8765432109',
                availability: ['Monday'],
                address: '789 Avenue, City',
                pincode: '789123',
                location: { latitude: 17.3850, longitude: 78.4867, address: 'Hyderabad, India' },
                securityQuestion: 'What was your first school?',
                securityAnswer: 'Greenwood',
                isAdmin: false,
                isEngineer: true,
                isUser: false
            });
            await engineer2.save();
        } catch (error) {
            expect(error).to.exist;
        }
    });
});
