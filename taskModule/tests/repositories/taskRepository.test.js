// test/taskRepository.test.js
const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');

// Import the repository and the models so that we can stub model methods.
const TaskRepository = require('../../src/repository/taskRepository'); // adjust the path as needed
const Tickets = require('../../src/model/tickets.model');
const Engineers = require('../../src/model/engineers.model');

describe('TaskRepository', function () {
    let repo;

    beforeEach(() => {
        repo = new TaskRepository();
    });

    afterEach(() => {
        // Restore all stubs after each test to avoid interference.
        sinon.restore();
    });

    describe('getTicketsByUserEmail', function () {
        it('should return tickets for the given user email excluding deferred tickets', async function () {
            const fakeTickets = [
                { id: 1, userEmail: 'user@example.com', status: 'open' },
                { id: 2, userEmail: 'user@example.com', status: 'closed' }
            ];
            const stub = sinon.stub(Tickets, 'find').resolves(fakeTickets);
            const result = await repo.getTicketsByUserEmail('user@example.com');
            expect(stub.calledOnceWithExactly({ userEmail: 'user@example.com', status: { $ne: "deferred" } })).to.be.true;
            expect(result).to.equal(fakeTickets);
        });

        it('should propagate errors from Tickets.find', async function () {
            sinon.stub(Tickets, 'find').rejects(new Error("find error"));
            try {
                await repo.getTicketsByUserEmail('user@example.com');
                throw new Error('Expected getTicketsByUserEmail to throw error');
            } catch (err) {
                expect(err.message).to.equal("find error");
            }
        });
    });

    describe('getTicketsByEngineerEmail', function () {
        it('should return tickets for the given engineer email excluding deferred tickets', async function () {
            const fakeTickets = [
                { id: 1, engineerEmail: 'eng@example.com', status: 'open' }
            ];
            const stub = sinon.stub(Tickets, 'find').resolves(fakeTickets);
            const result = await repo.getTicketsByEngineerEmail('eng@example.com');
            expect(stub.calledOnceWithExactly({ engineerEmail: 'eng@example.com', status: { $ne: "deferred" } })).to.be.true;
            expect(result).to.equal(fakeTickets);
        });

        it('should propagate errors from Tickets.find', async function () {
            sinon.stub(Tickets, 'find').rejects(new Error("find error"));
            try {
                await repo.getTicketsByEngineerEmail('eng@example.com');
                throw new Error('Expected getTicketsByEngineerEmail to throw error');
            } catch (err) {
                expect(err.message).to.equal("find error");
            }
        });
    });

    describe('getUserTicketsByStatus', function () {
        it('should return tickets for the given user email and status', async function () {
            const fakeTickets = [
                { id: 1, userEmail: 'user@example.com', status: 'open' }
            ];
            const stub = sinon.stub(Tickets, 'find').resolves(fakeTickets);
            const result = await repo.getUserTicketsByStatus('user@example.com', 'open');
            expect(stub.calledOnceWithExactly({ userEmail: 'user@example.com', status: 'open' })).to.be.true;
            expect(result).to.equal(fakeTickets);
        });
    });

    describe('getEngineerTicketsByStatus', function () {
        it('should return tickets for the given engineer email and status', async function () {
            const fakeTickets = [
                { id: 1, engineerEmail: 'eng@example.com', status: 'closed' }
            ];
            const stub = sinon.stub(Tickets, 'find').resolves(fakeTickets);
            const result = await repo.getEngineerTicketsByStatus('eng@example.com', 'closed');
            expect(stub.calledOnceWithExactly({ engineerEmail: 'eng@example.com', status: 'closed' })).to.be.true;
            expect(result).to.equal(fakeTickets);
        });
    });

    describe('getEngineerTicketsByPriority', function () {
        it('should return tickets for the given engineer email and priority', async function () {
            const fakeTickets = [
                { id: 1, engineerEmail: 'eng@example.com', priority: 'high' }
            ];
            const stub = sinon.stub(Tickets, 'find').resolves(fakeTickets);
            const result = await repo.getEngineerTicketsByPriority('eng@example.com', 'high');
            expect(stub.calledOnceWithExactly({ engineerEmail: 'eng@example.com', priority: 'high' })).to.be.true;
            expect(result).to.equal(fakeTickets);
        });
    });

    describe('updateTicketStatus', function () {
        it('should update the ticket status and return the updated ticket', async function () {
            const ticketId = 'ticket123';
            const state = 'resolved';
            const updatedTicket = { _id: ticketId, status: state };
            const stub = sinon.stub(Tickets, 'findByIdAndUpdate').resolves(updatedTicket);
            const result = await repo.updateTicketStatus(ticketId, state);
            expect(stub.calledOnce).to.be.true;
            // Validate that the update object contains the correct state. Since updatedAt is dynamic,
            // we use a matcher for its existence.
            expect(stub.calledWith(
                ticketId,
                sinon.match.has('$set', sinon.match.has('status', state)),
                { new: true, runValidators: true }
            )).to.be.true;
            expect(result).to.equal(updatedTicket);
        });

        it('should propagate errors from findByIdAndUpdate', async function () {
            sinon.stub(Tickets, 'findByIdAndUpdate').rejects(new Error("update error"));
            try {
                await repo.updateTicketStatus('ticket123', 'resolved');
                throw new Error('Expected updateTicketStatus to throw error');
            } catch (err) {
                expect(err.message).to.equal("update error");
            }
        });
    });

    describe('findEngineer', function () {
        it('should find an engineer by email', async function () {
            const engineer = { email: 'eng@example.com' };
            const stub = sinon.stub(Engineers, 'findOne').resolves(engineer);
            const result = await repo.findEngineer('eng@example.com');
            expect(stub.calledOnceWithExactly({ email: 'eng@example.com' })).to.be.true;
            expect(result).to.equal(engineer);
        });

        it('should propagate errors from Engineers.findOne', async function () {
            sinon.stub(Engineers, 'findOne').rejects(new Error("find error"));
            try {
                await repo.findEngineer('eng@example.com');
                throw new Error('Expected findEngineer to throw error');
            } catch (err) {
                expect(err.message).to.equal("find error");
            }
        });
    });

    describe('findTicket', function () {
        it('should find a ticket by id after converting it to a number', async function () {
            const ticketId = '123';
            const ticket = { _id: 123 };
            const stub = sinon.stub(Tickets, 'findOne').resolves(ticket);
            const result = await repo.findTicket(ticketId);
            expect(stub.calledOnceWithExactly({ _id: 123 })).to.be.true;
            expect(result).to.equal(ticket);
        });

        it('should propagate errors from Tickets.findOne', async function () {
            sinon.stub(Tickets, 'findOne').rejects(new Error("find error"));
            try {
                await repo.findTicket('123');
                throw new Error('Expected findTicket to throw error');
            } catch (err) {
                expect(err.message).to.equal("find error");
            }
        });
    });
});