const { expect } = require('chai');
const userController = require('../../src/controller/userController');
const UserService = require('../../src/service/userServices');

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

describe('User Controller', function () {
    let originalMethods;

    before(function () {
        // Save original UserService prototype methods for restoration
        originalMethods = {
            getAllUsers: UserService.prototype.getAllUsers,
            getTicketByStatus: UserService.prototype.getTicketByStatus,
            createUser: UserService.prototype.createUser,
            checkUser: UserService.prototype.checkUser,
            resetPassword: UserService.prototype.resetPassword,
            raiseTicket: UserService.prototype.raiseTicket,
            getProfileByRoleAndId: UserService.prototype.getProfileByRoleAndId,
            updateProfile: UserService.prototype.updateProfile,
        };
    });

    after(function () {
        // Restore original methods
        UserService.prototype.getAllUsers = originalMethods.getAllUsers;
        UserService.prototype.getTicketByStatus = originalMethods.getTicketByStatus;
        UserService.prototype.createUser = originalMethods.createUser;
        UserService.prototype.checkUser = originalMethods.checkUser;
        UserService.prototype.resetPassword = originalMethods.resetPassword;
        UserService.prototype.raiseTicket = originalMethods.raiseTicket;
        UserService.prototype.getProfileByRoleAndId = originalMethods.getProfileByRoleAndId;
        UserService.prototype.updateProfile = originalMethods.updateProfile;
    });

    describe('getAllUsers', function () {
        it('should return all users on success', async function () {
            UserService.prototype.getAllUsers = async () => {
                return [{ id: 1, name: 'John Doe' }];
            };
            const req = createMockRequest({ method: 'GET', path: '/users' });
            const res = createMockResponse();
            await userController.getAllUsers(req, res, () => { });
            expect(res.statusCode).to.equal(200);
            expect(res.body).to.deep.equal({
                success: true,
                users: [{ id: 1, name: 'John Doe' }]
            });
        });

        it('should handle errors and return a 500 error', async function () {
            UserService.prototype.getAllUsers = async () => { throw new Error('Service failure'); };
            const req = createMockRequest({ method: 'GET', path: '/users' });
            const res = createMockResponse();
            await userController.getAllUsers(req, res, () => { });
            expect(res.statusCode).to.equal(500);
            expect(res.body.message).to.equal('Service failure');
        });
    });

    describe('getTicketsByStatus', function () {
        it('should return a ticket based on status and email', async function () {
            UserService.prototype.getTicketByStatus = async (status, email) => {
                return { id: 2, status, email };
            };
            const req = createMockRequest({
                method: 'GET',
                path: '/users/tickets/status',
                params: { email: 'test@example.com', status: 'open' }
            });
            const res = createMockResponse();
            await userController.getTicketsByStatus(req, res, () => { });
            expect(res.statusCode).to.equal(200);
            expect(res.body).to.deep.equal({
                success: true,
                ticket: { id: 2, status: 'open', email: 'test@example.com' }
            });
        });

        it('should handle errors and return a 500 error', async function () {
            UserService.prototype.getTicketByStatus = async () => { throw new Error('Ticket error'); };
            const req = createMockRequest({
                method: 'GET',
                path: '/users/tickets/status',
                params: { email: 'test@example.com', status: 'closed' }
            });
            const res = createMockResponse();
            await userController.getTicketsByStatus(req, res, () => { });
            expect(res.statusCode).to.equal(500);
            expect(res.body.message).to.equal('Ticket error');
        });
    });

    describe('createNewUser', function () {
        it('should create a new user and return it', async function () {
            UserService.prototype.createUser = async (body) => {
                return { id: 3, ...body };
            };
            const req = createMockRequest({
                method: 'POST',
                path: '/users',
                body: { name: 'Jane Doe', email: 'jane@example.com' }
            });
            const res = createMockResponse();
            await userController.createNewUser(req, res, () => { });
            expect(res.statusCode).to.equal(201);
            expect(res.body).to.deep.equal({
                success: true,
                user: { id: 3, name: 'Jane Doe', email: 'jane@example.com' }
            });
        });

        it('should handle errors and return a 500 error', async function () {
            UserService.prototype.createUser = async () => { throw new Error('Create error'); };
            const req = createMockRequest({
                method: 'POST',
                path: '/users',
                body: { name: 'Jane Doe', email: 'jane@example.com' }
            });
            const res = createMockResponse();
            await userController.createNewUser(req, res, () => { });
            expect(res.statusCode).to.equal(500);
            expect(res.body.message).to.equal('Create error');
        });
    });

    describe('checkUser', function () {
        it('should check the user and return user info', async function () {
            UserService.prototype.checkUser = async (body) => {
                return { id: 4, name: 'Checked User', ...body };
            };
            const req = createMockRequest({
                method: 'POST',
                path: '/users/check',
                body: { email: 'check@example.com' }
            });
            const res = createMockResponse();
            await userController.checkUser(req, res, () => { });
            expect(res.statusCode).to.equal(201);
            expect(res.body).to.deep.equal({
                success: true,
                user: { id: 4, name: 'Checked User', email: 'check@example.com' }
            });
        });

        it('should handle errors and return a 500 error', async function () {
            UserService.prototype.checkUser = async () => { throw new Error('Check error'); };
            const req = createMockRequest({
                method: 'POST',
                path: '/users/check',
                body: { email: 'check@example.com' }
            });
            const res = createMockResponse();
            await userController.checkUser(req, res, () => { });
            expect(res.statusCode).to.equal(500);
            expect(res.body.message).to.equal('Check error');
        });
    });

    describe('resetPassword', function () {
        it('should reset password and return the updated user', async function () {
            UserService.prototype.resetPassword = async (body) => {
                return { id: 5, ...body, password: 'newpassword' };
            };
            const req = createMockRequest({
                method: 'PUT',
                path: '/users/reset',
                body: { email: 'reset@example.com' }
            });
            const res = createMockResponse();
            await userController.resetPassword(req, res, () => { });
            expect(res.statusCode).to.equal(202);
            expect(res.body).to.deep.equal({
                success: true,
                user: { id: 5, email: 'reset@example.com', password: 'newpassword' }
            });
        });

        it('should handle errors and return a 500 error', async function () {
            UserService.prototype.resetPassword = async () => { throw new Error('Reset error'); };
            const req = createMockRequest({
                method: 'PUT',
                path: '/users/reset',
                body: { email: 'reset@example.com' }
            });
            const res = createMockResponse();
            await userController.resetPassword(req, res, () => { });
            expect(res.statusCode).to.equal(500);
            expect(res.body.message).to.equal('Reset error');
        });
    });

    describe('raiseTicket', function () {
        it('should raise a ticket and return it', async function () {
            UserService.prototype.raiseTicket = async (userEmail, body) => {
                return { id: 6, userEmail, ...body };
            };
            const req = createMockRequest({
                method: 'POST',
                path: '/users/raise-ticket',
                params: { userEmail: 'raise@example.com' },
                body: { subject: 'Issue' }
            });
            const res = createMockResponse();
            await userController.raiseTicket(req, res, () => { });
            expect(res.statusCode).to.equal(201);
            expect(res.body).to.deep.equal({
                success: true,
                ticket: { id: 6, userEmail: 'raise@example.com', subject: 'Issue' }
            });
        });

        it('should handle errors and return a 500 error', async function () {
            UserService.prototype.raiseTicket = async () => { throw new Error('Ticket raise error'); };
            const req = createMockRequest({
                method: 'POST',
                path: '/users/raise-ticket',
                params: { userEmail: 'raise@example.com' },
                body: { subject: 'Issue' }
            });
            const res = createMockResponse();
            await userController.raiseTicket(req, res, () => { });
            expect(res.statusCode).to.equal(500);
            expect(res.body.message).to.equal('Ticket raise error');
        });
    });

    describe('profile', function () {
        it('should return the user profile based on role and Email', async function () {
            UserService.prototype.getProfileByRoleAndId = async (role, Email) => {
                return { id: 7, role, Email, name: 'Profile User' };
            };
            const req = createMockRequest({
                method: 'GET',
                path: '/users/profile',
                params: { role: 'admin', Email: 'profile@example.com' }
            });
            const res = createMockResponse();
            await userController.profile(req, res, () => { });
            expect(res.statusCode).to.equal(200);
            expect(res.body).to.deep.equal({
                success: true,
                profile: { id: 7, role: 'admin', Email: 'profile@example.com', name: 'Profile User' }
            });
        });

        it('should handle errors and return a 500 error', async function () {
            UserService.prototype.getProfileByRoleAndId = async () => { throw new Error('Profile error'); };
            const req = createMockRequest({
                method: 'GET',
                path: '/users/profile',
                params: { role: 'admin', Email: 'profile@example.com' }
            });
            const res = createMockResponse();
            await userController.profile(req, res, () => { });
            expect(res.statusCode).to.equal(500);
            expect(res.body.message).to.equal('Profile error');
        });
    });

    describe('updateProfile', function () {
        it('should update the user profile and return the updated profile', async function () {
            UserService.prototype.updateProfile = async (role, Email, updateBody) => {
                return { id: 8, role, Email, ...updateBody };
            };
            const req = createMockRequest({
                method: 'PUT',
                path: '/users/update-profile',
                params: { role: 'user', Email: 'update@example.com' },
                body: { name: 'Updated Name' }
            });
            const res = createMockResponse();
            await userController.updateProfile(req, res, () => { });
            expect(res.statusCode).to.equal(202);
            expect(res.body).to.deep.equal({
                success: true,
                profile: { id: 8, role: 'user', Email: 'update@example.com', name: 'Updated Name' }
            });
        });

        it('should handle errors and return a 500 error', async function () {
            UserService.prototype.updateProfile = async () => { throw new Error('Update error'); };
            const req = createMockRequest({
                method: 'PUT',
                path: '/users/update-profile',
                params: { role: 'user', Email: 'update@example.com' },
                body: { name: 'Updated Name' }
            });
            const res = createMockResponse();
            await userController.updateProfile(req, res, () => { });
            expect(res.statusCode).to.equal(500);
            expect(res.body.message).to.equal('Update error');
        });
    });
});