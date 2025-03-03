const mongoose = require('mongoose');
const chai = require('chai');
const expect = chai.expect;
const Auth = require('../../src/model/auth.model'); // Adjust the path as necessary

// Connect to a test database before running the tests
before(async function () {
    await mongoose.connect('mongodb://127.0.0.1:27017/testdb', {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
    await Auth.deleteMany(); // Clean up before running tests
});

// Close the connection after tests
after(async function () {
    await mongoose.connection.close();
});

describe('Auth Model Test', function () {
    it('should create a new authentication record', async function () {
        const user = new Auth({
            email: 'test@example.com',
            password: 'securepassword',
            role: 'user'
        });
        const savedUser = await user.save();
        expect(savedUser).to.have.property('_id');
        expect(savedUser.email).to.equal('test@example.com');
        expect(savedUser.role).to.equal('user');
    });

    it('should fail when email is missing', async function () {
        try {
            const user = new Auth({
                password: 'securepassword',
                role: 'user'
            });
            await user.save();
        } catch (error) {
            expect(error).to.exist;
            expect(error.errors.email).to.exist;
        }
    });

    it('should fail when password is missing', async function () {
        try {
            const user = new Auth({
                email: 'test@example.com',
                role: 'user'
            });
            await user.save();
        } catch (error) {
            expect(error).to.exist;
            expect(error.errors.password).to.exist;
        }
    });

    it('should fail when role is not one of the allowed values', async function () {
        try {
            const user = new Auth({
                email: 'test@example.com',
                password: 'securepassword',
                role: 'invalidRole'
            });
            await user.save();
        } catch (error) {
            expect(error).to.exist;
            expect(error.errors.role).to.exist;
        }
    });

    it('should enforce unique email constraint', async function () {
        try {
            const user1 = new Auth({
                email: 'unique@example.com',
                password: 'securepassword',
                role: 'admin'
            });
            await user1.save();

            const user2 = new Auth({
                email: 'unique@example.com',
                password: 'anotherpassword',
                role: 'engineer'
            });
            await user2.save();
        } catch (error) {
            expect(error).to.exist;
        }
    });
});
