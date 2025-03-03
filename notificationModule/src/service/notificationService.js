const NotificationRepository = require('../repository/notificationRepository');
require("dotenv").config();

const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

class NotificationService {
    constructor() {
        this.notificationRepository = new NotificationRepository();
    }

    
    async createNotification(notificationData) {
        return await this.notificationRepository.create(notificationData);
    }

    
    async getNotificationsByUser(email) {
        return await this.notificationRepository.findByUserEmail(email);
    }

    
    async markNotificationAsRead(notificationId) {
        return await this.notificationRepository.markAsReadAndDelete(notificationId);
    }

    
    async sendNotification(body){
        const { userEmail, subject, emailBody } = body;
        console.log("userEmail", userEmail);
        if (!userEmail || !subject || !emailBody) {
            return res.status(400).json({ error: "Missing required fields" });
        }
        const mailOptions = { to: userEmail, subject: subject, text: emailBody };
        try {
            const res = await transporter.sendMail(mailOptions);
            console.log("Email sent:", res);
            return { message: "Notification sent successfully" };
        } catch (error) {
            console.error("Error sending email:", error);
            return { error: "Failed to send email" };
        }
    }
}

module.exports = NotificationService;