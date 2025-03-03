const Users = require('../model/users.model');
const Tickets = require('../model/tickets.model');
const auth = require('../model/auth.model');
const Engineers = require('../model/engineers.model');
const Admin = require('../model/admin.model')

class AdminRepository {
    async getAllTasks() {
        return await Tickets.find();
    }

    async getAllUsers() {
        return await Users.find();
    }

    async getAllApprovedEngineers() {
        return await Engineers.find({ isEngineer: true });
    }

    async getEngineerByEmail(email) {
        return await Engineers.findOne({ email });
    }

    async getTicketsByStatus(status) {
        return await Tickets.find({ status });
    }

    async getTicketsByPriority(level) {
        return await Tickets.find({ priority: level });
    }

    async getEngineersByAvailability(day) {
        return await Engineers.find({
            availability: day,
            isEngineer: true
        });
    }

    // Simple database interactions for reassigning tickets
    async findTicketById(ticketId) {
        return await Tickets.findById(ticketId);
    }

    async saveTicket(ticket) {
        return await ticket.save();
    }

    async saveEngineer(engineer) {
        return await engineer.save();
    }

    // Get all engineers without filtering
    async getAllEngineers() {
        return await Engineers.find({});
    }

    async getEngineersBySpecialization(specialization, day, excludeEmail = null) {
        const query = {
            isEngineer: true,
            availability: day,
            specialization: specialization.toLowerCase(),
        };
        
        // Use case-insensitive regex for specialization matching
        if (specialization) {
            query.specialization = new RegExp('^' + specialization + '$', 'i');
        }
        
        // Exclude the engineer who deferred the ticket if provided
        if (excludeEmail) {
            query.email = { $ne: excludeEmail };
        }
        
        return await Engineers.find(query);
    }

    // Update engineer approval status
    async updateEngineerApproval(email, approvalStatus) {
        return await Engineers.findOneAndUpdate(
            { email: email },
            { isEngineer: approvalStatus },
            { new: true }
        );
    }
}

module.exports = AdminRepository;