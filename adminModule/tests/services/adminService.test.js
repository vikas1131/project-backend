const AdminService = require('../../src/service/adminServices');
const AdminRepository = require('../../src/repository/adminRepository');
const assert = require('assert');
const sinon = require('sinon');
const { expect } = require('chai');
describe('AdminService', () => {
    let adminService;
    let mockAdminRepository;

    //this.timeout(5000);

    before(function () {
        this.timeout(5000);
        process.on('unhandledRejection', (reason, promise) => {
            console.error('Unhandled rejection at:', promise, 'reason:', reason);
        })
    })

    beforeEach(() => {
        mockAdminRepository = new AdminRepository();
        adminService = new AdminService();
        adminService.adminRepository = mockAdminRepository;
    });

    afterEach(() => {
        sinon.restore();
    })

    after(() => {
        sinon.restore();

        process.removeAllListeners('unhandledRejection');
    });

    describe('getAllTasks', () => {
        it('should return all tasks when the database is not empty', async () => {
            const mockTasks = [
                { id: 1, title: 'Task 1' },
                { id: 2, title: 'Task 2' },
            ];

            const getAllTasksStub = sinon.stub(mockAdminRepository, 'getAllTasks').resolves(mockTasks);

            const result = await adminService.getAllTasks();

            assert(getAllTasksStub.calledOnce, 'getAllTasks should be called once');
            assert.deepStrictEqual(result, mockTasks, 'Result should match mockTasks');

            getAllTasksStub.restore();
        });
    });


    describe('getUsersByRole', () => {
        const mockUsers = [
            { id: 1, name: 'User 1' },
            { id: 2, name: 'User 2' }
        ];

        const mockEngineers = [
            { id: 1, name: 'Engineer 1' },
            { id: 2, name: 'Engineer 2' }
        ];

        it('should return all users when role is "users"', async () => {
            const getAllUsersStub = sinon.stub(mockAdminRepository, 'getAllUsers').resolves(mockUsers);

            const result = await adminService.getUsersByRole('users');

            assert(getAllUsersStub.calledOnce, 'getAllUsers should be called once');
            assert.deepStrictEqual(result, mockUsers, 'Result should match mockUsers');
        });

        it('should return all engineers when role is "engineers"', async () => {
            const getAllEngineersStub = sinon
                .stub(mockAdminRepository, 'getAllApprovedEngineers')
                .resolves(mockEngineers);

            const result = await adminService.getUsersByRole('engineers');

            assert(getAllEngineersStub.calledOnce, 'getAllApprovedEngineers should be called once');
            assert.deepStrictEqual(result, mockEngineers, 'Result should match mockEngineers');
        });

        it('should return empty array when database returns no users', async () => {
            const getAllUsersStub = sinon.stub(mockAdminRepository, 'getAllUsers').resolves([]);

            const result = await adminService.getUsersByRole('users');

            assert(getAllUsersStub.calledOnce, 'getAllUsers should be called once');
            assert.deepStrictEqual(result, [], 'Result should be an empty array');
        });

        it('should return empty array when database returns no engineers', async () => {
            const getAllEngineersStub = sinon
                .stub(mockAdminRepository, 'getAllApprovedEngineers')
                .resolves([]);

            const result = await adminService.getUsersByRole('engineers');

            assert(getAllEngineersStub.calledOnce, 'getAllApprovedEngineers should be called once');
            assert.deepStrictEqual(result, [], 'Result should be an empty array');
        });

        it('should return empty array for invalid role', async () => {
            const getAllUsersStub = sinon.stub(mockAdminRepository, 'getAllUsers');
            const getAllEngineersStub = sinon.stub(mockAdminRepository, 'getAllApprovedEngineers');

            const result = await adminService.getUsersByRole('invalid_role');

            assert(getAllUsersStub.notCalled, 'getAllUsers should not be called');
            assert(getAllEngineersStub.notCalled, 'getAllApprovedEngineers should not be called');
            assert.deepStrictEqual(result, [], 'Result should be an empty array');
        });

        it('should handle database errors for users role', async () => {
            const error = new Error('Database error');
            sinon.stub(mockAdminRepository, 'getAllUsers').rejects(error);

            await assert.rejects(
                adminService.getUsersByRole('users'),
                { message: 'Database error' }
            );
        });

        it('should handle database errors for engineers role', async () => {
            const error = new Error('Database error');
            sinon.stub(mockAdminRepository, 'getAllApprovedEngineers').rejects(error);

            await assert.rejects(
                adminService.getUsersByRole('engineers'),
                { message: 'Database error' }
            );
        });
    });

    describe('getEngineerByEmail', () => {
        const mockEngineer = {
            id: 1,
            email: 'engineer@example.com',
            name: 'John Doe'
        };

        //   afterEach(() => {
        //       sinon.restore();
        //   });

        it('should return engineer when email exists', async () => {
            const getEngineerStub = sinon
                .stub(mockAdminRepository, 'getEngineerByEmail')
                .resolves(mockEngineer);

            const result = await adminService.getEngineerByEmail('engineer@example.com');

            assert(getEngineerStub.calledOnce, 'getEngineerByEmail should be called once');
            assert(getEngineerStub.calledWith('engineer@example.com'));
            assert.deepStrictEqual(result, mockEngineer, 'Result should match mockEngineer');
        });

        const nullCases = [
            { desc: 'non-existent email', value: 'nonexistent@example.com' },
            { desc: 'empty email', value: '' },
            { desc: 'null email', value: null },
            { desc: 'undefined email', value: undefined }
        ];

        nullCases.forEach(({ desc, value }) => {
            it(`should return null for ${desc}`, async () => {
                const getEngineerStub = sinon
                    .stub(mockAdminRepository, 'getEngineerByEmail')
                    .resolves(null);

                const result = await adminService.getEngineerByEmail(value);

                assert(getEngineerStub.calledOnce, 'getEngineerByEmail should be called once');
                assert(getEngineerStub.calledWith(value));
                assert.strictEqual(result, null, 'Result should be null');
            });
        });

        it('should handle database errors', async () => {
            const error = new Error('Database error');
            sinon.stub(mockAdminRepository, 'getEngineerByEmail').rejects(error);

            await assert.rejects(
                adminService.getEngineerByEmail('engineer@example.com'),
                { message: 'Database error' }
            );
        });
    });

    describe('getTicketsByStatus', () => {
        const mockTickets = [
            { id: 1, title: 'Ticket 1', status: 'open' },
            { id: 2, title: 'Ticket 2', status: 'open' }
        ];

        // afterEach(() => {
        //     sinon.restore();
        // });

        it('should return tickets when status exists', async () => {
            const getTicketsStub = sinon
                .stub(mockAdminRepository, 'getTicketsByStatus')
                .resolves(mockTickets);

            const result = await adminService.getTicketsByStatus('open');

            assert(getTicketsStub.calledOnce, 'getTicketsByStatus should be called once');
            assert(getTicketsStub.calledWith('open'));
            assert.deepStrictEqual(result, mockTickets, 'Result should match mockTickets');
        });

        const validStatuses = ['open', 'closed', 'pending', 'in-progress'];
        validStatuses.forEach(status => {
            it(`should handle ${status} status`, async () => {
                const statusTickets = [
                    { id: 1, title: 'Ticket 1', status },
                    { id: 2, title: 'Ticket 2', status }
                ];

                const getTicketsStub = sinon
                    .stub(mockAdminRepository, 'getTicketsByStatus')
                    .resolves(statusTickets);

                const result = await adminService.getTicketsByStatus(status);

                assert(getTicketsStub.calledOnce, 'getTicketsByStatus should be called once');
                assert(getTicketsStub.calledWith(status));
                assert.deepStrictEqual(result, statusTickets, `Result should match ${status} tickets`);
            });
        });

        const nullCases = [
            { desc: 'empty status', value: '' },
            { desc: 'null status', value: null },
            { desc: 'undefined status', value: undefined },
            { desc: 'invalid status', value: 'invalid_status' }
        ];

        nullCases.forEach(({ desc, value }) => {
            it(`should return empty array for ${desc}`, async () => {
                const getTicketsStub = sinon
                    .stub(mockAdminRepository, 'getTicketsByStatus')
                    .resolves([]);

                const result = await adminService.getTicketsByStatus(value);

                assert(getTicketsStub.calledOnce, 'getTicketsByStatus should be called once');
                assert(getTicketsStub.calledWith(value));
                assert.deepStrictEqual(result, [], 'Result should be an empty array');
            });
        });

        it('should handle database errors', async () => {
            const error = new Error('Database error');
            sinon.stub(mockAdminRepository, 'getTicketsByStatus').rejects(error);

            await assert.rejects(
                adminService.getTicketsByStatus('open'),
                { message: 'Database error' }
            );
        });
    });

    describe('getTicketsByPriority', () => {
        const mockTickets = [
            { id: 1, title: 'Ticket 1', priority: 'high' },
            { id: 2, title: 'Ticket 2', priority: 'high' }
        ];

        // afterEach(() => {
        //     sinon.restore();
        // });

        it('should return tickets when priority level exists', async () => {
            const getTicketsStub = sinon
                .stub(mockAdminRepository, 'getTicketsByPriority')
                .resolves(mockTickets);

            const result = await adminService.getTicketsByPriority('high');

            assert(getTicketsStub.calledOnce, 'getTicketsByPriority should be called once');
            assert(getTicketsStub.calledWith('high'));
            assert.deepStrictEqual(result, mockTickets, 'Result should match mockTickets');
        });

        const validPriorities = ['high', 'medium', 'low'];
        validPriorities.forEach(priority => {
            it(`should handle ${priority} priority level`, async () => {
                const priorityTickets = [
                    { id: 1, title: 'Ticket 1', priority },
                    { id: 2, title: 'Ticket 2', priority }
                ];

                const getTicketsStub = sinon
                    .stub(mockAdminRepository, 'getTicketsByPriority')
                    .resolves(priorityTickets);

                const result = await adminService.getTicketsByPriority(priority);

                assert(getTicketsStub.calledOnce, 'getTicketsByPriority should be called once');
                assert(getTicketsStub.calledWith(priority));
                assert.deepStrictEqual(result, priorityTickets, `Result should match ${priority} tickets`);
            });
        });

        const nullCases = [
            { desc: 'empty priority', value: '' },
            { desc: 'null priority', value: null },
            { desc: 'undefined priority', value: undefined },
            { desc: 'invalid priority', value: 'invalid_priority' }
        ];

        nullCases.forEach(({ desc, value }) => {
            it(`should return empty array for ${desc}`, async () => {
                const getTicketsStub = sinon
                    .stub(mockAdminRepository, 'getTicketsByPriority')
                    .resolves([]);

                const result = await adminService.getTicketsByPriority(value);

                assert(getTicketsStub.calledOnce, 'getTicketsByPriority should be called once');
                assert(getTicketsStub.calledWith(value));
                assert.deepStrictEqual(result, [], 'Result should be an empty array');
            });
        });

        it('should handle database errors', async () => {
            const error = new Error('Database error');
            sinon.stub(mockAdminRepository, 'getTicketsByPriority').rejects(error);

            await assert.rejects(
                adminService.getTicketsByPriority('high'),
                { message: 'Database error' }
            );
        });
    });

    describe('getEngineersByAvailability', () => {
        const mockEngineers = [
            { id: 1, name: 'Engineer 1', availability: ['Monday', 'Tuesday'] },
            { id: 2, name: 'Engineer 2', availability: ['Monday', 'Wednesday'] }
        ];

        it('should return engineers when day exists', async () => {
            const getEngineersStub = sinon
                .stub(mockAdminRepository, 'getEngineersByAvailability')  // Changed method name
                .resolves(mockEngineers);

            const result = await adminService.getEngineersByAvailability('Monday');

            assert(getEngineersStub.calledOnce, 'getEngineersByAvailability should be called once');
            assert(getEngineersStub.calledWith('Monday'));
            assert.deepStrictEqual(result, mockEngineers, 'Result should match mockEngineers');
        });

        const validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
        validDays.forEach(day => {
            it(`should handle ${day} availability`, async () => {
                const dayEngineers = [
                    { id: 1, name: 'Engineer 1', availability: [day] },
                    { id: 2, name: 'Engineer 2', availability: [day] }
                ];

                const getEngineersStub = sinon
                    .stub(mockAdminRepository, 'getEngineersByAvailability')  // Changed method name
                    .resolves(dayEngineers);

                const result = await adminService.getEngineersByAvailability(day);

                assert(getEngineersStub.calledOnce, 'getEngineersByAvailability should be called once');
                assert(getEngineersStub.calledWith(day));
                assert.deepStrictEqual(result, dayEngineers, `Result should match ${day} engineers`);
            });
        });

        const nullCases = [
            { desc: 'empty day', value: '' },
            { desc: 'null day', value: null },
            { desc: 'undefined day', value: undefined },
            { desc: 'invalid day', value: 'InvalidDay' }
        ];

        nullCases.forEach(({ desc, value }) => {
            it(`should return empty array for ${desc}`, async () => {
                const getEngineersStub = sinon
                    .stub(mockAdminRepository, 'getEngineersByAvailability')  // Changed method name
                    .resolves([]);

                const result = await adminService.getEngineersByAvailability(value);

                assert(getEngineersStub.calledOnce, 'getEngineersByAvailability should be called once');
                assert(getEngineersStub.calledWith(value));
                assert.deepStrictEqual(result, [], 'Result should be an empty array');
            });
        });

        it('should handle database errors', async () => {
            const error = new Error('Database error');
            sinon.stub(mockAdminRepository, 'getEngineersByAvailability').rejects(error);  // Changed method name

            await assert.rejects(
                adminService.getEngineersByAvailability('Monday'),
                { message: 'Database error' }
            );
        });
    });
    describe('reassignTicket', () => {
        const mockTicket = {
            id: 1,
            title: 'Test Ticket',
            engineerEmail: 'newengineer@example.com'
        };

        //   afterEach(() => {
        //       sinon.restore();
        //   });

        it('should successfully reassign ticket to new engineer', async () => {
            const reassignStub = sinon
                .stub(mockAdminRepository, 'reassignTicket')
                .resolves(mockTicket);

            const result = await adminService.reassignTicket(1, 'newengineer@example.com');

            assert(reassignStub.calledOnce, 'reassignTicket should be called once');
            assert(reassignStub.calledWith(1, 'newengineer@example.com'));
            assert.deepStrictEqual(result, mockTicket, 'Result should match mockTicket');
        });

        const invalidCases = [
            { desc: 'invalid ticket ID', ticketId: 999, email: 'valid@example.com' },
            { desc: 'null ticket ID', ticketId: null, email: 'valid@example.com' },
            { desc: 'undefined ticket ID', ticketId: undefined, email: 'valid@example.com' },
            { desc: 'invalid email', ticketId: 1, email: 'invalid-email' },
            { desc: 'empty email', ticketId: 1, email: '' },
            { desc: 'null email', ticketId: 1, email: null },
            { desc: 'undefined email', ticketId: 1, email: undefined }
        ];

        invalidCases.forEach(({ desc, ticketId, email }) => {
            it(`should handle ${desc}`, async () => {
                const reassignStub = sinon
                    .stub(mockAdminRepository, 'reassignTicket')
                    .resolves(null);

                const result = await adminService.reassignTicket(ticketId, email);

                assert(reassignStub.calledOnce, 'reassignTicket should be called once');
                assert(reassignStub.calledWith(ticketId, email));
                assert.strictEqual(result, null, 'Result should be null');
            });
        });

        it('should handle database errors', async () => {
            const error = new Error('Database error');
            sinon.stub(mockAdminRepository, 'reassignTicket').rejects(error);

            await assert.rejects(
                adminService.reassignTicket(1, 'newengineer@example.com'),
                { message: 'Database error' }
            );
        });
    });

    describe('getUnapprovedEngineers', () => {
        const mockUnapprovedEngineers = [
            { id: 1, email: 'engineer1@example.com', status: 'pending' },
            { id: 2, email: 'engineer2@example.com', status: 'pending' }
        ];

        //   afterEach(() => {
        //       sinon.restore();
        //   });

        it('should return all unapproved engineers', async () => {
            const getUnapprovedStub = sinon
                .stub(mockAdminRepository, 'getUnapprovedEngineers')
                .resolves(mockUnapprovedEngineers);

            const result = await adminService.getUnapprovedEngineers();

            assert(getUnapprovedStub.calledOnce, 'getUnapprovedEngineers should be called once');
            assert.deepStrictEqual(result, mockUnapprovedEngineers, 'Result should match mockUnapprovedEngineers');
        });

        it('should return empty array when no unapproved engineers exist', async () => {
            const getUnapprovedStub = sinon
                .stub(mockAdminRepository, 'getUnapprovedEngineers')
                .resolves([]);

            const result = await adminService.getUnapprovedEngineers();

            assert(getUnapprovedStub.calledOnce, 'getUnapprovedEngineers should be called once');
            assert.deepStrictEqual(result, [], 'Result should be an empty array');
        });

        it('should handle database errors', async () => {
            const error = new Error('Database error');
            sinon.stub(mockAdminRepository, 'getUnapprovedEngineers').rejects(error);

            await assert.rejects(
                adminService.getUnapprovedEngineers(),
                { message: 'Database error' }
            );
        });
    });

    describe('approveEngineer', () => {
        const mockApprovedEngineer = {
            id: 1,
            email: 'engineer@example.com',
            status: 'approved'
        };

        //   afterEach(() => {
        //       sinon.restore();
        //   });

        it('should successfully approve an engineer', async () => {
            const approveStub = sinon
                .stub(mockAdminRepository, 'approveEngineer')
                .resolves(mockApprovedEngineer);

            const result = await adminService.approveEngineer('engineer@example.com', true);

            assert(approveStub.calledOnce, 'approveEngineer should be called once');
            assert(approveStub.calledWith('engineer@example.com', true));
            assert.deepStrictEqual(result, mockApprovedEngineer, 'Result should match mockApprovedEngineer');
        });

        it('should successfully reject an engineer', async () => {
            const rejectedEngineer = { ...mockApprovedEngineer, status: 'rejected' };
            const approveStub = sinon
                .stub(mockAdminRepository, 'approveEngineer')
                .resolves(rejectedEngineer);

            const result = await adminService.approveEngineer('engineer@example.com', false);

            assert(approveStub.calledOnce, 'approveEngineer should be called once');
            assert(approveStub.calledWith('engineer@example.com', false));
            assert.deepStrictEqual(result, rejectedEngineer, 'Result should match rejectedEngineer');
        });

        const invalidCases = [
            { desc: 'invalid email', email: 'invalid-email', approve: true },
            { desc: 'empty email', email: '', approve: true },
            { desc: 'null email', email: null, approve: true },
            { desc: 'undefined email', email: undefined, approve: true },
            { desc: 'null approve value', email: 'valid@example.com', approve: null },
            { desc: 'undefined approve value', email: 'valid@example.com', approve: undefined }
        ];

        invalidCases.forEach(({ desc, email, approve }) => {
            it(`should handle ${desc}`, async () => {
                const approveStub = sinon
                    .stub(mockAdminRepository, 'approveEngineer')
                    .resolves(null);

                const result = await adminService.approveEngineer(email, approve);

                assert(approveStub.calledOnce, 'approveEngineer should be called once');
                assert(approveStub.calledWith(email, approve));
                assert.strictEqual(result, null, 'Result should be null');
            });
        });

        it('should handle database errors', async () => {
            const error = new Error('Database error');
            sinon.stub(mockAdminRepository, 'approveEngineer').rejects(error);

            await assert.rejects(
                adminService.approveEngineer('engineer@example.com', true),
                { message: 'Database error' }
            );
        });
    });

});
