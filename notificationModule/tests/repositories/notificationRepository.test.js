const chai = require("chai");
const sinon = require("sinon");
const mongoose = require("mongoose");
const NotificationRepository = require("../../src/repository/notificationRepository");
const Notification = require("../../src/model/notification.model");

const { expect } = chai;

describe("NotificationRepository", function () {
    let notificationRepo;
    let sandbox;

    beforeEach(function () {
        notificationRepo = new NotificationRepository();
        sandbox = sinon.createSandbox();
    });

    afterEach(function () {
        sandbox.restore();
    });

    it("should create a new notification", async function () {
        const newNotification = { email: "user@example.com", message: "New alert" };
        const createdNotification = { _id: "notif1", ...newNotification };
        sandbox.stub(Notification.prototype, "save").resolves(createdNotification);

        const result = await notificationRepo.create(newNotification);
        expect(result).to.deep.equal(createdNotification);
    });

    it("should get notifications by user email", async function () {
        const mockNotifications = [{ _id: "notif1", email: "user@example.com" }];
        sandbox.stub(Notification, "find").resolves(mockNotifications);

        const result = await notificationRepo.findByUserEmail("user@example.com");
        expect(result).to.deep.equal(mockNotifications);
    });

    it("should mark notification as read and delete it", async function () {
        const mockNotification = { _id: "notif1", isRead: true };
        sandbox.stub(Notification, "findByIdAndUpdate").resolves(mockNotification);
        sandbox.stub(Notification, "findOneAndDelete").resolves(mockNotification);

        const result = await notificationRepo.markAsReadAndDelete("notif1");
        expect(result).to.deep.equal(mockNotification);
    });

    it("should return null when marking a non-existing notification as read and deleting it", async function () {
        sandbox.stub(Notification, "findByIdAndUpdate").resolves(null);
        sandbox.stub(Notification, "findOneAndDelete").resolves(null);

        const result = await notificationRepo.markAsReadAndDelete("nonexistentId");
        expect(result).to.be.null;
    });
});
