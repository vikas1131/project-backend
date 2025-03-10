const AdminRepository = require('../repository/adminRepository');
require('dotenv').config();
const axios = require('axios');
const encryptjs = require('encryptjs');
const secretKey = process.env.SECRET_KEY;
const https = require('https');
const jwtHelper = require('../utils/jwtHelper');

class AdminService {
    constructor() {
        this.adminRepository = new AdminRepository();
    }

    async getAllTasks() {
        return await this.adminRepository.getAllTasks();
    }

    async getUsersByRole(role) {
        if (role === 'users') {
            return await this.adminRepository.getAllUsers();
        } else if (role === 'engineers') {
            return await this.adminRepository.getAllApprovedEngineers();
        }
        return [];
    }

    async getEngineerByEmail(email) {
        return await this.adminRepository.getEngineerByEmail(email);
    }

    async getTicketsByStatus(status) {
        return await this.adminRepository.getTicketsByStatus(status);
    }

    async getTicketsByPriority(level) {
        return await this.adminRepository.getTicketsByPriority(level);
    }

    async getEngineersByAvailability(day) {
        return await this.adminRepository.getEngineersByAvailability(day);
    }

    // Updated to get engineers based on specialization matching the ticket's service type
    // and excluding the engineer who deferred the ticket
    async getEligibleEngineersForTicket(ticketId, day) {
        try {
            const ticket = await this.adminRepository.findTicketById(ticketId);
            if (!ticket) {
                return { success: false, message: "Ticket not found", engineers: [] };
            }

            // Get service type from ticket
            const serviceType = ticket.serviceType.toLowerCase();
            // Get the email of the engineer who potentially deferred the ticket
            const excludeEmail = ticket.engineerEmail;

            console.log(`Finding engineers with specialization: ${serviceType}, available on: ${day}`);

            // Get engineers with matching specialization, available on the given day,
            // and excluding the engineer who deferred the ticket
            const eligibleEngineers = await this.adminRepository.getEngineersBySpecialization(
                serviceType, 
                day, 
                excludeEmail
            );

            console.log(`Found ${eligibleEngineers.length} eligible engineers`);

            return { 
                success: true, 
                engineers: eligibleEngineers,
                serviceType: serviceType
            };
        } catch (error) {
            console.error("Error getting eligible engineers:", error);
            return { 
                success: false, 
                message: "Error fetching eligible engineers", 
                error: error.message,
                engineers: []
            };
        }
    }

    async reassignTicket(ticketId, newEngineerEmail) {
        try {
            // Find the ticket
            const ticket = await this.adminRepository.findTicketById(ticketId);
            if (!ticket) {
                return { success: false, message: "Ticket not found" };
            }

            // Find the new engineer
            const newEngineer = await this.adminRepository.getEngineerByEmail(newEngineerEmail);
            if (!newEngineer) {
                return { success: false, message: "Engineer not found" };
            }

            // Verify the engineer specialization matches the ticket's service type (case-insensitive)
            if (newEngineer.specialization.toLowerCase() !== ticket.serviceType.toLowerCase()) {
                return { 
                    success: false, 
                    message: `Engineer specialization (${newEngineer.specialization}) does not match ticket service type (${ticket.serviceType})`
                };
            }

            // Find the previous engineer (if already assigned)
            let previousEngineer = null;
            if (ticket.engineerEmail) {
                previousEngineer = await this.adminRepository.getEngineerByEmail(ticket.engineerEmail);
            }

            // Remove ticket from the previous engineer
            if (previousEngineer) {
                // Verify we're not reassigning to the same engineer who deferred it
                if (previousEngineer.email === newEngineerEmail) {
                    return { 
                        success: false, 
                        message: "Cannot reassign ticket to the same engineer who deferred it" 
                    };
                }
                
                previousEngineer.assignedTasks = previousEngineer.assignedTasks.filter(
                    (taskId) => taskId.toString() !== ticketId
                );
                previousEngineer.currentTasks -= 1;
                await this.adminRepository.saveEngineer(previousEngineer);
            }

            // Assign ticket to the new engineer
            ticket.engineerEmail = newEngineerEmail;
            ticket.accepted = false;
            ticket.status = 'open';
            await this.adminRepository.saveTicket(ticket);

            // Update the new engineer's assigned tasks
            newEngineer.assignedTasks.push(ticketId);
            newEngineer.currentTasks += 1;
            await this.adminRepository.saveEngineer(newEngineer);

            return { success: true, message: "Ticket reassigned successfully", ticket };
        } catch (error) {
            console.error("Error reassigning ticket:", error);
            return { success: false, message: "Error reassigning ticket", error: error.message };
        }
    }

    async getUnapprovedEngineers() {
        try {
            const engineerList = await this.adminRepository.getAllEngineers();
            return { success: true, engineers: engineerList };
        } catch (error) {
            console.error("Error fetching engineers:", error);
            return { success: false, message: "Error fetching engineers", error: error.message };
        }
    }

    async approveEngineer(engineerEmail, approve) {
        try {
            const engineer = await this.adminRepository.updateEngineerApproval(engineerEmail, approve);
 
            if (!engineer) {
                return { success: false, message: "Engineer not found" };
            }
            else {
                try {
                    const apiUrl = "http://localhost:8003/api/notifications/sendNotification"; // Define apiUrl properly
                    let sub;
                    let body;
                    if(approve === true){
                        sub= "Registration Approved",
                        body= `Dear Engineer, \nWelcome! your registration was successfully approved. You can login now.\nBest Regards\nTeam Telecom Services.`
                    }
                    else{
                        sub= "Registration Denied",
                        body= `Dear Engineer, \nSorry, your registration was denied. Please try again later.\nBest Regards\nTeam Telecom Services.`
                    }
                    const postData = {
                        userEmail: engineer.email,
                        subject: sub,
                        emailBody: body
                    };
                    console.log("post data", postData)
                    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
                    await axios.post(apiUrl, postData)
                        .then(apiResponse => console.log("API Response:", apiResponse.data))
                        .catch(error => console.error("Error calling API:", error.message));
                }
                catch (err) {
                    console.log("error send notification")
                }
            }
 
            return { success: true, message: "Engineer approval updated", engineer };
        } catch (error) {
            console.error("Error approving engineer:", error);
            return { success: false, message: "Error approving engineer", error: error.message };
        }
    }
}

module.exports = AdminService;