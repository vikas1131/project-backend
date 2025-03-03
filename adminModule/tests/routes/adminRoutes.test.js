const chai = require('chai');
const chaiHttp = require('chai-http');
const sinon = require('sinon');
const express = require('express');
const adminController = require('../../src/controller/adminController'); // Adjust path
const adminRoutes = require('../../src/route/adminRoutes'); // Adjust path
const { expect } = chai;

chai.use(chaiHttp);

// Create an Express app
const app = express();
app.use(express.json());

// Mock Auth Middleware Directly (Instead of Importing)
const mockAuthMiddleware = (req, res, next) => {
    req.user = { email: 'admin@example.com', role: 'admin' }; // Mock admin user
    next();
};

describe('Admin Routes', () => {
    let sandbox;
    let token 
    token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InZpa2FzMDdAZ21haWwuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzQwMjg3NDYzLCJleHAiOjE3NDAyOTQ2NjN9.FKVFKDi7whssImr9r1dwIhTVVouTJVlx4GYSTCAPmoQ';
    
    beforeEach(() => {
        sandbox = sinon.createSandbox();

        // Stub controller methods
        sandbox.stub(adminController, 'getAllTasks').callsFake((req, res) =>
            res.status(200).json({ message: 'Tasks fetched' })
        );
        sandbox.stub(adminController, 'getUsersByRole').callsFake((req, res) =>
            res.status(200).json({ users: [] })
        );
        sandbox.stub(adminController, 'getTicketsByStatus').callsFake((req, res) =>
            res.status(200).json({ tasks: [] })
        );
        sandbox.stub(adminController, 'reassignTicket').callsFake((req, res) =>
            res.status(200).json({ message: 'Task reassigned' })
        );
        sandbox.stub(adminController, 'approveEngineer').callsFake((req, res) =>
            res.status(200).json({ message: 'Engineer approved' })
        );

        // Use Mocked Auth Middleware
        app.use('/admin', mockAuthMiddleware, adminRoutes);
    });

    afterEach(() => {
        token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InZpa2FzMDdAZ21haWwuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzQwMjg3NDYzLCJleHAiOjE3NDAyOTQ2NjN9.FKVFKDi7whssImr9r1dwIhTVVouTJVlx4GYSTCAPmoQ';
        sandbox.restore(); 
    });

    it('should get all tasks', () => {
        chai.request(app)
            .get('/admin/tasks')
            .set('Authorization', `Bearer ${token}`)
            .end((err, res) => {
                if (err) {
                    console.error('Error:', err);
                }
                console.log('Response status:', res.status);
                console.log('Response body:', res.body);
                expect(res).to.have.status(200);
                expect(res.body).to.deep.equal({ message: 'Tasks fetched' });
            });
    });

    it('should get all users by role', () => {
        chai.request(app)
            .get('/admin/admins')
            .set('Authorization', `Bearer ${token}`)
            .end((err, res) => {
                if (err) {
                    console.error('Error:', err);
                }
                console.log('Response status:', res.status);
                console.log('Response body:', res.body);
                expect(res).to.have.status(200);
                expect(res.body).to.deep.equal({ users: [] });
            });
    });

    it('should get tasks by status', () => {
        chai.request(app)
            .get('/admin/status/open')
            .set('Authorization', `Bearer ${token}`)
            .end((err, res) => {
                if (err) {
                    console.error('Error:', err);
                }
                console.log('Response status:', res.status);
                console.log('Response body:', res.body);
                expect(res).to.have.status(200);
                expect(res.body).to.deep.equal({ tasks: [] });
            });
    });

    it('should reassign a task', () => {
        chai.request(app)
            .patch('/admin/reassign/1234/newEngineer@example.com')
            .set('Authorization', `Bearer ${token}`)
            .end((err, res) => {
                if (err) {
                    console.error('Error:', err);
                }
                console.log('Response status:', res.status);
                console.log('Response body:', res.body);
                expect(res).to.have.status(200);
                expect(res.body).to.deep.equal({ message: 'Task reassigned' });
            });
    });

    it('should approve an engineer', () => {
        chai.request(app)
            .patch('/admin/approve-engineer/test@example.com')
            .set('Authorization', `Bearer ${token}`)
            .end((err, res) => {
                if (err) {
                    console.error('Error:', err);
                }
                console.log('Response status:', res.status);
                console.log('Response body:', res.body);
                expect(res).to.have.status(202);
                expect(res.body).to.deep.equal({ message: 'Engineer approval updated' });
            });
    });
});