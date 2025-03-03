const chai = require('chai');
const chaiHttp = require('chai-http');
const sinon = require('sinon');
const express = require('express');
const userController = require('../../src/controller/userController'); // Adjust path
const userRoutes = require('../../src/route/userRoutes'); // Adjust path
const { expect } = chai;

chai.use(chaiHttp);

// Create an Express app
const app = express();
app.use(express.json());

// Mock Auth Middleware Directly (Instead of Importing)
const mockAuthMiddleware = (req, res, next) => {
    req.user = { email: 'user@example.com', role: 'user' }; // Mock user
    next();
};

describe('User Routes', () => {
    let sandbox;

    beforeEach(() => {
        sandbox = sinon.createSandbox();

        // Stub controller methods
        sandbox.stub(userController, 'getAllUsers').callsFake((req, res) =>
            res.status(200).json({ users: [] })
        );
        sandbox.stub(userController, 'getTicketsByStatus').callsFake((req, res) =>
            res.status(200).json({ tickets: [] })
        );
        sandbox.stub(userController, 'createNewUser').callsFake((req, res) =>
            res.status(201).json({ message: 'User created' })
        );
        sandbox.stub(userController, 'checkUser').callsFake((req, res) =>
            res.status(200).json({ exists: true })
        );
        sandbox.stub(userController, 'resetPassword').callsFake((req, res) =>
            res.status(200).json({ message: 'Password reset' })
        );
        sandbox.stub(userController, 'raiseTicket').callsFake((req, res) =>
            res.status(200).json({ message: 'Ticket raised' })
        );

        // Use Mocked Auth Middleware
        app.use('/user', mockAuthMiddleware, userRoutes);
    });

    afterEach(() => {
        sandbox.restore();
    });

    it('should get all users', async () => {
        const res = await chai.request(app).get('/user/');
        expect(res).to.have.status(200);
        expect(res.body).to.deep.equal({ users: [] });
    });

    it('should get tickets by status', async () => {
        const email = 'user@example.com';
        const status = 'open';
        const res = await chai.request(app).get(`/user/${email}/${status}`);
        expect(res).to.have.status(200);
        expect(res.body).to.deep.equal({ tickets: [] });
    });

    it('should create a new user', async () => {
        const newUser = { email: 'newuser@example.com', password: 'password123' };
        const res = await chai.request(app).post('/user/newUser').send(newUser);
        expect(res).to.have.status(201);
        expect(res.body).to.deep.equal({ message: 'User created' });
    });

    it('should check user existence', async () => {
        const user = { email: 'user@example.com' };
        const res = await chai.request(app).post('/user/checkUser').send(user);
        expect(res).to.have.status(200);
        expect(res.body).to.deep.equal({ exists: true });
    });

    it('should reset password', async () => {
        const resetData = { email: 'user@example.com', newPassword: 'newpassword123' };
        const res = await chai.request(app).post('/user/reset').send(resetData);
        expect(res).to.have.status(200);
        expect(res.body).to.deep.equal({ message: 'Password reset' });
    });

    it('should raise a ticket', async () => {
        const userEmail = 'user@example.com';
        const ticketData = { subject: 'Test Ticket', description: 'This is a test ticket' };
        const res = await chai.request(app).post(`/user/raiseTicket/${userEmail}`).send(ticketData);
        expect(res).to.have.status(200);
        expect(res.body).to.deep.equal({ message: 'Ticket raised' });
    });
});