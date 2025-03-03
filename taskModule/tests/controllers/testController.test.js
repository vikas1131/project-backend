const { expect } = require('chai');
const taskController = require('../../src/controller/taskController');
const TaskService = require('../../src/service/taskService');

// --- Helper Functions for Mocks ---

// Creates a fake request object
function createMockRequest(options = {}) {
    return {
        method: options.method || 'GET',
        path: options.path || '/',
        params: options.params || {},
        query: options.query || {},
        body: options.body || {},
        token: options.token || null,
        tokenError: options.tokenError || null,
        user: options.user || null,
        get(header) {
            // For simplicity, we only check Content-Type here.
            if (header.toLowerCase() === 'content-type') {
                return options.contentType || 'application/json';
            }
            return '';
        }
    };
}

// Creates a fake response object
function createMockResponse() {
    return {
        statusCode: null,
        headers: {},
        body: null,
        status(code) {
            this.statusCode = code;
            return this;
        },
        set(key, value) {
            this.headers[key] = value;
            return this;
        },
        send(body) {
            this.body = body;
            return this;
        }
    };
}

describe('Task Controller', function () {
    let originalMethods;

    before(function () {
        // Save original TaskService prototype methods for restoration
        originalMethods = {
            getTicketsByRoleAndId: TaskService.prototype.getTicketsByRoleAndId,
            getTicketsByRoleIdAndStatus: TaskService.prototype.getTicketsByRoleIdAndStatus,
            getTicketsByRoleIdAndPriority: TaskService.prototype.getTicketsByRoleIdAndPriority,
            updateTicketStatus: TaskService.prototype.updateTicketStatus,
            acceptTask: TaskService.prototype.acceptTask,
            rejectTask: TaskService.prototype.rejectTask,
        };
    });

    after(function () {
        // Restore original methods
        TaskService.prototype.getTicketsByRoleAndId = originalMethods.getTicketsByRoleAndId;
        TaskService.prototype.getTicketsByRoleIdAndStatus = originalMethods.getTicketsByRoleIdAndStatus;
        TaskService.prototype.getTicketsByRoleIdAndPriority = originalMethods.getTicketsByRoleIdAndPriority;
        TaskService.prototype.updateTicketStatus = originalMethods.updateTicketStatus;
        TaskService.prototype.acceptTask = originalMethods.acceptTask;
        TaskService.prototype.rejectTask = originalMethods.rejectTask;
    });

    describe('getTasks', function () {
        it('should return tasks based on role and email', async function () {
            TaskService.prototype.getTicketsByRoleAndId = async (role, email) => {
                return [{ id: 1, description: 'Test Task' }];
            };
            const req = createMockRequest({
                method: 'GET',
                path: '/tasks',
                params: { role: 'admin', email: 'admin@example.com' }
            });
            const res = createMockResponse();
            await taskController.getTasks(req, res, () => { });
            expect(res.statusCode).to.equal(200);
            expect(res.body).to.deep.equal({
                success: true,
                tasks: [{ id: 1, description: 'Test Task' }]
            });
        });
    });

    describe('getTasksByStatus', function () {
        it('should return tasks filtered by status', async function () {
            TaskService.prototype.getTicketsByRoleIdAndStatus = async (role, email, status) => {
                return [{ id: 2, description: 'Task by status', status }];
            };
            const req = createMockRequest({
                method: 'GET',
                path: '/tasks/status',
                params: { role: 'user', email: 'user@example.com', status: 'open' }
            });
            const res = createMockResponse();
            await taskController.getTasksByStatus(req, res, () => { });
            expect(res.statusCode).to.equal(200);
            expect(res.body).to.deep.equal({
                success: true,
                tasks: [{ id: 2, description: 'Task by status', status: 'open' }]
            });
        });
    });

    describe('getTasksByPriority', function () {
        it('should return tasks filtered by priority', async function () {
            TaskService.prototype.getTicketsByRoleIdAndPriority = async (role, email, priority) => {
                return [{ id: 3, description: 'Task by priority', priority }];
            };
            const req = createMockRequest({
                method: 'GET',
                path: '/tasks/priority',
                params: { role: 'user', email: 'user@example.com', priority: 'high' }
            });
            const res = createMockResponse();
            await taskController.getTasksByPriority(req, res, () => { });
            expect(res.statusCode).to.equal(200);
            expect(res.body).to.deep.equal({
                success: true,
                tasks: [{ id: 3, description: 'Task by priority', priority: 'high' }]
            });
        });
    });

    describe('updateTicketStatus', function () {
        it('should update the ticket status and return the updated task', async function () {
            TaskService.prototype.updateTicketStatus = async (id, status) => {
                return { id, status, description: 'Updated task' };
            };
            const req = createMockRequest({
                method: 'PUT',
                path: '/tasks/update',
                params: { id: '101' },
                body: { status: 'closed' }
            });
            const res = createMockResponse();
            await taskController.updateTicketStatus(req, res, () => { });
            expect(res.statusCode).to.equal(202);
            expect(res.body).to.deep.equal({
                success: true,
                task: { id: '101', status: 'closed', description: 'Updated task' }
            });
        });
    });

    describe('acceptTask', function () {
        it('should accept the task and return the result', async function () {
            TaskService.prototype.acceptTask = async (email, ticketId) => {
                return { ticketId, accepted: true };
            };
            const req = createMockRequest({
                method: 'GET',
                path: '/tasks/accept',
                params: { ticketId: '202', email: 'user@example.com' }
            });
            const res = createMockResponse();
            await taskController.acceptTask(req, res, () => { });
            expect(res.statusCode).to.equal(200);
            expect(res.body).to.deep.equal({
                success: true,
                result: { ticketId: '202', accepted: true }
            });
        });
    });

    describe('rejectTask', function () {
        it('should reject the task and return the result', async function () {
            TaskService.prototype.rejectTask = async (email, ticketId) => {
                return { ticketId, rejected: true };
            };
            const req = createMockRequest({
                method: 'GET',
                path: '/tasks/reject',
                params: { ticketId: '303', email: 'user@example.com' }
            });
            const res = createMockResponse();
            await taskController.rejectTask(req, res, () => { });
            expect(res.statusCode).to.equal(200);
            expect(res.body).to.deep.equal({
                success: true,
                result: { ticketId: '303', rejected: true }
            });
        });
    });
});