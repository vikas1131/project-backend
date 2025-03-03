const { routeHandler } = require('ca-webutils/expressx');
const UserService = require('../service/userServices');
const userService = new UserService();

const userController = {
    getAllUsers: routeHandler(async () => {
        const users = await userService.getAllUsers();
        return { success: true, users };
    }),

    getTicketsByStatus: routeHandler(async ({ params }) => {
        const { email, status } = params;
        const ticket = await userService.getTicketByStatus(status, email);
        return { success: true, ticket };
    }),

    createNewUser: routeHandler(async ({ body }) => { 
        const newUser = await userService.createUser(body);
        return { success: true, user: newUser };
    }),

    checkUser: routeHandler(async ({ body }) => {
        const user = await userService.checkUser(body);
        return { success: true, user: user };
    }),

    resetPassword: routeHandler(async ({ body }) => { 
        const updatedUser = await userService.resetPassword(body);
        return { success: true, user: updatedUser };
    }),

    raiseTicket: routeHandler(async ({ params, body }) => {
        const { userEmail } = params;
        const ticket = await userService.raiseTicket(userEmail, body);
        return { success: true, ticket };
    }),

    profile: routeHandler(async ({params}) => {
        let { role, Email } = params;
        let profile = await userService.getProfileByRoleAndId(role, Email);
        console.log(profile);
        return { success: true, profile };
        
    }),
    
    updateProfile: routeHandler(async ({ params, body }) => {
        let { role, Email } = params;
        let updateBody = body;
        let profile = await userService.updateProfile(role, Email, updateBody);
        console.log(profile);
        return { success: true, profile };

    })
};

module.exports = userController;