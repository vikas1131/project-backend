const Users = require('../model/users.model'); 
const Tickets = require('../model/tickets.model');
const auth = require('../model/auth.model');
const Engineers = require('../model/engineers.model');
const Admin = require('../model/admin.model')

class TaskRepository { 
    async getTicketsByUserEmail(email) {
        return await Tickets.find({ userEmail: email, status: { $ne: "deferred" } })
    }
    async getTicketsByEngineerEmail(email) {
        return await Tickets.find({ engineerEmail: email, status: { $ne: "deferred" } })
    }

    async getUserTicketsByStatus(email, status) {
        return await Tickets.find({ userEmail: email, status: status });
    }
    async getEngineerTicketsByStatus(email, status) {
        return await Tickets.find({ engineerEmail: email, status: status });
    }

    async getEngineerTicketsByPriority(email, priority) {
        return await Tickets.find({ engineerEmail: email, priority: priority });
    }

    async updateTicketStatus(ticketId, state) {
        return await Tickets.findByIdAndUpdate(
            ticketId,
            { $set: { status: state, updatedAt: new Date() } },
            { new: true, runValidators: true }
        );
    }

    async findEngineer(email) {
        return await Engineers.findOne({ email: email });
    }

    async findTicket(ticketId) {
        return await Tickets.findOne({ _id: Number(ticketId) })
    }

}

module.exports = TaskRepository;