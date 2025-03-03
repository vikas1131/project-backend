const axios = require('axios');
const { routeHandler } = require('ca-webutils/expressx');
const TaskService = require('../service/taskService');
const taskService = new TaskService();

const taskController = {

    getTasks: routeHandler(async ({ params }) => {
        const {role, email} = params;
        const tasks = await taskService.getTicketsByRoleAndId(role, email);
        return { success: true, tasks };
    }),

    getTasksByStatus: routeHandler(async ({ params }) => {
        const { role, email, status } = params;
        const tasks = await taskService.getTicketsByRoleIdAndStatus(role, email, status);
        return { success: true, tasks };
    }),

    getTasksByPriority: routeHandler(async ({ params }) => {
        const { role, email, priority } = params;
        const tasks = await taskService.getTicketsByRoleIdAndPriority(role, email, priority);
        return { success: true, tasks };
    }),

    updateTicketStatus: routeHandler(async ({ params, body }) => {
        const { id } = params;
        const { status } = body;
        const task = await taskService.updateTicketStatus(id, status);
        return { success: true, task };
    }),

    acceptTask: routeHandler(async ({ params }) => {
        const { ticketId, email } = params;
        const result = await taskService.acceptTask(email, ticketId);
        return { success: true, result };
    }),

    rejectTask: routeHandler(async ({ params }) => {
        const { ticketId, email } = params;
        const result = await taskService.rejectTask(email, ticketId);
        return { success: true, result };
    })
}

module.exports = taskController;