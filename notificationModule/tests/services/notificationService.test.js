const { expect } = require('chai');
const sinon = require('sinon');
const nodemailer = require('nodemailer');
const NotificationService = require('../../src/service/notificationService'); // <-- Adjust path if needed
const NotificationRepository = require('../../src/repository/notificationRepository');

require('dotenv').config();

describe('NotificationService', function () {
    let notificationService;
    let createStub;
    let findByUserEmailStub;
    let markAsReadAndDeleteStub;
    let sendMailStub;

    //
    // 1) Provide a global "res" so that your service's res.status(400).json(...)
    //    doesn't cause an error. We can spy or stub these as needed.
    //
    global.res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub().returnsThis(),
    };

    //
    // 2) Stub out nodemailer.createTransport BEFORE creating NotificationService
    //
    before(function () {
        sinon.stub(nodemailer, 'createTransport').callsFake(() => {
            return {
                sendMail: (mailOptions) => sendMailStub(mailOptions),
            };
        });
    });

    after(function () {
        nodemailer.createTransport.restore();
    });

    //
    // 3) Before each test, set up fresh stubs for repository methods and sendMail
    //
    beforeEach(function () {
        // Default stubs for repository methods
        createStub = sinon.stub().resolves({ id: 1, message: 'Test notification' });
        findByUserEmailStub = sinon
            .stub()
            .resolves([{ id: 1, userEmail: 'test@example.com', message: 'Test notification' }]);
        markAsReadAndDeleteStub = sinon
            .stub()
            .resolves({ id: 1, status: 'read and deleted' });

        // Create new service instance
        notificationService = new NotificationService();

        // Replace real repo methods with our stubs
        notificationService.notificationRepository.create = createStub;
        notificationService.notificationRepository.findByUserEmail = findByUserEmailStub;
        notificationService.notificationRepository.markAsReadAndDelete = markAsReadAndDeleteStub;

        // Default stub for sendMail (successful)
        sendMailStub = sinon.stub().resolves('Email sent response');

        // Reset the global res stubs for each test
        global.res.status.resetHistory();
        global.res.json.resetHistory();
    });

    //
    // 4) Tests
    //
    describe('createNotification', function () {
        it('should create a notification and return the created object', async function () {
            const notificationData = { message: 'Test notification' };
            const result = await notificationService.createNotification(notificationData);

            expect(createStub.calledOnceWith(notificationData)).to.be.true;
            expect(result).to.deep.equal({ id: 1, message: 'Test notification' });
        });
    });

    describe('getNotificationsByUser', function () {
        it('should return notifications for a given email', async function () {
            const email = 'test@example.com';
            const result = await notificationService.getNotificationsByUser(email);

            expect(findByUserEmailStub.calledOnceWith(email)).to.be.true;
            expect(result).to.deep.equal([
                { id: 1, userEmail: 'test@example.com', message: 'Test notification' },
            ]);
        });
    });

    describe('markNotificationAsRead', function () {
        it('should mark a notification as read and delete it', async function () {
            const notificationId = 1;
            const result = await notificationService.markNotificationAsRead(notificationId);

            expect(markAsReadAndDeleteStub.calledOnceWith(notificationId)).to.be.true;
            expect(result).to.deep.equal({ id: 1, status: 'read and deleted' });
        });
    });

    describe('sendNotification', function () {
        //
        // 4.1) Missing required fields => calls res.status(400).json(...)
        //
        it('should return an error when required fields are missing', async function () {
            // userEmail is missing
            const body = { subject: 'Hello', emailBody: 'Test email' };
            const result = await notificationService.sendNotification(body);

            // Confirm that res.status was called with 400
            expect(global.res.status.calledOnceWith(400)).to.be.true;
            // Confirm that res.json was called with our error object
            expect(global.res.json.calledOnceWith({ error: 'Missing required fields' })).to.be.true;

            // The service is returning whatever res.status(400).json(...) returns,
            // which is typically the res object itself. You can check it if needed:
            // expect(result).to.equal(global.res);
        });

        //
        // 4.2) Successful email send
        //
        it('should send an email and return a success message', async function () {
            // By default, sendMailStub is set to succeed
            const body = { userEmail: 'test@example.com', subject: 'Hello', emailBody: 'Test email' };
            const result = await notificationService.sendNotification(body);

            // Confirm no error response was sent
            expect(global.res.status.notCalled).to.be.true;
            expect(global.res.json.notCalled).to.be.true;

            // Confirm the service returns a success object
            expect(result).to.deep.equal({ message: 'Notification sent successfully' });
        });

        //
        // 4.3) Failed email send
        //
        it('should return an error message when email sending fails', async function () {
            // Force sendMail to reject
            sendMailStub.rejects(new Error('Failed to send email'));

            const body = { userEmail: 'test@example.com', subject: 'Hello', emailBody: 'Test email' };
            const result = await notificationService.sendNotification(body);

            // Confirm no error response was sent via res
            expect(global.res.status.notCalled).to.be.true;
            expect(global.res.json.notCalled).to.be.true;

            // Confirm the service returns our custom error object
            expect(result).to.deep.equal({ error: 'Failed to send email' });
        });
    });
});