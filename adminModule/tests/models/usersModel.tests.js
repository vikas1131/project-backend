const mongoose = require('mongoose');
const chai = require('chai');
const expect = chai.expect;
const User = require('../../src/model/users.model'); // Adjust the path as necessary

// Connect to a test database before running the tests
before(async function () {
    await mongoose.connect('mongodb://127.0.0.1:27017/testdb', {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
    await User.deleteMany(); // Clean up before running tests
});

// Close the connection after tests
after(async function () {
    await mongoose.connection.close();
});

describe('User Model Test', function () {
    it('should create a new user record', async function () {
        const user = new User({
            email: 'user@example.com',
            name: 'John Doe',
            phone: '9876543210',
            address: '123 Street, City',
            pincode: '560001',
            securityQuestion: 'What is your pet’s name?',
            securityAnswer: 'Fluffy',
            isAdmin: false,
            isEngineer: false,
            isUser: true
        });
        const savedUser = await user.save();
        expect(savedUser).to.have.property('_id');
        expect(savedUser.email).to.equal('user@example.com');
        expect(savedUser.name).to.equal('John Doe');
        expect(savedUser.isUser).to.equal(true);
    });

    it('should fail when email is missing', async function () {
        try {
            const user = new User({
                name: 'Jane Doe',
                phone: '1234567890',
                address: '456 Road, City',
                pincode: '560002',
                securityQuestion: 'What is your favorite color?',
                securityAnswer: 'Blue',
                isUser: true
            });
            await user.save();
        } catch (error) {
            expect(error).to.exist;
            expect(error.errors.email).to.exist;
        }
    });

    it('should enforce unique email constraint', async function () {
        try {
            const user1 = new User({
                email: 'unique@example.com',
                name: 'Alice',
                phone: '9876543210',
                address: '789 Avenue, City',
                pincode: '560003',
                securityQuestion: 'What is your birthplace?',
                securityAnswer: 'New York',
                isUser: true
            });
            await user1.save();

            const user2 = new User({
                email: 'unique@example.com',
                name: 'Bob',
                phone: '8765432109',
                address: '101 Block, City',
                pincode: '560004',
                securityQuestion: 'What is your childhood nickname?',
                securityAnswer: 'Bobby',
                isUser: true
            });
            await user2.save();
        } catch (error) {
            expect(error).to.exist;
        }
    });

    it('should fail when pincode is missing', async function () {
        try {
            const user = new User({
                email: 'nopincode@example.com',
                name: 'Chris Doe',
                phone: '1112223333',
                address: 'Some Place, City',
                securityQuestion: 'What is your favorite food?',
                securityAnswer: 'Pizza',
                isUser: true
            });
            await user.save();
        } catch (error) {
            expect(error).to.exist;
            expect(error.errors.pincode).to.exist;
        }
    });

    it('should fail when security question is missing', async function () {
        try {
            const user = new User({
                email: 'nosecquestion@example.com',
                name: 'Derek Doe',
                phone: '4445556666',
                address: 'Another Place, City',
                pincode: '560005',
                securityAnswer: 'Rocky',
                isUser: true
            });
            await user.save();
        } catch (error) {
            expect(error).to.exist;
            expect(error.errors.securityQuestion).to.exist;
        }
    });

    it('should fail when security answer is missing', async function () {
        try {
            const user = new User({
                email: 'nosecanswer@example.com',
                name: 'Elena Doe',
                phone: '7778889999',
                address: 'Yet Another Place, City',
                pincode: '560006',
                securityQuestion: 'What was your first car?',
                isUser: true
            });
            await user.save();
        } catch (error) {
            expect(error).to.exist;
            expect(error.errors.securityAnswer).to.exist;
        }
    });
});
