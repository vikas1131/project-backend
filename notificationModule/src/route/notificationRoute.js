const express = require('express');
const notificationController = require('../controller/notificationController');

const router = express.Router();

// Create a new notification
router.post('/addNotification', notificationController.createNotification);

// Get all notifications for a user
router.get('/getNotifications/:email', notificationController.getNotificationsByUser);

// Mark a notification as read
router.patch('/updateNotification/:notificationId', notificationController.markAsRead);

//send email notification
router.post('/sendNotification', notificationController.sendNotification);

module.exports = router;