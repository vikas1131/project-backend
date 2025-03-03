const { expect } = require("chai");
const sinon = require("sinon");
const notificationController = require("../../src/controller/notificationController");
const NotificationService = require("../../src/service/notificationService");

describe("Notification Controller Unit Tests", function () {
    let sandbox;
    let mockService;

    beforeEach(() => {
        sandbox = sinon.createSandbox();

        mockService = {
            createNotification: sandbox.stub(),
            getNotificationsByUser: sandbox.stub(),
            markNotificationAsRead: sandbox.stub()
        };

        const realService = notificationController.notificationService || NotificationService.prototype;

        sandbox.stub(realService, "createNotification").callsFake(mockService.createNotification);
        sandbox.stub(realService, "getNotificationsByUser").callsFake(mockService.getNotificationsByUser);
        sandbox.stub(realService, "markNotificationAsRead").callsFake(mockService.markNotificationAsRead);
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe("createNotification", function () {
        it("should create a new notification successfully", async function () {
            const newNotification = { id: "1", message: "New update available" };
            mockService.createNotification.resolves(newNotification);

            const req = { method: "POST", body: { message: "New update available" } };
            const res = { status: sandbox.stub().returnsThis(), send: sandbox.stub() };
            const next = sandbox.stub();

            await notificationController.createNotification(req, res, next);

            expect(mockService.createNotification.calledOnce).to.be.true;
            expect(res.status.calledWith(201)).to.be.true;
            expect(res.send.calledWith({ success: true, notification: newNotification })).to.be.true;
        });
    });

    describe("getNotificationsByUser", function () {
        it("should fetch notifications by user successfully", async function () {
            const notifications = [{ id: "2", message: "Task assigned" }];
            mockService.getNotificationsByUser.resolves(notifications);

            const req = { method: "GET", params: { email: "test@example.com" } };
            const res = { status: sandbox.stub().returnsThis(), send: sandbox.stub() };
            const next = sandbox.stub();

            await notificationController.getNotificationsByUser(req, res, next);

            expect(mockService.getNotificationsByUser.calledOnce).to.be.true;
            expect(res.status.calledWith(200)).to.be.true;
            expect(res.send.calledWith({ success: true, notifications })).to.be.true;
        });
    });

    describe("markAsRead", function () {
        it("should mark a notification as read successfully", async function () {
            const updatedNotification = { id: "3", message: "Task completed", read: true };
            mockService.markNotificationAsRead.resolves(updatedNotification);

            const req = { method: "PATCH", params: { notificationId: "3" } };
            const res = { status: sandbox.stub().returnsThis(), send: sandbox.stub() };
            const next = sandbox.stub();

            await notificationController.markAsRead(req, res, next);

            expect(mockService.markNotificationAsRead.calledOnce).to.be.true;
            expect(res.status.calledWith(202)).to.be.true;
            expect(res.send.calledWith({ success: true, notification: updatedNotification })).to.be.true;
        });
    });
});
