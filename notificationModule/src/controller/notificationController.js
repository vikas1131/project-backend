const { routeHandler } = require('ca-webutils/expressx');
const NotificationService = require('../service/notificationService');
const notificationService = new NotificationService();

const notificationController = {
    createNotification: routeHandler(async ({ body }) => {
        const notification = await notificationService.createNotification(body);
        return { success: true, notification };
    }),

    getNotificationsByUser: routeHandler(async ({ params }) => {
        const { email } = params;
        const notifications = await notificationService.getNotificationsByUser(email);
        return { success: true, notifications };
    }),

    markAsRead: routeHandler(async ({ params }) => {
        const { notificationId } = params;
        const notification = await notificationService.markNotificationAsRead(notificationId);
        return { success: true, notification };
    }),

    sendNotification: routeHandler(async ({ body }) => {
        console.log('body', body);
        const result = await notificationService.sendNotification(body);
        return { success: true, result };  
    })
};

module.exports = notificationController;