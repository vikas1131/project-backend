const { routeHandler } = require('ca-webutils/expressx');
const AdminService = require('../service/adminServices.js');
const adminService = new AdminService();

const adminController = {
    getAllTasks: routeHandler(async () => {
        const tasks = await adminService.getAllTasks();
        if (tasks.length === 0) {
            return { status: 404, message: 'No tasks found.' }
        }
        return { success: true, tasks };
    }),

    getUsersByRole: routeHandler(async ({ params }) => {
        const { role } = params;
        const users = await adminService.getUsersByRole(role);
        if (!Array.isArray(users) || users.length === 0) {
            return { status: 404, message: 'No users found' };
        }
        return { success: true, users };
    }),

    getEngineerByEmail: routeHandler(async ({ params }) => {
        const { Email } = params;
        const engineer = await adminService.getEngineerByEmail(Email);
        if (!engineer) {
            return { status: 404, message: `No Engineer Found with Email: ${Email}` };
        }
        return { success: true, engineer };
    }),

    getTicketsByStatus: routeHandler(async ({ params }) => {
        const { status } = params;
        const tickets = await adminService.getTicketsByStatus(status);
        if (tickets.length === 0) {
            return { status: 404, message: `No tasks found with status ${status}` };
        }
        return { success: true, tickets };
    }),

    getTicketsByPriority: routeHandler(async ({ params }) => {
        const { level } = params;
        const tickets = await adminService.getTicketsByPriority(level);
        if (tickets?.length === 0) {
            return { status: 404, message: `No tasks found with priority ${level}` };
        }
        return { success: true, tickets };
    }),

    getEngineersByAvailability: routeHandler(async ({ params }) => {
        const { day } = params;
        const engineers = await adminService.getEngineersByAvailability(day);
        if (engineers?.length === 0) {
            return { status: 404, message: `No engineers available on ${day}` };
        }
        return { success: true, message: `Engineers available on ${day}`, engineers };
    }),

    getEligibleEngineersForTicket: routeHandler(async ({ params }) => {
        const { ticketId, day } = params;
        if (!ticketId || !day) {
            return { status: 400, message: "Ticket ID and day are required" };
        }
        const result = await adminService.getEligibleEngineersForTicket(ticketId, day);
        if (!result.success) {
            return { status: 404, message: result.message, error: result.error };
        }
        return result;
    }),

    reassignTicket: routeHandler(async ({ params }) => {
        const { ticketId, newEngineerEmail } = params;
        if (!ticketId || !newEngineerEmail) {
            return { status: 400, message: "Ticket ID and Engineer Email are required" };
        }
        const result = await adminService.reassignTicket(ticketId, newEngineerEmail);
        return result;
    }),

    getUnapprovedEngineers: routeHandler(async () => {
        const result = await adminService.getUnapprovedEngineers();
        if (!result.success) {
            return { status: 404, message: result.message };
        }
        return result;
    }),

    approveEngineer: routeHandler(async ({ params, body }) => {
        const { email } = params;
        const { approve } = body;
        const result = await adminService.approveEngineer(email, approve);
        if (!result.success) {
            return { status: 404, message: result.message };
        }
        return result;
    })
};

module.exports = adminController;