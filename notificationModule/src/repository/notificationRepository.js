const Notification = require('../model/notification.model'); 

class NotificationRepository {
    
    async create(notificationData) {
        const notification = new Notification(notificationData);
        return await notification.save(); 
    }

    
    async findByUserEmail(email) {
        return await Notification.find({ email: email });
    }


    async markAsReadAndDelete(notificationId) {
        const notification = await Notification.findByIdAndUpdate(
            notificationId,
            { isRead: true },
            { new: true }
        );
        await Notification.findOneAndDelete(notificationId); 
        return notification; 
    }
}

module.exports = NotificationRepository;