const { expect } = require('chai');
const adminController = require('../../src/controller/adminController.js');
const AdminService = require('../../src/service/adminServices.js');

// If NotFoundError is not defined globally, define it for tests.
if (typeof global.NotFoundError === 'undefined') {
    global.NotFoundError = class NotFoundError extends Error {
        constructor(message, details) {
            super(message);
            this.details = details;
        }
    };
}

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

describe('Admin Controller', function () {
    let originalMethods;

    before(function () {
        // Save original AdminService methods to restore after tests
        originalMethods = {
            getAllTasks: AdminService.prototype.getAllTasks,
            getUsersByRole: AdminService.prototype.getUsersByRole,
            getEngineerByEmail: AdminService.prototype.getEngineerByEmail,
            getTicketsByStatus: AdminService.prototype.getTicketsByStatus,
            getTicketsByPriority: AdminService.prototype.getTicketsByPriority,
            getEngineersByAvailability: AdminService.prototype.getEngineersByAvailability,
            reassignTicket: AdminService.prototype.reassignTicket,
            getUnapprovedEngineers: AdminService.prototype.getUnapprovedEngineers,
            approveEngineer: AdminService.prototype.approveEngineer,
        };
    });

    after(function () {
        // Restore original methods
        AdminService.prototype.getAllTasks = originalMethods.getAllTasks;
        AdminService.prototype.getUsersByRole = originalMethods.getUsersByRole;
        AdminService.prototype.getEngineerByEmail = originalMethods.getEngineerByEmail;
        AdminService.prototype.getTicketsByStatus = originalMethods.getTicketsByStatus;
        AdminService.prototype.getTicketsByPriority = originalMethods.getTicketsByPriority;
        AdminService.prototype.getEngineersByAvailability = originalMethods.getEngineersByAvailability;
        AdminService.prototype.reassignTicket = originalMethods.reassignTicket;
        AdminService.prototype.getUnapprovedEngineers = originalMethods.getUnapprovedEngineers;
        AdminService.prototype.approveEngineer = originalMethods.approveEngineer;
    });

    describe('getAllTasks', function () {
        it('should return tasks on success when tasks exist', async function () {
            // Stub to return a non-empty array of tasks.
            AdminService.prototype.getAllTasks = async () => [{ id: 1, name: 'Task 1' }];
            const req = createMockRequest({ method: 'GET', path: '/tasks' });
            const res = createMockResponse();
            await adminController.getAllTasks(req, res, () => { });
            expect(res.statusCode).to.equal(200);
            expect(res.body).to.deep.equal({ success: true, tasks: [{ id: 1, name: 'Task 1' }] });
        });

        it('should return a "no tasks found" message when task array is empty', async function () {
            AdminService.prototype.getAllTasks = async () => [];
            const req = createMockRequest({ method: 'GET', path: '/tasks' });
            const res = createMockResponse();
            await adminController.getAllTasks(req, res, () => { });
            // Note: the controller returns 200 with an error message object.
            expect(res.statusCode).to.equal(200);
            expect(res.body).to.deep.equal({ status: 404, message: 'No tasks found.' });
        });
    });

    describe('getUsersByRole', function () {
        it('should return users by role on success', async function () {
            AdminService.prototype.getUsersByRole = async (role) => [{ id: 1, name: 'User 1', role }];
            const req = createMockRequest({ method: 'GET', path: '/users/role', params: { role: 'admin' } });
            const res = createMockResponse();
            await adminController.getUsersByRole(req, res, () => { });
            expect(res.statusCode).to.equal(200);
            expect(res.body).to.deep.equal({
                success: true,
                users: [{ id: 1, name: 'User 1', role: 'admin' }]
            });
        });

        it('should return a "no users found" message when user array is empty', async function () {
            AdminService.prototype.getUsersByRole = async () => [];
            const req = createMockRequest({ method: 'GET', path: '/users/role', params: { role: 'guest' } });
            const res = createMockResponse();
            await adminController.getUsersByRole(req, res, () => { });
            expect(res.statusCode).to.equal(200);
            expect(res.body).to.deep.equal({ status: 404, message: 'No users found' });
        });

        it('should handle service errors with a 500 error', async function () {
            AdminService.prototype.getUsersByRole = async () => { throw new Error('Test error'); };
            const req = createMockRequest({ method: 'GET', path: '/users/role', params: { role: 'admin' } });
            const res = createMockResponse();
            await adminController.getUsersByRole(req, res, () => { });
            expect(res.statusCode).to.equal(500);
            expect(res.body.message).to.equal('Test error');
        });
    });

    describe('getEngineerByEmail', function () {
        it('should return engineer details on success', async function () {
            AdminService.prototype.getEngineerByEmail = async (email) => ({ id: 2, name: 'Engineer 1', email });
            const req = createMockRequest({ method: 'GET', path: '/engineer', params: { Email: 'eng@example.com' } });
            const res = createMockResponse();
            await adminController.getEngineerByEmail(req, res, () => { });
            expect(res.statusCode).to.equal(200);
            expect(res.body).to.deep.equal({
                success: true,
                engineer: { id: 2, name: 'Engineer 1', email: 'eng@example.com' }
            });
        });

        it('should return error message when engineer is not found', async function () {
            AdminService.prototype.getEngineerByEmail = async () => null;
            const req = createMockRequest({ method: 'GET', path: '/engineer', params: { Email: 'notfound@example.com' } });
            const res = createMockResponse();
            await adminController.getEngineerByEmail(req, res, () => { });
            expect(res.statusCode).to.equal(200);
            expect(res.body).to.deep.equal({
                status: 404,
                message: `No Engineer Found with Email: notfound@example.com`
      });
    });
});

describe('getTicketsByStatus', function () {
    it('should return tickets by status on success', async function () {
        AdminService.prototype.getTicketsByStatus = async (status) => [{ id: 10, status }];
        const req = createMockRequest({ method: 'GET', path: '/tickets/status', params: { status: 'open' } });
        const res = createMockResponse();
        await adminController.getTicketsByStatus(req, res, () => { });
        expect(res.statusCode).to.equal(200);
        expect(res.body).to.deep.equal({ success: true, tickets: [{ id: 10, status: 'open' }] });
    });

    it('should return error message when no tickets found', async function () {
        AdminService.prototype.getTicketsByStatus = async () => [];
        const req = createMockRequest({ method: 'GET', path: '/tickets/status', params: { status: 'closed' } });
        const res = createMockResponse();
        await adminController.getTicketsByStatus(req, res, () => { });
        expect(res.statusCode).to.equal(200);
        expect(res.body).to.deep.equal({
            status: 404,
            message: `No tasks found with status closed`
        });
    });
});

describe('getTicketsByPriority', function () {
    it('should return tickets by priority on success', async function () {
        AdminService.prototype.getTicketsByPriority = async (level) => [{ id: 20, priority: level }];
        const req = createMockRequest({ method: 'GET', path: '/tickets/priority', params: { level: 'high' } });
        const res = createMockResponse();
        await adminController.getTicketsByPriority(req, res, () => { });
        expect(res.statusCode).to.equal(200);
        expect(res.body).to.deep.equal({ success: true, tickets: [{ id: 20, priority: 'high' }] });
    });

    it('should return error message when no tickets are found', async function () {
        AdminService.prototype.getTicketsByPriority = async () => [];
        const req = createMockRequest({ method: 'GET', path: '/tickets/priority', params: { level: 'low' } });
        const res = createMockResponse();
        await adminController.getTicketsByPriority(req, res, () => { });
        expect(res.statusCode).to.equal(200);
        expect(res.body).to.deep.equal({
            status: 404,
            message: `No tasks found with priority low`
        });
    });
});

describe('getEngineersByAvailability', function () {
    it('should return available engineers on success', async function () {
        AdminService.prototype.getEngineersByAvailability = async (day) => [{ id: 30, name: 'Engineer A', availableDay: day }];
        const req = createMockRequest({ method: 'GET', path: '/engineers/availability', params: { day: 'Monday' } });
        const res = createMockResponse();
        await adminController.getEngineersByAvailability(req, res, () => { });
        expect(res.statusCode).to.equal(200);
        expect(res.body.success).to.be.true;
        expect(res.body.message).to.include('Monday');
        expect(res.body.engineers).to.deep.equal([{ id: 30, name: 'Engineer A', availableDay: 'Monday' }]);
    });

    it('should return error message when no engineers are available', async function () {
        AdminService.prototype.getEngineersByAvailability = async () => [];
        const req = createMockRequest({ method: 'GET', path: '/engineers/availability', params: { day: 'Tuesday' } });
        const res = createMockResponse();
        await adminController.getEngineersByAvailability(req, res, () => { });
        expect(res.statusCode).to.equal(200);
        expect(res.body).to.deep.equal({
            status: 404,
            message: `No engineers available on Tuesday`
        });
    });
});

describe('reassignTicket', function () {
    it('should reassign ticket on success', async function () {
        AdminService.prototype.reassignTicket = async (ticketId, newEngineerEmail) => {
            return { success: true, ticketId, newEngineerEmail };
        };
        const req = createMockRequest({
            method: 'GET',
            path: '/ticket/reassign',
            params: { ticketId: '123', newEngineerEmail: 'eng@example.com' }
        });
        const res = createMockResponse();
        await adminController.reassignTicket(req, res, () => { });
        expect(res.statusCode).to.equal(200);
        expect(res.body).to.deep.equal({
            success: true,
            ticketId: '123',
            newEngineerEmail: 'eng@example.com'
        });
    });

    it('should return an error message when required params are missing', async function () {
        const req = createMockRequest({ method: 'GET', path: '/ticket/reassign', params: {} });
        const res = createMockResponse();
        await adminController.reassignTicket(req, res, () => { });
        expect(res.statusCode).to.equal(200);
        expect(res.body).to.deep.equal({
            status: 400,
            message: "Ticket ID and Engineer Email are required"
        });
    });

    it('should return a 500 error on service error', async function () {
        AdminService.prototype.reassignTicket = async () => { throw new Error('Reassign failed'); };
        const req = createMockRequest({
            method: 'GET',
            path: '/ticket/reassign',
            params: { ticketId: '123', newEngineerEmail: 'eng@example.com' }
        });
        const res = createMockResponse();
        await adminController.reassignTicket(req, res, () => { });
        expect(res.statusCode).to.equal(500);
        expect(res.body.message).to.equal('Reassign failed');
    });
});

describe('getUnapprovedEngineers', function () {
    it('should return unapproved engineers on success', async function () {
        AdminService.prototype.getUnapprovedEngineers = async () => ({ success: true, engineers: [{ id: 40, name: 'Engineer B' }] });
        const req = createMockRequest({ method: 'GET', path: '/engineers/unapproved' });
        const res = createMockResponse();
        await adminController.getUnapprovedEngineers(req, res, () => { });
        expect(res.statusCode).to.equal(200);
        expect(res.body).to.deep.equal({ success: true, engineers: [{ id: 40, name: 'Engineer B' }] });
    });

    it('should return an error message on failure', async function () {
        AdminService.prototype.getUnapprovedEngineers = async () => ({ success: false, message: 'No unapproved engineers' });
        const req = createMockRequest({ method: 'GET', path: '/engineers/unapproved' });
        const res = createMockResponse();
        await adminController.getUnapprovedEngineers(req, res, () => { });
        expect(res.statusCode).to.equal(200);
        expect(res.body).to.deep.equal({ status: 404, message: 'No unapproved engineers' });
    });

    it('should return a 500 error on service error', async function () {
        AdminService.prototype.getUnapprovedEngineers = async () => { throw new Error('Service failure'); };
        const req = createMockRequest({ method: 'GET', path: '/engineers/unapproved' });
        const res = createMockResponse();
        await adminController.getUnapprovedEngineers(req, res, () => { });
        expect(res.statusCode).to.equal(500);
        expect(res.body.message).to.equal('Service failure');
    });
});

describe('approveEngineer', function () {
    it('should approve an engineer on success', async function () {
        AdminService.prototype.approveEngineer = async (email, approve) => ({ success: true, email, approved: approve });
        const req = createMockRequest({
            method: 'GET',
            path: '/engineers/approve',
            params: { email: 'eng2@example.com' },
            body: { approve: true }
        });
        const res = createMockResponse();
        await adminController.approveEngineer(req, res, () => { });
        expect(res.statusCode).to.equal(200);
        expect(res.body).to.deep.equal({ success: true, email: 'eng2@example.com', approved: true });
    });

    it('should return an error message when approval fails', async function () {
        AdminService.prototype.approveEngineer = async () => ({ success: false, message: 'Engineer not found' });
        const req = createMockRequest({
            method: 'GET',
            path: '/engineers/approve',
            params: { email: 'eng2@example.com' },
            body: { approve: false }
        });
        const res = createMockResponse();
        await adminController.approveEngineer(req, res, () => { });
        expect(res.statusCode).to.equal(200);
        expect(res.body).to.deep.equal({ status: 404, message: 'Engineer not found' });
    });

    it('should return a 500 error on service error', async function () {
        AdminService.prototype.approveEngineer = async () => { throw new Error('Approval failed'); };
        const req = createMockRequest({
            method: 'GET',
            path: '/engineers/approve',
            params: { email: 'eng2@example.com' },
            body: { approve: true }
        });
        const res = createMockResponse();
        await adminController.approveEngineer(req, res, () => { });
        expect(res.statusCode).to.equal(500);
        expect(res.body.message).to.equal('Approval failed');
    });
});
});