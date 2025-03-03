// test/userRepository.test.js
const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');

// Import the repository and models to stub their methods.
const UserRepository = require('../../src/repository/userRepository'); // adjust the path as needed
const Users = require('../../src/model/users.model');
const Tickets = require('../../src/model/tickets.model');
const auth = require('../../src/model/auth.model');
const Engineers = require('../../src/model/engineers.model');
const Admin = require('../../src/model/admin.model');

describe('UserRepository', function () {
    let repo;

    beforeEach(() => {
        repo = new UserRepository();
    });

    afterEach(() => {
        sinon.restore();
    });

    describe('getAllUsers', function () {
        it('should return all users', async function () {
            const fakeUsers = [{ id: 1 }, { id: 2 }];
            const stub = sinon.stub(Users, 'find').resolves(fakeUsers);
            const result = await repo.getAllUsers();
            expect(stub.calledOnceWithExactly({})).to.be.true;
            expect(result).to.equal(fakeUsers);
        });

        it('should propagate errors from Users.find', async function () {
            sinon.stub(Users, 'find').rejects(new Error("find error"));
            try {
                await repo.getAllUsers();
                throw new Error("Expected getAllUsers to throw");
            } catch (err) {
                expect(err.message).to.equal("find error");
            }
        });
    });

    describe('getTicketByStatus', function () {
        it('should return tickets for the given user email and status', async function () {
            const fakeTickets = [{ id: 1, userEmail: 'user@example.com', status: 'open' }];
            const stub = sinon.stub(Tickets, 'find').resolves(fakeTickets);
            const result = await repo.getTicketByStatus('open', 'user@example.com');
            expect(stub.calledOnceWithExactly({ userEmail: 'user@example.com', status: 'open' })).to.be.true;
            expect(result).to.equal(fakeTickets);
        });
    });

    describe('isUserExists', function () {
        it('should return an auth user if exists', async function () {
            const fakeAuthUser = { email: 'user@example.com' };
            const stub = sinon.stub(auth, 'findOne').resolves(fakeAuthUser);
            const result = await repo.isUserExists('user@example.com');
            expect(stub.calledOnceWithExactly({ email: 'user@example.com' })).to.be.true;
            expect(result).to.equal(fakeAuthUser);
        });
    });

    describe('createUser', function () {
        it('should create a new user', async function () {
            const userData = { name: 'Alice' };
            const fakeUser = { ...userData, _id: 1 };
            const stub = sinon.stub(Users, 'create').resolves(fakeUser);
            const result = await repo.createUser(userData);
            expect(stub.calledOnceWithExactly(userData)).to.be.true;
            expect(result).to.equal(fakeUser);
        });
    });

    describe('createEngineer', function () {
        it('should create a new engineer', async function () {
            const engineerData = { email: 'eng@example.com' };
            const fakeEngineer = { ...engineerData, _id: 1 };
            const stub = sinon.stub(Engineers, 'create').resolves(fakeEngineer);
            const result = await repo.createEngineer(engineerData);
            expect(stub.calledOnceWithExactly(engineerData)).to.be.true;
            expect(result).to.equal(fakeEngineer);
        });
    });

    describe('createAdmin', function () {
        it('should create a new admin', async function () {
            const adminData = { email: 'admin@example.com' };
            const fakeAdmin = { ...adminData, _id: 1 };
            const stub = sinon.stub(Admin, 'create').resolves(fakeAdmin);
            const result = await repo.createAdmin(adminData);
            expect(stub.calledOnceWithExactly(adminData)).to.be.true;
            expect(result).to.equal(fakeAdmin);
        });
    });

    describe('createAuthEntry', function () {
        it('should create a new auth entry', async function () {
            const entryData = { email: 'user@example.com', password: 'secret' };
            const fakeEntry = { ...entryData, _id: 1 };
            const stub = sinon.stub(auth, 'create').resolves(fakeEntry);
            const result = await repo.createAuthEntry(entryData);
            expect(stub.calledOnceWithExactly(entryData)).to.be.true;
            expect(result).to.equal(fakeEntry);
        });
    });

    describe('findAuthUser', function () {
        it('should find an auth user by credentials', async function () {
            const credentials = { email: 'user@example.com' };
            const fakeAuthUser = { email: 'user@example.com' };
            const stub = sinon.stub(auth, 'findOne').resolves(fakeAuthUser);
            const result = await repo.findAuthUser(credentials);
            expect(stub.calledOnceWithExactly({ email: credentials.email })).to.be.true;
            expect(result).to.equal(fakeAuthUser);
        });
    });

    describe('findUser', function () {
        it('should find a user by credentials', async function () {
            const credentials = { email: 'user@example.com' };
            const fakeUser = { email: 'user@example.com' };
            const stub = sinon.stub(Users, 'findOne').resolves(fakeUser);
            const result = await repo.findUser(credentials);
            expect(stub.calledOnceWithExactly({ email: credentials.email })).to.be.true;
            expect(result).to.equal(fakeUser);
        });
    });

    describe('findEngineer', function () {
        it('should find an engineer by credentials', async function () {
            const credentials = { email: 'eng@example.com' };
            const fakeEngineer = { email: 'eng@example.com' };
            const stub = sinon.stub(Engineers, 'findOne').resolves(fakeEngineer);
            const result = await repo.findEngineer(credentials);
            expect(stub.calledOnceWithExactly({ email: credentials.email })).to.be.true;
            expect(result).to.equal(fakeEngineer);
        });
    });

    describe('findAdmin', function () {
        it('should find an admin by credentials', async function () {
            const credentials = { email: 'admin@example.com' };
            const fakeAdmin = { email: 'admin@example.com' };
            const stub = sinon.stub(Admin, 'findOne').resolves(fakeAdmin);
            const result = await repo.findAdmin(credentials);
            expect(stub.calledOnceWithExactly({ email: credentials.email })).to.be.true;
            expect(result).to.equal(fakeAdmin);
        });
    });

    describe('updatePassword', function () {
        it('should update the password for a given email', async function () {
            const email = 'user@example.com';
            const newPassword = 'encryptedPass';
            const fakeResult = { nModified: 1 };
            const stub = sinon.stub(auth, 'updateOne').resolves(fakeResult);
            const result = await repo.updatePassword(email, newPassword);
            expect(stub.calledOnceWithExactly({ email }, { password: newPassword })).to.be.true;
            expect(result).to.equal(fakeResult);
        });
    });

    describe('getLastTicket', function () {
        it('should return the last ticket', async function () {
            const fakeTicket = { _id: 100, status: 'closed' };
            // Stub the query chain: findOne().sort(...).limit(1)
            const limitStub = sinon.stub().resolves(fakeTicket);
            const sortStub = sinon.stub().returns({ limit: limitStub });
            sinon.stub(Tickets, 'findOne').returns({ sort: sortStub });
            const result = await repo.getLastTicket();
            expect(sortStub.calledOnceWithExactly({ _id: -1 })).to.be.true;
            expect(limitStub.calledOnceWithExactly(1)).to.be.true;
            expect(result).to.equal(fakeTicket);
        });
    });

    describe('getTicketInstance', function () {
        it('should return a new Ticket instance with provided data', function () {
            const ticketData = { status: 'open' };
            const instance = repo.getTicketInstance(ticketData);
            expect(instance).to.be.an.instanceof(Tickets);
            expect(instance).to.include(ticketData);
        });
    });

    describe('getAvailability', function () {
        it('should return engineers available on the given day(s)', async function () {
            const days = ['monday'];
            const fakeEngineers = [{ email: 'eng@example.com' }];
            const stub = sinon.stub(Engineers, 'find').resolves(fakeEngineers);
            const result = await repo.getAvailability(days);
            expect(stub.calledOnceWithExactly({ availability: { $in: days } })).to.be.true;
            expect(result).to.equal(fakeEngineers);
        });
    });

    describe('updateTicket', function () {
        it('should update the ticket with the assigned engineer id', async function () {
            const ticket = { _id: 'ticket123' };
            const assignedEngineer = { _id: 'eng123' };
            const fakeTicket = { _id: 'ticket123', engineerId: 'eng123' };
            const stub = sinon.stub(Tickets, 'findOneAndUpdate').resolves(fakeTicket);
            const result = await repo.updateTicket(ticket, assignedEngineer);
            expect(stub.calledOnceWithExactly(
                { _id: ticket._id },
                { engineerId: assignedEngineer._id },
                { new: true }
            )).to.be.true;
            expect(result).to.equal(fakeTicket);
        });
    });

    describe('updateEngineer (using findOneAndUpdate by email)', function () {
        it('should update the engineer profile based on email and profile object', async function () {
            const email = 'eng@example.com';
            const profile = { bio: 'Updated bio' };
            const fakeEngineer = { email, ...profile };
            const stub = sinon.stub(Engineers, 'findOneAndUpdate').resolves(fakeEngineer);
            const result = await repo.updateEngineer(email, profile);
            expect(stub.calledOnceWithExactly({ email: email }, profile, { new: true })).to.be.true;
            expect(result).to.equal(fakeEngineer);
        });
    });

    describe('getUser', function () {
        it('should return a user for a given email', async function () {
            const email = 'user@example.com';
            const fakeUser = { email };
            const stub = sinon.stub(Users, 'findOne').resolves(fakeUser);
            const result = await repo.getUser(email);
            expect(stub.calledOnceWithExactly({ email })).to.be.true;
            expect(result).to.equal(fakeUser);
        });
    });

    describe('getEngineer', function () {
        it('should return an engineer for a given email', async function () {
            const email = 'eng@example.com';
            const fakeEngineer = { email };
            const stub = sinon.stub(Engineers, 'findOne').resolves(fakeEngineer);
            const result = await repo.getEngineer(email);
            expect(stub.calledOnceWithExactly({ email })).to.be.true;
            expect(result).to.equal(fakeEngineer);
        });
    });

    describe('updateUser', function () {
        it('should update a user with the given email and body', async function () {
            const email = 'user@example.com';
            const body = { name: 'New Name' };
            const fakeUser = { email, ...body };
            const stub = sinon.stub(Users, 'findOneAndUpdate').resolves(fakeUser);
            const result = await repo.updateUser(email, body);
            expect(stub.calledOnceWithExactly({ email }, body, { new: true })).to.be.true;
            expect(result).to.equal(fakeUser);
        });
    });

    describe('updateEngineerProfile', function () {
        it('should update an engineer profile with the given email and body', async function () {
            const email = 'eng@example.com';
            const body = { bio: 'New bio' };
            const fakeEngineer = { email, ...body };
            const stub = sinon.stub(Engineers, 'findOneAndUpdate').resolves(fakeEngineer);
            const result = await repo.updateEngineerProfile(email, body);
            expect(stub.calledOnceWithExactly({ email }, body, { new: true })).to.be.true;
            expect(result).to.equal(fakeEngineer);
        });
    });
});