const TaskRepository = require('../repository/taskRepository'); 
require('dotenv').config();
const axios = require('axios');

class TaskService {
    constructor() {
        this.TaskRepository = new TaskRepository(); 
    }

    async getTicketsByRoleAndId(role, email) {
        if (role === 'user') {
            return await this.TaskRepository.getTicketsByUserEmail(email);
        }
        else if (role === 'engineer') {
            return await this.TaskRepository.getTicketsByEngineerEmail(email);
        }
        else {
            return { error: "invalid role" }
        }
    }

    async getTicketsByRoleIdAndStatus(role, email, status) {
        if (role === 'user') {
            return await this.TaskRepository.getUserTicketsByStatus(email, status);
        }
        else if (role === 'engineer') {
            return await this.TaskRepository.getEngineerTicketsByStatus(email, status);
        }
        else {
            return { error: "invalid role" }
        }
    }

    async getTicketsByRoleIdAndPriority(role, email, priority) {
        if (role === 'user') {
            return await this.TaskRepository.getUserTicketsByPriority(email, priority);
        }
        else if (role === 'engineer') {
            return await this.TaskRepository.getEngineerTicketsByPriority(email, priority);
        }
        else {
            return { error: "invalid role" }
        }
    }

    async sendNotification(email, subject, body) {
        console.log("inside send notification")
        if (!email || !subject || !body) {
            throw new Error("missing fields: email or subject or body is missing");
        }
        const postData = {
            userEmail: email,
            subject: subject,
            emailBody: body
        };

        const apiUrl = 'https://localhost:8003/api/notifications/sendNotification'; // Replace with actual API URL


        process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

        try {
            const response = await axios.post(apiUrl, postData);
            console.log('API Response:', response.data);
            return response.data; 
        } catch (error) {
            console.error('Error calling API:', error.message);
            throw error; 
        }
    }

    async updateTicketStatus(ticketId, state) {
        try {
            const validStatuses = ['open', 'in-progress', 'completed', 'failed', 'deferred'];
            if (!validStatuses.includes(state)) {
                throw new Error(`Invalid status: ${state}`);
            }

            const ticket = await this.TaskRepository.updateTicketStatus(ticketId, state);

            if (!ticket) {
                throw new Error("Ticket not found");
            }
            else if (state === 'completed') {  
                this.sendNotification(ticket.userEmail, 'Ticket resolved', `Your ticket with id ${ticket._id} has been resolved.` );
            }
            return ticket;
        } catch (error) {
            return { message: `Error updating ticket status: ${error.message}` };
        }
    }
    async acceptTask(engineerEmail, ticketId) {
        try {
            const engineer = await this.TaskRepository.findEngineer(engineerEmail);

            if (!engineer) return { success: false, message: 'Engineer not found' };
            if (!ticketId || isNaN(ticketId)) return { success: false, message: 'Invalid ticket ID' };

            const ticket = await this.TaskRepository.findTicket(ticketId);
            if (!ticket) return { success: false, message: 'Ticket not found' };

            
            if (ticket.accepted && ticket.engineerEmail === engineerEmail) {
                return { success: false, message: 'Task already assigned to this engineer' };
            }

           
            ticket.engineerEmail = engineerEmail;
            ticket.accepted = true;
            await ticket.save();

            
            if (!engineer.assignedTasks.includes(ticketId)) {
                engineer.assignedTasks.push(ticketId);
                engineer.currentTasks += 1;
            }

            await engineer.save();

            return { success: true, message: 'Task accepted successfully', ticket };
        } catch (error) {
            console.error("Error in acceptTask:", error);
            return { success: false, message: 'An error occurred while accepting the task' };
        }
    }

    async rejectTask(engineerEmail, ticketId) {
        try {
            const engineer = await this.TaskRepository.findEngineer(engineerEmail);;

            if (!engineer) return { success: false, message: 'Engineer not found' };
            if (!ticketId || isNaN(ticketId)) return { success: false, message: 'Invalid ticket ID' };

            const ticket = await this.TaskRepository.findTicket(ticketId);
            if (!ticket) return { success: false, message: 'Ticket not found' };

            
            if (ticket.engineerEmail !== engineerEmail) {
                return { success: false, message: 'Task is not assigned to this engineer' };
            }

            
            engineer.assignedTasks = engineer.assignedTasks.filter(
                (taskId) => taskId.toString() !== ticketId
            );
            engineer.currentTasks = Math.max(0, engineer.currentTasks - 1);

            

            await engineer.save();

           
            ticket.engineerEmail = null;
            ticket.accepted = false;
            await ticket.save();

            return { success: true, message: 'Task rejected successfully' };
        } catch (error) {
            console.error("Error in rejectTask:", error);
            return { success: false, message: 'An error occurred while rejecting the task' };
        }
    }
}

module.exports = TaskService;