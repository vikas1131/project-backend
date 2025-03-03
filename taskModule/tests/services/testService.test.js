// tests/services/taskService.test.js
const { expect } = require('chai');
const sinon = require('sinon');
const axios = require('axios');
require('dotenv').config();

const TaskService = require('../../src/service/taskService'); // adjust path if needed

describe('TaskService', function () {
    this.timeout(5000);
    let taskService;
    let repoStub;

    beforeEach(function () {
        // Create a new TaskService instance
        taskService = new TaskService();

        // Stub repository methods by replacing the service's TaskRepository
        repoStub = {
            getTicketsByUserEmail: sinon.stub(),
            getTicketsByEngineerEmail: sinon.stub(),
            getUserTicketsByStatus: sinon.stub(),
            getEngineerTicketsByStatus: sinon.stub(),
            getUserTicketsByPriority: sinon.stub(),
            getEngineerTicketsByPriority: sinon.stub(),
            updateTicketStatus: sinon.stub(),
            findEngineer: sinon.stub(),
            findTicket: sinon.stub()
        };

        taskService.TaskRepository = repoStub;
    });

    describe('getTicketsByRoleAndId', function () {
        it('should call getTicketsByUserEmail when role is "user"', async function () {
            const email = 'user@example.com';
            const expected = [{ id: 1, email }];
            repoStub.getTicketsByUserEmail.resolves(expected);

            const result = await taskService.getTicketsByRoleAndId('user', email);
            expect(repoStub.getTicketsByUserEmail.calledOnceWith(email)).to.be.true;
            expect(result).to.deep.equal(expected);
        });

        it('should call getTicketsByEngineerEmail when role is "engineer"', async function () {
            const email = 'eng@example.com';
            const expected = [{ id: 2, email }];
            repoStub.getTicketsByEngineerEmail.resolves(expected);

            const result = await taskService.getTicketsByRoleAndId('engineer', email);
            expect(repoStub.getTicketsByEngineerEmail.calledOnceWith(email)).to.be.true;
            expect(result).to.deep.equal(expected);
        });

        it('should return an error object for an invalid role', async function () {
            const email = 'someone@example.com';
            const result = await taskService.getTicketsByRoleAndId('admin', email);
            expect(result).to.deep.equal({ error: "invalid role" });
        });
    });

    describe('getTicketsByRoleIdAndStatus', function () {
        it('should call getUserTicketsByStatus when role is "user"', async function () {
            const email = 'user@example.com';
            const status = 'open';
            const expected = [{ id: 1, status }];
            repoStub.getUserTicketsByStatus.resolves(expected);

            const result = await taskService.getTicketsByRoleIdAndStatus('user', email, status);
            expect(repoStub.getUserTicketsByStatus.calledOnceWith(email, status)).to.be.true;
            expect(result).to.deep.equal(expected);
        });

        it('should call getEngineerTicketsByStatus when role is "engineer"', async function () {
            const email = 'eng@example.com';
            const status = 'open';
            const expected = [{ id: 2, status }];
            repoStub.getEngineerTicketsByStatus.resolves(expected);

            const result = await taskService.getTicketsByRoleIdAndStatus('engineer', email, status);
            expect(repoStub.getEngineerTicketsByStatus.calledOnceWith(email, status)).to.be.true;
            expect(result).to.deep.equal(expected);
        });

        it('should return an error object for an invalid role', async function () {
            const email = 'invalid@example.com';
            const status = 'open';
            const result = await taskService.getTicketsByRoleIdAndStatus('admin', email, status);
            expect(result).to.deep.equal({ error: "invalid role" });
        });
    });

    describe('getTicketsByRoleIdAndPriority', function () {
        it('should call getUserTicketsByPriority when role is "user"', async function () {
            const email = 'user@example.com';
            const priority = 'high';
            const expected = [{ id: 1, priority }];
            repoStub.getUserTicketsByPriority.resolves(expected);

            const result = await taskService.getTicketsByRoleIdAndPriority('user', email, priority);
            expect(repoStub.getUserTicketsByPriority.calledOnceWith(email, priority)).to.be.true;
            expect(result).to.deep.equal(expected);
        });

        it('should call getEngineerTicketsByPriority when role is "engineer"', async function () {
            const email = 'eng@example.com';
            const priority = 'low';
            const expected = [{ id: 2, priority }];
            repoStub.getEngineerTicketsByPriority.resolves(expected);

            const result = await taskService.getTicketsByRoleIdAndPriority('engineer', email, priority);
            expect(repoStub.getEngineerTicketsByPriority.calledOnceWith(email, priority)).to.be.true;
            expect(result).to.deep.equal(expected);
        });

        it('should return an error object for an invalid role', async function () {
            const email = 'invalid@example.com';
            const priority = 'medium';
            const result = await taskService.getTicketsByRoleIdAndPriority('admin', email, priority);
            expect(result).to.deep.equal({ error: "invalid role" });
        });
    });

    describe('sendNotification', function () {
        let axiosPostStub;
        const apiUrl = 'https://localhost:8003/api/notifications/sendNotification';

        beforeEach(function () {
            axiosPostStub = sinon.stub(axios, 'post');
        });
        afterEach(function () {
            axiosPostStub.restore();
        });

        it('should throw an error when any field is missing', async function () {
            try {
                await taskService.sendNotification(null, 'Subject', 'Body');
                throw new Error('Expected error was not thrown');
            } catch (error) {
                expect(error.message).to.equal("missing fields: email or subject or body is missing");
            }
        });

        it('should send notification and return response data when axios.post succeeds', async function () {
            const email = 'user@example.com';
            const subject = 'Test Subject';
            const body = 'Test Body';
            const responseData = { message: 'Notification sent' };
            axiosPostStub.resolves({ data: responseData });

            const result = await taskService.sendNotification(email, subject, body);
            expect(axiosPostStub.calledOnce).to.be.true;
            expect(axiosPostStub.calledWith(apiUrl, {
                userEmail: email,
                subject,
                emailBody: body
            })).to.be.true;
            expect(result).to.deep.equal(responseData);
        });

        it('should throw an error when axios.post fails', async function () {
            const email = 'user@example.com';
            const subject = 'Test Subject';
            const body = 'Test Body';
            axiosPostStub.rejects(new Error('API failure'));

            try {
                await taskService.sendNotification(email, subject, body);
                throw new Error('Expected error was not thrown');
            } catch (error) {
                expect(error.message).to.equal('API failure');
            }
        });
    });

    describe('updateTicketStatus', function () {
        it('should return an error message for an invalid status', async function () {
            // Assuming valid statuses are: ['open', 'in-progress', 'completed', 'failed', 'deferred']
            const ticketId = 1;
            const state = 'invalidStatus';
            const result = await taskService.updateTicketStatus(ticketId, state);
            expect(result.message).to.contain(`Error updating ticket status: Invalid status: ${ state }`);
        });

        it('should return an error message when ticket is not found', async function () {
            const ticketId = 1;
            const state = 'open';
            repoStub.updateTicketStatus.resolves(null);

            const result = await taskService.updateTicketStatus(ticketId, state);
            expect(result.message).to.contain('Error updating ticket status: Ticket not found');
        });

        it('should update ticket successfully without triggering sendNotification for non-completed state', async function () {
            const ticketId = 1;
            const state = 'in-progress';
            const ticket = { _id: ticketId, userEmail: 'user@example.com' };
            repoStub.updateTicketStatus.resolves(ticket);

            const result = await taskService.updateTicketStatus(ticketId, state);
            expect(repoStub.updateTicketStatus.calledOnceWith(ticketId, state)).to.be.true;
            expect(result).to.deep.equal(ticket);
        });

        it('should update ticket successfully and call sendNotification when state is "completed"', async function () {
            const ticketId = 1;
            const state = 'completed';
            const ticket = { _id: ticketId, userEmail: 'user@example.com' };
            repoStub.updateTicketStatus.resolves(ticket);

            // Stub sendNotification to prevent an actual axios call
            const sendNotificationStub = sinon.stub(taskService, 'sendNotification').resolves({ message: 'Notification sent' });

            const result = await taskService.updateTicketStatus(ticketId, state);
            expect(repoStub.updateTicketStatus.calledOnceWith(ticketId, state)).to.be.true;
            expect(sendNotificationStub.calledOnceWith(
                ticket.userEmail,
                'Ticket resolved',
                `Your ticket with id ${ticket._id} has been resolved. `
            )).to.be.true;
            expect(result).to.deep.equal(ticket);

            sendNotificationStub.restore();
        });
    });

    describe('acceptTask', function () {
        it('should return error if engineer is not found', async function () {
            repoStub.findEngineer.resolves(null);
            const result = await taskService.acceptTask('eng@example.com', 1);
            expect(result).to.deep.equal({ success: false, message: 'Engineer not found' });
        });

        it('should return error for an invalid ticket ID', async function () {
            repoStub.findEngineer.resolves({}); // Engineer found
            const result = await taskService.acceptTask('eng@example.com', 'abc');
            expect(result).to.deep.equal({ success: false, message: 'Invalid ticket ID' });
        });

        it('should return error if ticket is not found', async function () {
            repoStub.findEngineer.resolves({}); // Engineer found
            repoStub.findTicket.resolves(null);
            const result = await taskService.acceptTask('eng@example.com', 1);
            expect(result).to.deep.equal({ success: false, message: 'Ticket not found' });
        });

        it('should return error if task is already accepted by the same engineer', async function () {
            const engineer = { assignedTasks: [1], currentTasks: 1, save: sinon.stub().resolves() };
            const ticket = { accepted: true, engineerEmail: 'eng@example.com', save: sinon.stub().resolves() };
            repoStub.findEngineer.resolves(engineer);
            repoStub.findTicket.resolves(ticket);

            const result = await taskService.acceptTask('eng@example.com', 1);
            expect(result).to.deep.equal({ success: false, message: 'Task already assigned to this engineer' });
        });

        it('should accept the task successfully', async function () {
            // Fake engineer and ticket objects with a save stub
            const engineer = { assignedTasks: [], currentTasks: 0, save: sinon.stub().resolves() };
            const ticket = { accepted: false, engineerEmail: null, save: sinon.stub().resolves() };
            repoStub.findEngineer.resolves(engineer);
            repoStub.findTicket.resolves(ticket);

            const result = await taskService.acceptTask('eng@example.com', 1);
            expect(ticket.save.calledOnce).to.be.true;
            expect(engineer.save.calledOnce).to.be.true;
            expect(engineer.assignedTasks).to.include(1);
            expect(engineer.currentTasks).to.equal(1);
            expect(result.success).to.be.true;
            expect(result.message).to.equal('Task accepted successfully');
            expect(result.ticket).to.equal(ticket);
        });
    });

    describe('rejectTask', function () {
        it('should return error if engineer is not found', async function () {
            repoStub.findEngineer.resolves(null);
            const result = await taskService.rejectTask('eng@example.com', 1);
            expect(result).to.deep.equal({ success: false, message: 'Engineer not found' });
        });

        it('should return error for an invalid ticket ID', async function () {
            repoStub.findEngineer.resolves({}); // Engineer found
            const result = await taskService.rejectTask('eng@example.com', 'abc');
            expect(result).to.deep.equal({ success: false, message: 'Invalid ticket ID' });
        });

        it('should return error if ticket is not found', async function () {
            repoStub.findEngineer.resolves({}); // Engineer found
            repoStub.findTicket.resolves(null);
            const result = await taskService.rejectTask('eng@example.com', 1);
            expect(result).to.deep.equal({ success: false, message: 'Ticket not found' });
        });

        it('should return error if task is not assigned to the engineer', async function () {
            const engineer = { assignedTasks: [2], currentTasks: 1, save: sinon.stub().resolves() };
            const ticket = { engineerEmail: 'other@example.com', accepted: true, save: sinon.stub().resolves() };
            repoStub.findEngineer.resolves(engineer);
            repoStub.findTicket.resolves(ticket);

            const result = await taskService.rejectTask('eng@example.com', 1);
            expect(result).to.deep.equal({ success: false, message: 'Task is not assigned to this engineer' });
        });

        it('should reject the task successfully', async function () {
            // Engineer has the ticket in assignedTasks (as string)
            const engineer = {
                assignedTasks: ['1'],
                currentTasks: 1,
                save: sinon.stub().resolves()
            };
            const ticket = {
                engineerEmail: 'eng@example.com',
                accepted: true,
                save: sinon.stub().resolves()
            };
            repoStub.findEngineer.resolves(engineer);
            repoStub.findTicket.resolves(ticket);

            const result = await taskService.rejectTask('eng@example.com', 1);
            expect(engineer.save.calledOnce).to.be.true;
            expect(ticket.save.calledOnce).to.be.true;
            expect(result).to.deep.equal({ success: true, message: 'Task rejected successfully' });
        });
    });
});