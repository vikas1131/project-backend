// test/adminRepository.test.js
const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');

// Import the repository and the models so that we can stub model methods.
const AdminRepository = require('../../src/repository/adminRepository'); // adjust the path as needed
const Users = require('../../src/model/users.model');
const Tickets = require('../../src/model/tickets.model');
const Engineers = require('../../src/model/engineers.model');

describe('AdminRepository', function () {
    let repo;

    beforeEach(() => {
        repo = new AdminRepository();
    });

    afterEach(() => {
        // Restore all stubs after each test to avoid interference.
        sinon.restore();
    });

    describe('getAllTasks', function () {
        it('should return all tasks', async function () {
            const tasks = [{ id: 1 }, { id: 2 }];
            sinon.stub(Tickets, 'find').resolves(tasks);
            const result = await repo.getAllTasks();
            expect(result).to.equal(tasks);
        });
    });

    describe('getAllUsers', function () {
        it('should return all users', async function () {
            const users = [{ name: 'Alice' }, { name: 'Bob' }];
            sinon.stub(Users, 'find').resolves(users);
            const result = await repo.getAllUsers();
            expect(result).to.equal(users);
        });
    });

    describe('getAllApprovedEngineers', function () {
        it('should return approved engineers', async function () {
            const engineers = [{ email: 'eng1@example.com' }, { email: 'eng2@example.com' }];
            sinon.stub(Engineers, 'find')
                .withArgs({ isEngineer: true })
                .resolves(engineers);
            const result = await repo.getAllApprovedEngineers();
            expect(result).to.equal(engineers);
        });
    });

    describe('getEngineerByEmail', function () {
        it('should return an engineer by email', async function () {
            const engineer = { email: 'eng@example.com' };
            sinon.stub(Engineers, 'findOne')
                .withArgs({ email: 'eng@example.com' })
                .resolves(engineer);
            const result = await repo.getEngineerByEmail('eng@example.com');
            expect(result).to.equal(engineer);
        });
    });

    describe('getTicketsByStatus', function () {
        it('should return tickets matching a status', async function () {
            const tickets = [{ status: 'open' }, { status: 'open' }];
            sinon.stub(Tickets, 'find')
                .withArgs({ status: 'open' })
                .resolves(tickets);
            const result = await repo.getTicketsByStatus('open');
            expect(result).to.equal(tickets);
        });
    });

    describe('getTicketsByPriority', function () {
        it('should return tickets matching a priority', async function () {
            const tickets = [{ priority: 'high' }, { priority: 'high' }];
            sinon.stub(Tickets, 'find')
                .withArgs({ priority: 'high' })
                .resolves(tickets);
            const result = await repo.getTicketsByPriority('high');
            expect(result).to.equal(tickets);
        });
    });

    describe('getEngineersByAvailability', function () {
        it('should return engineers available on a given day', async function () {
            const engineers = [{ availability: 'monday', isEngineer: true }];
            sinon.stub(Engineers, 'find')
                .withArgs({ availability: 'monday', isEngineer: true })
                .resolves(engineers);
            const result = await repo.getEngineersByAvailability('monday');
            expect(result).to.equal(engineers);
        });
    });

    describe('reassignTicket', function () {
        it('should return error if ticket is not found', async function () {
            sinon.stub(Tickets, 'findById')
                .withArgs('ticketId1')
                .resolves(null);
            const result = await repo.reassignTicket('ticketId1', 'neweng@example.com');
            expect(result).to.deep.equal({ success: false, message: "Ticket not found" });
        });

        it('should return error if new engineer is not found', async function () {
            const ticket = {
                _id: 'ticketId2',
                engineerEmail: null,
                save: sinon.stub().resolves()
            };
            sinon.stub(Tickets, 'findById')
                .withArgs('ticketId2')
                .resolves(ticket);
            // For new engineer lookup return null.
            sinon.stub(Engineers, 'findOne')
                .withArgs({ email: 'neweng@example.com' })
                .resolves(null);
            const result = await repo.reassignTicket('ticketId2', 'neweng@example.com');
            expect(result).to.deep.equal({ success: false, message: "Engineer not found" });
        });

        it('should reassign ticket when previous engineer exists', async function () {
            // Create a ticket that is already assigned.
            const ticket = {
                _id: 'ticketId3',
                engineerEmail: 'preveng@example.com',
                accepted: false,
                status: 'pending',
                save: sinon.stub().resolves()
            };
            // Simulate previous engineer document.
            const previousEngineer = {
                email: 'preveng@example.com',
                assignedTasks: ['ticketId3'],
                currentTasks: 1,
                save: sinon.stub().resolves()
            };
            // Simulate new engineer document.
            const newEngineer = {
                email: 'neweng@example.com',
                assignedTasks: [],
                currentTasks: 0,
                save: sinon.stub().resolves()
            };

            sinon.stub(Tickets, 'findById')
                .withArgs('ticketId3')
                .resolves(ticket);
            // Stub Engineers.findOne for both previous and new engineers.
            const findOneStub = sinon.stub(Engineers, 'findOne');
            findOneStub.withArgs({ email: 'preveng@example.com' }).resolves(previousEngineer);
            findOneStub.withArgs({ email: 'neweng@example.com' }).resolves(newEngineer);

            const result = await repo.reassignTicket('ticketId3', 'neweng@example.com');

            // Previous engineer should have the ticket removed and currentTasks decremented.
            expect(previousEngineer.assignedTasks).to.deep.equal([]);
            expect(previousEngineer.currentTasks).to.equal(0);
            // Ticket should be updated.
            expect(ticket.engineerEmail).to.equal('neweng@example.com');
            expect(ticket.accepted).to.equal(true);
            expect(ticket.status).to.equal('open');
            // New engineer should have the ticket added and currentTasks incremented.
            expect(newEngineer.assignedTasks).to.include('ticketId3');
            expect(newEngineer.currentTasks).to.equal(1);
            // Returned response.
            expect(result).to.deep.equal({ success: true, message: "Ticket reassigned successfully", ticket });
        });

        it('should reassign ticket when no previous engineer exists', async function () {
            // Ticket without an assigned engineer.
            const ticket = {
                _id: 'ticketId4',
                engineerEmail: null,
                accepted: false,
                status: 'pending',
                save: sinon.stub().resolves()
            };
            // New engineer document.
            const newEngineer = {
                email: 'neweng@example.com',
                assignedTasks: [],
                currentTasks: 0,
                save: sinon.stub().resolves()
            };

            sinon.stub(Tickets, 'findById')
                .withArgs('ticketId4')
                .resolves(ticket);
            // Stub for new engineer lookup.
            sinon.stub(Engineers, 'findOne')
                .withArgs({ email: 'neweng@example.com' })
                .resolves(newEngineer);

            const result = await repo.reassignTicket('ticketId4', 'neweng@example.com');

            // Ticket should now be assigned.
            expect(ticket.engineerEmail).to.equal('neweng@example.com');
            expect(ticket.accepted).to.equal(true);
            expect(ticket.status).to.equal('open');
            // New engineer updated.
            expect(newEngineer.assignedTasks).to.include('ticketId4');
            expect(newEngineer.currentTasks).to.equal(1);
            expect(result).to.deep.equal({ success: true, message: "Ticket reassigned successfully", ticket });
        });

        it('should handle exceptions and return error', async function () {
            sinon.stub(Tickets, 'findById').throws(new Error("Test error"));
            const result = await repo.reassignTicket('ticketId_error', 'neweng@example.com');
            expect(result).to.deep.equal({ success: false, message: "Error reassigning ticket", error: "Test error" });
        });
    });

    describe('getUnapprovedEngineers', function () {
        it('should return engineers on success', async function () {
            const engineersList = [{ email: 'eng1@example.com' }];
            sinon.stub(Engineers, 'find').resolves(engineersList);
            const result = await repo.getUnapprovedEngineers();
            expect(result).to.deep.equal({ success: true, engineers: engineersList });
        });

        it('should handle error and return failure', async function () {
            sinon.stub(Engineers, 'find').throws(new Error("DB error"));
            const result = await repo.getUnapprovedEngineers();
            expect(result).to.deep.equal({ success: false, message: "Error fetching engineers", error: "DB error" });
        });
    });

    describe('approveEngineer', function () {
        it('should update engineer approval and return the updated engineer', async function () {
            const updatedEngineer = { email: 'eng@example.com', isEngineer: true };
            sinon.stub(Engineers, 'findOneAndUpdate')
                .withArgs({ email: 'eng@example.com' }, { isEngineer: true }, { new: true })
                .resolves(updatedEngineer);
            const result = await repo.approveEngineer('eng@example.com', true);
            expect(result).to.deep.equal({ success: true, message: "Engineer approval updated", engineer: updatedEngineer });
        });

        it('should return error if engineer is not found', async function () {
            sinon.stub(Engineers, 'findOneAndUpdate')
                .withArgs({ email: 'eng@example.com' }, { isEngineer: false }, { new: true })
                .resolves(null);
            const result = await repo.approveEngineer('eng@example.com', false);
            expect(result).to.deep.equal({ success: false, message: "Engineer not found" });
        });

        it('should handle exception and return error', async function () {
            sinon.stub(Engineers, 'findOneAndUpdate').throws(new Error("Update error"));
            const result = await repo.approveEngineer('eng@example.com', true);
            expect(result).to.deep.equal({ success: false, message: "Error approving engineer", error: "Update error" });
        });
    });
});