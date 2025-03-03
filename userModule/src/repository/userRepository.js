const Users = require('../model/users.model'); // The Mongoose model
const Tickets = require('../model/tickets.model');
const auth = require('../model/auth.model');
const Engineers = require('../model/engineers.model');
const Admin = require('../model/admin.model')

class UserRepository {
    // Create a new notification
    async getAllUsers() {
        return await Users.find({});
    }

    async getTicketByStatus(status, email) {
        return await Tickets.find({ userEmail: email, status: status });
    }

    // find if user is already existing
    async isUserExists(email) {
        return await auth.findOne({ email });
    }

    async createUser(userData) {
        return await Users.create(userData);
    }

    async createEngineer(engineerData) {
        return await Engineers.create(engineerData);
    }

    async createAdmin(adminData) {
        return await Admin.create(adminData);
    }

    async createAuthEntry(entryData) { 
        return await auth.create(entryData);
    }

    async findAuthUser(credentials) {
        return await auth.findOne({ email: credentials.email });
    }
    async findUser(credentials) {
        return await Users.findOne({ email: credentials.email });
    }
    async findEngineer(credentials) {
        return await Engineers.findOne({ email: credentials.email });
    }
    async findAdmin(credentials) {
        return await Admin.findOne({ email: credentials.email });
    }

    async updatePassword(email, encryptedPassword) {
        return await auth.updateOne({ email }, { password: encryptedPassword });
    }

    async getLastTicket() {
        return await Tickets.findOne().sort({ _id: -1 }).limit(1);
    }

    getTicketInstance(ticket) {
        return new Tickets(ticket);
    }

    async getAvailability(day) {
        return await Engineers.find({
            availability: { $in: day }
        });
    }

    async updateTicket(ticket, assignedEngineer) {
        return await Tickets.findOneAndUpdate(
            { _id: ticket._id },
            { engineerId: assignedEngineer._id },
            { new: true }
        );
    }

    async updateEngineer(assignedEngineer, ticket) {
        return await Engineers.findByIdAndUpdate(
            assignedEngineer._id,
            {
                $push: { assignedTasks: ticket._id },
                $inc: { currentTasks: 1 }
            },
            { new: true }
        );
    }

    async getUser(email) {
        return await Users.findOne({ email: email });
    }

    async getEngineer(email) {
        return await Engineers.findOne({ email: email });
    }

    async updateUser(email, body) {
        return await Users.findOneAndUpdate({ email: email }, body, { new: true })
    }

    async updateEngineerProfile(email, body) {
        return await Engineers.findOneAndUpdate({ email: email }, body, { new: true })
    }
    async updateEngineer(email, profile) {
        return await Engineers.findOneAndUpdate({ email: email }, profile, { new: true })
    }
}

module.exports = UserRepository;
