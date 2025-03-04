const UserRepository = require('../repository/userRepository'); // Importing the repository
require('dotenv').config();
const axios = require('axios');
const encryptjs = require('encryptjs');
const secretKey = process.env.SECRET_KEY;
const https = require('https');
const jwtHelper = require('../utils/jwtHelper');


class UserService {
    constructor() {
        this.UserRepository = new UserRepository(); // Dependency Injection
    }

    // get all users
    async getAllUsers() {
        return await this.UserRepository.getAllUsers();
    }

    async getTicketByStatus(status, email) {
        return await this.UserRepository.getTicketByStatus(status, email);
    }

    async getCoordinates(pincode) {
        try {
            const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(pincode)}`;
            const response = await axios.get(url, {
                httpsAgent: new https.Agent({
                    rejectUnauthorized: false // Disable SSL verification (not recommended for production)
                })
            });
            if (response.data.length === 0) {
                return ({ message: 'No results found for the given address' });
            }
            const location = response.data[0]; // First result
            return {
                latitude: location.lat,
                longitude: location.lon,
                address: location.display_name
            };
        } catch (error) {
            console.error('Error fetching coordinates:', error.message);
            return null;
        }
    }

    async createUser(user) {
        const encryptedPassword = encryptjs.encrypt(user.password, secretKey, 256);
        const encryptedSecurityAnswer = encryptjs.encrypt(user.securityAnswer, secretKey, 256);
        const existingAuth = await this.UserRepository.isUserExists(user.email);
        if (existingAuth) {
            return { success: false, message: "User with this email already exists" };
        }
        let userData = {
            email: user.email,
            name: user.name,
            phone: user.phone,
            address: user.address,
            pincode: user.pincode,
            securityQuestion: user.securityQuestion,
            securityAnswer: encryptedSecurityAnswer,
            isAdmin: user.role === "admin",
            isEngineer: user.role === "engineer" ? false : undefined,
            isUser: user.role === "user",
        };

        let roleSpecificData = { ...userData };
        // Role-specific processing
        if (user.role === "engineer") {
            const locationData = await this.getCoordinates(user.pincode); // Pass pincode
            if (!locationData) {
                console.error("Failed to fetch coordinates for pincode:", user.pincode);
                return { success: false, message: "Invalid address. Unable to fetch coordinates." };
            }

            roleSpecificData = {
                ...userData,
                specialization: user.specialization || "Not provided",
                availability: user.availability || [],
                location: locationData,
                currentTasks: 0,
                assignedTasks: [],
            };

            const engineerUser = await this.UserRepository.createEngineer(roleSpecificData);
            if (!engineerUser) throw new Error("Failed to create engineer user");

        } else if (user.role === "user") {
            roleSpecificData = { ...userData };
            const userCreated = await this.UserRepository.createUser(roleSpecificData);
            if (!userCreated) throw new Error("Failed to create user");

        } else if (user.role === "admin") {
            roleSpecificData = { ...userData };
            const adminCreated = await this.UserRepository.createAdmin(roleSpecificData);
            if (!adminCreated) throw new Error("Failed to create admin");
        } else {
            return { success: false, message: "Invalid role provided" };
        }

        // If role-specific creation is successful, create auth entry
        await this.UserRepository.createAuthEntry({ email: user.email, password: encryptedPassword.toString(), role: user.role });

        // Generate JWT token
        const token = jwtHelper.createToken({
            email: user.email,
            role: user.role
        });

        console.log(`User created successfully: ${user.email} - Role: ${user.role}`);
        return {
            success: true,
            message: "User registered successfully",
            token,
            email: user.email,
            role: user.role,
            isEngineer: roleSpecificData.isEngineer,
            isUser: roleSpecificData.isUser,
            isAdmin: roleSpecificData.isAdmin,
        };
    }

    // login user

    async checkUser(credentials) {
        try {
            // Find user in auth collection
            const authUser = await this.UserRepository.findAuthUser(credentials);
            if (!authUser) {
                return { success: false, error: "Invalid credentials" };
            }

            // Decrypt and verify password
            const decryptedPassword = encryptjs.decrypt(authUser.password, secretKey, 256);
            if (credentials.password !== decryptedPassword) {
                return { success: false, error: "Invalid credentials" };
            }

            let userDetails = null;

            if (authUser.role === "user") {
                userDetails = await this.UserRepository.findUser(credentials);
                if (!userDetails || !userDetails.isUser) {
                    return { success: false, error: "Access denied. Awaiting admin approval." };
                }
            }

            else if (authUser.role === "engineer") {
                userDetails = await this.UserRepository.findEngineer({ email: credentials.email });
                if (!userDetails || !userDetails.isEngineer) {
                    return { success: false, error: "Access denied. Awaiting admin approval." };
                }
            }
            else if (authUser.role === "admin") {
                userDetails = await this.UserRepository.findAdmin({ email: credentials.email });
                if (!userDetails || !userDetails.isAdmin) {
                    return { success: false, error: "Access denied. Awaiting admin approval." };
                }
            }

            return this.generateSuccessResponse(authUser, userDetails)
        } catch (error) {
            console.error("Error checking user:", error);
            return { success: false, error: "Something went wrong" };
        }
    }
    generateSuccessResponse(authUser, userDetails) {
        const token = jwtHelper.createToken({ email: authUser.email, role: authUser.role });
        return {
            success: true,
            token,
            email: authUser.email,
            role: authUser.role,
            isEngineer: userDetails.isEngineer || false,
            isUser: userDetails.isUser || false,
            isAdmin: userDetails.isAdmin || false,
            details: userDetails // Fetching full user details
        };
    }

    async resetPassword(data) {
        try {
            const { email, securityAnswer, newPassword } = data;
            console.log(`Resetting password ${email}, ${securityAnswer}, ${newPassword}`)

            // Verify email & fetch security question
            const authUser = await this.UserRepository.findAuthUser({ email: email });
            if (!authUser) {
                return { success: false, message: "Email not found" };
            }

            const userRole = authUser.role;
            console.log(userRole)

            // Define role-based repository mapping
            const roleRepositoryMap = {
                'admin': this.UserRepository.findAdmin,
                'engineer': this.UserRepository.findEngineer,
                'user': this.UserRepository.findUser,
            };

            // Fetch user details based on role
            if (!roleRepositoryMap[userRole]) {
                return { success: false, message: "Invalid user role" };
            }

            const user = await roleRepositoryMap[userRole].call(this, { email });

            if (!user) {
                return { success: false, message: "User details not found" };
            }


            if (!securityAnswer && !newPassword) {
                return { success: true, securityQuestion: user.securityQuestion };
            }

            // Verify security answer
            if (securityAnswer && !newPassword) {
                const decryptedSecurityAnswer = encryptjs.decrypt(user.securityAnswer, secretKey, 256);
                if (securityAnswer !== decryptedSecurityAnswer) {
                    return { success: false, message: "Incorrect security answer" };
                }
                return { success: true, message: "Security answer verified. Proceed to reset password." };
            }

            // Reset password
            if (newPassword) {
                const encryptedPassword = encryptjs.encrypt(newPassword, secretKey, 256);
                await this.UserRepository.updatePassword(email, encryptedPassword);

                return { success: true, message: "Password reset successfully" };
            }

            return { success: false, message: "Invalid request" };
        } catch (error) {
            console.error("Error in password reset:", error);
            return { success: false, message: "An error occurred" };
        }
    }

    // async setPriority(ticket) {
    //     try {
    //         if (ticket.serviceType === 'fault') {
    //             return 'high';
    //         }
    //         return 'medium';
    //     } catch (error) {
    //         console.error("Error updating ticket priority:", error);
    //         throw new Error("Error updating ticket priority");
    //     }
    // }
    async setPriority(ticket, assignedEngineer) {
        try {
            if (!assignedEngineer || !assignedEngineer.location || !assignedEngineer.location.latitude || !assignedEngineer.location.longitude) {
                return 'low';
            }

            const distance = await this.haversineDistance(
                parseFloat(ticket.location.latitude), parseFloat(ticket.location.longitude),
                parseFloat(assignedEngineer.location.latitude), parseFloat(assignedEngineer.location.longitude)
            );

            if (distance <= 5) {
                return 'high';
            } else if (distance > 5 && distance <= 15) {
                return 'medium';
            } else {
                return 'low';
            }
        } catch (error) {
            console.error("Error updating ticket priority:", error);
            throw new Error("Error updating ticket priority");
        }
    }

    async getLastId(data) {
        try {
            if (data instanceof Object && data.serviceType) { // Check if it's a ticket (tickets have serviceType)
                const lastTicket = await this.UserRepository.getLastTicket();
                console.log("lastTicket", lastTicket)
                return lastTicket ? lastTicket._id : 0;
            } else {
                throw new Error("Invalid data type for getLastId");
            }
        } catch (error) {
            console.error("Error fetching last ID:", error);
            throw new Error("Error fetching last ID");
        }
    }

    async getByAvailability(day) {
        return await this.UserRepository.getAvailability(day);
    }

    async haversineDistance(lat1, lon1, lat2, lon2) {
        const R = 6371;
        const dLat = (lat2 - lat1) * (Math.PI / 180);
        const dLon = (lon2 - lon1) * (Math.PI / 180);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    async sortEngineers(engineers, ticket) {
        console.log("engineers: ", engineers, ticket)
        console.log("adsjfnlkasf",parseFloat(ticket.location.latitude))
        return engineers
            .filter(engineer => engineer.location && engineer.location.latitude && engineer.location.longitude) // Skip invalid locations
            .map(engineer => ({
                ...engineer,
                distance: this.haversineDistance(
                    parseFloat(ticket.location.latitude), parseFloat(ticket.location.longitude),
                    parseFloat(engineer.location.latitude), parseFloat(engineer.location.longitude)
                )
            }))
            .sort((a, b) => a.distance - b.distance || a.currentTasks - b.currentTasks);
    }

    async assignEngineerTicket(ticket) {
        try {
            console.log('assigning engineer', ticket.createdAt);
            const date = new Date(ticket.createdAt);
            const day = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(date);

            let engineers = await this.getByAvailability(day);
            if (!engineers.length) {
                return { message: 'No available engineers for this day' };
            }
            engineers=engineers.filter(engineer => engineer.specialization.toLowerCase()===ticket.serviceType.toLowerCase())
            const sortedEngineers = await this.sortEngineers(engineers, ticket);
            console.log("sortedEngineers: ", sortedEngineers);
            console.log("sortedEngineer: ", sortedEngineers[0]._doc.email);
            const assignedEngineer = sortedEngineers[0]._doc.email;

            const updatedTicket = await this.UserRepository.updateTicket(ticket, assignedEngineer);

            if (!updatedTicket) {
                return { message: 'Ticket update failed' }
            }

            const updatedEngineer = await this.UserRepository.updateEngineer(assignedEngineer)

            if (!updatedEngineer) {
                return { message: "Engineer update failed." };
            }
            return assignedEngineer;
        } catch (error) {
            return ({ error: error.message })
        }
    }

    async addTicket(ticket) {
        try {
            ticket.location = await this.getCoordinates(ticket.pincode);
            const Id = await this.getLastId(ticket);
            ticket._id = Id + 1;
            // Set priority before creating the ticket
            let updatedPriority = await this.setPriority(ticket);
            ticket.priority = updatedPriority; // Assign priority before saving
            if (!ticket.createdAt) {
                ticket.createdAt = new Date();
            }
            const newTicket = this.UserRepository.getTicketInstance(ticket);
            await newTicket.save();
            const assignedEngineer = await this.assignEngineerTicket(ticket);
            console.log("assignedEngineer: ", assignedEngineer);
            newTicket.engineerEmail = assignedEngineer || "Not Assigned";
            await newTicket.save();
            console.log("newTicket: ", newTicket);
            return { success: true, message: "Ticket raised successfully", ticket: newTicket };
        } catch (err) {
            console.error("Error raising ticket:", err);
            return { success: false, message: "Error raising ticket", error: err.message };
        }
    }

    async raiseTicket(userEmail, newTicket, response) {
        try {
            newTicket.userEmail = userEmail;
            const addedTicket = await this.addTicket(newTicket);
            console.log("addedTicket", addedTicket);
 
            if (addedTicket.success === true) {
                console.log("addedTicket.success", addedTicket);
                try{const apiUrl = "http://54.88.31.60:8003/api/notifications/sendNotification"; // Define apiUrl properly
                const postData = {
                    userEmail: addedTicket.ticket.userEmail,
                    subject: "Ticket Raised Successfully",
                    emailBody: `Dear User, \nTicket with ${addedTicket.ticket._id} raised successfully and assigned to ${addedTicket.ticket.engineerEmail}.
                    \nTicket Details:\n
                    Ticket ID: ${addedTicket.ticket._id}\n
                    Service Type: ${addedTicket.ticket.serviceType}\n
                    Description: ${addedTicket.ticket.description}\n
                    Location:  ${addedTicket.ticket.address}\n
                    Created at: ${addedTicket.ticket.createdAt}\n
                    Best Regards\n
                    Telecom Services`
                };
                console.log("post data",postData)
                process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
                await axios.post(apiUrl, postData)
                    .then(apiResponse => console.log("API Response:", apiResponse.data))
                        .catch(error => console.error("Error calling API:", error.message));
                }
                catch (err) {
                    console.log("error send notification")
                }
                return addedTicket;
            }
        } catch (error) {
            console.error("Error in raiseTicket:", error);
        }
    }

    async getProfileByRoleAndId(role, email) {
        try {
            let user
            if (role === 'user') {
                user = await this.UserRepository.getUser(email);
            }
            else if (role === 'engineer') {
                user = await this.UserRepository.getEngineer(email);
            }
            if (!user) {
                return { success: false, message: "User not found" };
            }
            return { success: true, user: user };
        } catch {
            console.error("Error fetching user:", error);
            return { success: false, message: "Error fetching user" };
        }
    }

    async updateProfile(role, email, body) {
        try {
            let updatedProfile;
            if (role === 'user') {
                updatedProfile = await this.UserRepository.updateUser(email, body)
            }
            else if (role === 'engineer') {
                console.log('inside engineer profile update', body)
                updatedProfile = await this.UserRepository.updateEngineerProfile(email, body)
            }
            return { success: true, message: 'Profile updated successfully', updatedProfile: updatedProfile };
        } catch (err) {
            return { success: false, message: 'Error updating profile' };
        }
    }


    }

module.exports = UserService;