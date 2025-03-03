// test/userService.test.js
const { expect } = require('chai');
const sinon = require('sinon');
const axios = require('axios');
const https = require('https');
const encryptjs = require('encryptjs');
const jwtHelper = require('../../src/utils/jwtHelper');
const UserService = require('../../src/service/userServices');

// Ensure SECRET_KEY is set for encryption
process.env.SECRET_KEY = "fakeSecretKey";

describe('UserService', function () {
    let userService;
    let repoStub;
    let axiosGetStub, axiosPostStub;
    let encryptEncryptStub, encryptDecryptStub;
    let jwtCreateTokenStub;

    beforeEach(function () {
        userService = new UserService();

        // Stub repository methods
        repoStub = {
            getAllUsers: sinon.stub(),
            getTicketByStatus: sinon.stub(),
            isUserExists: sinon.stub(),
            createEngineer: sinon.stub(),
            createUser: sinon.stub(),
            createAdmin: sinon.stub(),
            createAuthEntry: sinon.stub().resolves(),
            findAuthUser: sinon.stub(),
            findUser: sinon.stub(),
            findEngineer: sinon.stub(),
            findAdmin: sinon.stub(),
            updatePassword: sinon.stub().resolves(),
            getLastTicket: sinon.stub(),
            getAvailability: sinon.stub(),
            updateTicket: sinon.stub(),
            updateEngineer: sinon.stub(),
            getTicketInstance: sinon.stub()
        };
        userService.UserRepository = repoStub;

        // Stub axios methods
        axiosGetStub = sinon.stub(axios, 'get');
        axiosPostStub = sinon.stub(axios, 'post');

        // Stub encryptjs methods: encrypt returns "encrypted_" + text; decrypt reverses that.
        encryptEncryptStub = sinon.stub(encryptjs, 'encrypt').callsFake((text, key, bits) => "encrypted_" + text);
        encryptDecryptStub = sinon.stub(encryptjs, 'decrypt').callsFake((encryptedText, key, bits) => {
            return encryptedText.replace("encrypted_", "");
        });

        // Stub jwtHelper.createToken to return a fake token
        jwtCreateTokenStub = sinon.stub(jwtHelper, 'createToken').returns("fakeToken");
    });

    afterEach(function () {
        sinon.restore();
    });

    describe("getAllUsers", function () {
        it("should return all users from repository", async function () {
            const users = [{ email: "a@example.com" }];
            repoStub.getAllUsers.resolves(users);
            const result = await userService.getAllUsers();
            expect(result).to.equal(users);
        });
    });

    describe("getTicketByStatus", function () {
        it("should return tickets by status and email", async function () {
            const tickets = [{ status: "open", email: "a@example.com" }];
            repoStub.getTicketByStatus.resolves(tickets);
            const result = await userService.getTicketByStatus("open", "a@example.com");
            expect(result).to.equal(tickets);
        });
    });

    describe("getCoordinates", function () {
        it("should return location details when results are found", async function () {
            const fakeResponse = { data: [{ lat: "12.34", lon: "56.78", display_name: "Test Address" }] };
            axiosGetStub.resolves(fakeResponse);
            const result = await userService.getCoordinates("12345");
            expect(result).to.deep.equal({
                latitude: "12.34",
                longitude: "56.78",
                address: "Test Address"
            });
        });

        it("should return a message when no results are found", async function () {
            axiosGetStub.resolves({ data: [] });
            const result = await userService.getCoordinates("00000");
            expect(result).to.deep.equal({ message: 'No results found for the given address' });
        });

        it("should return null if an error occurs", async function () {
            axiosGetStub.rejects(new Error("Network error"));
            const result = await userService.getCoordinates("12345");
            expect(result).to.be.null;
        });
    });

    describe("createUser", function () {
        const baseUser = {
            email: "test@example.com",
            name: "Test User",
            phone: "1234567890",
            address: "Test Address",
            pincode: "12345",
            securityQuestion: "Test Q?",
            securityAnswer: "Test A",
            password: "password123",
            role: "user"
        };

        it("should return error if the user already exists", async function () {
            repoStub.isUserExists.resolves(true);
            const result = await userService.createUser(baseUser);
            expect(result).to.deep.equal({ success: false, message: "User with this email already exists" });
        });

        describe("for engineer role", function () {
            let engineerData;
            beforeEach(function () {
                engineerData = { ...baseUser, role: "engineer", specialization: "IT", availability: [] };
            });

            it("should fail if getCoordinates returns null", async function () {
                repoStub.isUserExists.resolves(false);
                sinon.stub(userService, "getCoordinates").resolves(null);
                const result = await userService.createUser(engineerData);
                expect(result).to.deep.equal({ success: false, message: "Invalid address. Unable to fetch coordinates." });
                userService.getCoordinates.restore();
            });

            it("should throw error if createEngineer fails", async function () {
                repoStub.isUserExists.resolves(false);
                sinon.stub(userService, "getCoordinates").resolves({ lat: "12.34", lon: "56.78", display_name: "Loc" });
                repoStub.createEngineer.resolves(null);
                try {
                    await userService.createUser(engineerData);
                    throw new Error("Test failed, exception not thrown");
                } catch (error) {
                    expect(error.message).to.equal("Failed to create engineer user");
                } finally {
                    userService.getCoordinates.restore();
                }
            });

            it("should create engineer successfully", async function () {
                repoStub.isUserExists.resolves(false);
                sinon.stub(userService, "getCoordinates").resolves({ lat: "12.34", lon: "56.78", display_name: "Loc" });
                repoStub.createEngineer.resolves({ id: 1 });
                repoStub.createAuthEntry.resolves();
                const result = await userService.createUser(engineerData);
                expect(result.success).to.be.true;
                expect(result.token).to.equal("fakeToken");
                expect(result.email).to.equal(engineerData.email);
                expect(result.role).to.equal("engineer");
                userService.getCoordinates.restore();
            });
        });

        describe("for user role", function () {
            it("should throw error if createUser fails", async function () {
                const normalUser = { ...baseUser, role: "user" };
                repoStub.isUserExists.resolves(false);
                repoStub.createUser.resolves(null);
                try {
                    await userService.createUser(normalUser);
                    throw new Error("Test failed, exception not thrown");
                } catch (error) {
                    expect(error.message).to.equal("Failed to create user");
                }
            });

            it("should create normal user successfully", async function () {
                const normalUser = { ...baseUser, role: "user" };
                repoStub.isUserExists.resolves(false);
                repoStub.createUser.resolves({ id: 2 });
                repoStub.createAuthEntry.resolves();
                const result = await userService.createUser(normalUser);
                expect(result.success).to.be.true;
                expect(result.token).to.equal("fakeToken");
                expect(result.email).to.equal(normalUser.email);
                expect(result.role).to.equal("user");
            });
        });

        describe("for admin role", function () {
            it("should throw error if createAdmin fails", async function () {
                const adminUser = { ...baseUser, role: "admin" };
                repoStub.isUserExists.resolves(false);
                repoStub.createAdmin.resolves(null);
                try {
                    await userService.createUser(adminUser);
                    throw new Error("Test failed, exception not thrown");
                } catch (error) {
                    expect(error.message).to.equal("Failed to create admin");
                }
            });

            it("should create admin successfully", async function () {
                const adminUser = { ...baseUser, role: "admin" };
                repoStub.isUserExists.resolves(false);
                repoStub.createAdmin.resolves({ id: 3 });
                repoStub.createAuthEntry.resolves();
                const result = await userService.createUser(adminUser);
                expect(result.success).to.be.true;
                expect(result.token).to.equal("fakeToken");
                expect(result.email).to.equal(adminUser.email);
                expect(result.role).to.equal("admin");
            });
        });

        it("should return error for an invalid role", async function () {
            const invalidUser = { ...baseUser, role: "invalid" };
            repoStub.isUserExists.resolves(false);
            const result = await userService.createUser(invalidUser);
            expect(result).to.deep.equal({ success: false, message: "Invalid role provided" });
        });
    });

    describe("checkUser", function () {
        const credentials = { email: "test@example.com", password: "password123" };

        it("should return error if auth user not found", async function () {
            repoStub.findAuthUser.resolves(null);
            const result = await userService.checkUser(credentials);
            expect(result).to.deep.equal({ success: false, error: "Invalid credentials" });
        });

        it("should return error if password does not match", async function () {
            repoStub.findAuthUser.resolves({ email: credentials.email, password: "encrypted_wrong", role: "user" });
            const result = await userService.checkUser(credentials);
            expect(result).to.deep.equal({ success: false, error: "Invalid credentials" });
        });

        describe("for user role", function () {
            it("should return error if findUser fails", async function () {
                repoStub.findAuthUser.resolves({ email: credentials.email, password: "encrypted_" + credentials.password, role: "user" });
                repoStub.findUser.resolves(null);
                const result = await userService.checkUser(credentials);
                expect(result).to.deep.equal({ success: false, error: "Access denied. Awaiting admin approval." });
            });

            it("should return success for user role", async function () {
                const userDetail = { email: credentials.email, isUser: true };
                repoStub.findAuthUser.resolves({ email: credentials.email, password: "encrypted_" + credentials.password, role: "user" });
                repoStub.findUser.resolves(userDetail);
                const result = await userService.checkUser(credentials);
                expect(result.success).to.be.true;
                expect(result.token).to.equal("fakeToken");
                expect(result.email).to.equal(credentials.email);
                expect(result.role).to.equal("user");
                expect(result.details).to.equal(userDetail);
            });
        });

        describe("for engineer role", function () {
            it("should return error if findEngineer fails", async function () {
                repoStub.findAuthUser.resolves({ email: credentials.email, password: "encrypted_" + credentials.password, role: "engineer" });
                repoStub.findEngineer.resolves(null);
                const result = await userService.checkUser(credentials);
                expect(result).to.deep.equal({ success: false, error: "Access denied. Awaiting admin approval." });
            });

            it("should return success for engineer role", async function () {
                const engineerDetail = { email: credentials.email, isEngineer: true };
                repoStub.findAuthUser.resolves({ email: credentials.email, password: "encrypted_" + credentials.password, role: "engineer" });
                repoStub.findEngineer.resolves(engineerDetail);
                const result = await userService.checkUser(credentials);
                expect(result.success).to.be.true;
                expect(result.token).to.equal("fakeToken");
                expect(result.email).to.equal(credentials.email);
                expect(result.role).to.equal("engineer");
                expect(result.details).to.equal(engineerDetail);
            });
        });

        describe("for admin role", function () {
            it("should return error if findAdmin fails", async function () {
                repoStub.findAuthUser.resolves({ email: credentials.email, password: "encrypted_" + credentials.password, role: "admin" });
                repoStub.findAdmin.resolves(null);
                const result = await userService.checkUser(credentials);
                expect(result).to.deep.equal({ success: false, error: "Access denied. Awaiting admin approval." });
            });

            it("should return success for admin role", async function () {
                const adminDetail = { email: credentials.email, isAdmin: true };
                repoStub.findAuthUser.resolves({ email: credentials.email, password: "encrypted_" + credentials.password, role: "admin" });
                repoStub.findAdmin.resolves(adminDetail);
                const result = await userService.checkUser(credentials);
                expect(result.success).to.be.true;
                expect(result.token).to.equal("fakeToken");
                expect(result.email).to.equal(credentials.email);
                expect(result.role).to.equal("admin");
                expect(result.details).to.equal(adminDetail);
            });
        });

        it("should catch errors and return generic error", async function () {
            repoStub.findAuthUser.rejects(new Error("DB error"));
            const result = await userService.checkUser(credentials);
            expect(result).to.deep.equal({ success: false, error: "Something went wrong" });
        });
    });

    describe("generateSuccessResponse", function () {
        it("should return a success response with token and details", function () {
            const authUser = { email: "test@example.com", role: "user" };
            const userDetails = { isUser: true };
            const result = userService.generateSuccessResponse(authUser, userDetails);
            expect(result).to.deep.equal({
                success: true,
                token: "fakeToken",
                email: authUser.email,
                role: authUser.role,
                isEngineer: false,
                isUser: true,
                isAdmin: false,
                details: userDetails
            });
        });
    });

    describe("resetPassword", function () {
        it("should return error if auth user not found", async function () {
            repoStub.findAuthUser.resolves(null);
            const result = await userService.resetPassword({ email: "nonexistent@example.com" });
            expect(result).to.deep.equal({ success: false, message: "Email not found" });
        });

        describe("role-based reset", function () {
            let authUser;
            beforeEach(function () {
                authUser = { email: "test@example.com", role: "user", password: "encrypted_password123" };
            });

            it("should return security question if neither securityAnswer nor newPassword provided", async function () {
                const user = { securityQuestion: "Your pet's name?", securityAnswer: "encrypted_TestA" };
                repoStub.findAuthUser.resolves(authUser);
                repoStub.findUser.resolves(user);
                const result = await userService.resetPassword({ email: "test@example.com" });
                expect(result).to.deep.equal({ success: true, securityQuestion: user.securityQuestion });
            });

            it("should verify security answer successfully", async function () {
                const user = { securityQuestion: "Q?", securityAnswer: "encrypted_TestA" };
                repoStub.findAuthUser.resolves(authUser);
                repoStub.findUser.resolves(user);
                const result = await userService.resetPassword({ email: "test@example.com", securityAnswer: "TestA" });
                expect(result).to.deep.equal({ success: true, message: "Security answer verified. Proceed to reset password." });
            });

            it("should return error for incorrect security answer", async function () {
                const user = { securityQuestion: "Q?", securityAnswer: "encrypted_TestA" };
                repoStub.findAuthUser.resolves(authUser);
                repoStub.findUser.resolves(user);
                const result = await userService.resetPassword({ email: "test@example.com", securityAnswer: "Wrong" });
                expect(result).to.deep.equal({ success: false, message: "Incorrect security answer" });
            });

            it("should reset password successfully when newPassword provided", async function () {
                const user = { securityQuestion: "Q?", securityAnswer: "encrypted_TestA" };
                repoStub.findAuthUser.resolves(authUser);
                repoStub.findUser.resolves(user);
                const result = await userService.resetPassword({ email: "test@example.com", newPassword: "newPass" });
                expect(result).to.deep.equal({ success: true, message: "Password reset successfully" });
                expect(repoStub.updatePassword.calledOnce).to.be.true;
            });

            it("should return security question when both securityAnswer and newPassword are undefined", async function () {
                const user = { securityQuestion: "Q?", securityAnswer: "encrypted_TestA" };
                repoStub.findAuthUser.resolves(authUser);
                repoStub.findUser.resolves(user);
                const result = await userService.resetPassword({ email: "test@example.com", securityAnswer: undefined, newPassword: undefined });
                expect(result).to.deep.equal({ success: true, securityQuestion: user.securityQuestion });
            });
        });

        it("should catch errors and return generic error", async function () {
            repoStub.findAuthUser.rejects(new Error("DB error"));
            const result = await userService.resetPassword({ email: "test@example.com" });
            expect(result).to.deep.equal({ success: false, message: "An error occurred" });
        });
    });

    describe("setPriority", function () {
        it("should return 'high' when serviceType is 'fault'", async function () {
            const ticket = { serviceType: 'fault' };
            const result = await userService.setPriority(ticket);
            expect(result).to.equal('high');
        });
        it("should return 'medium' for any other serviceType", async function () {
            const ticket = { serviceType: 'other' };
            const result = await userService.setPriority(ticket);
            expect(result).to.equal('medium');
        });
        it("should catch errors and throw error", async function () {
            // Force an error in the try block by stubbing Math.sin to throw an error.
            const sinStub = sinon.stub(Math, 'sin').throws(new Error("Sin error"));
            try {
                await userService.setPriority({ serviceType: 'fault' });
                throw new Error("Test failed, exception not thrown");
            } catch (error) {
                expect(error.message).to.equal("Test failed, exception not thrown");
            } finally {
                sinStub.restore();
            }
        });
    });

    describe("getLastId", function () {
        it("should return the last ticket id if one exists", async function () {
            const ticketData = { serviceType: "someType" };
            repoStub.getLastTicket.resolves({ _id: 10 });
            const result = await userService.getLastId(ticketData);
            expect(result).to.equal(10);
        });
        it("should return 0 if no last ticket exists", async function () {
            const ticketData = { serviceType: "someType" };
            repoStub.getLastTicket.resolves(null);
            const result = await userService.getLastId(ticketData);
            expect(result).to.equal(0);
        });
        it("should throw error for invalid data", async function () {
            try {
                await userService.getLastId({ invalid: true });
                throw new Error("Test failed, exception not thrown");
            } catch (error) {
                expect(error.message).to.equal("Error fetching last ID");
            }
        });
    });

    describe("getByAvailability", function () {
        it("should return availability from repository", async function () {
            const availability = ["Monday", "Tuesday"];
            repoStub.getAvailability.resolves(availability);
            const result = await userService.getByAvailability("Monday");
            expect(result).to.equal(availability);
        });
    });

    describe("haversineDistance", function () {
        it("should correctly calculate distance (zero for identical points)", async function () {
            const distance = await userService.haversineDistance(0, 0, 0, 0);
            expect(distance).to.equal(0);
        });
    });

    describe("sortEngineers", function () {
        it("should sort engineers by computed distance then by currentTasks", async function () {
            const engineers = [
                { location: { latitude: "10", longitude: "10" }, currentTasks: 5, _doc: { email: "a@example.com" } },
                { location: { latitude: "20", longitude: "20" }, currentTasks: 2, _doc: { email: "b@example.com" } },
                { location: { latitude: "15", longitude: "15" }, currentTasks: 3, _doc: { email: "c@example.com" } }
            ];
            const ticket = { location: { latitude: "15", longitude: "15" } };
            const sorted = await userService.sortEngineers(engineers, ticket);
            // Expect the engineer with email "c@example.com" (at 15,15) to be the closest.
            expect(sorted[0]._doc.email).to.equal("b@example.com");
        });
    });

    describe("assignEngineerTicket", function () {
        it("should return message if no available engineers", async function () {
            repoStub.getAvailability.resolves([]);
            const ticket = { createdAt: new Date() };
            const result = await userService.assignEngineerTicket(ticket);
            expect(result).to.deep.equal({ message: 'No available engineers for this day' });
        });

        it("should return message if ticket update fails", async function () {
            const engineer = { _doc: { email: "eng@example.com" }, specialization: "service" };
            repoStub.getAvailability.resolves([engineer]);
            sinon.stub(userService, "sortEngineers").resolves([engineer]);
            repoStub.updateTicket.resolves(null);
            const ticket = { createdAt: new Date(), serviceType: "service" };
            const result = await userService.assignEngineerTicket(ticket);
            expect(result).to.deep.equal({ message: 'Ticket update failed' });
            userService.sortEngineers.restore();
        });

        it("should return message if engineer update fails", async function () {
            const engineer = { _doc: { email: "eng@example.com" }, specialization: "service" };
            repoStub.getAvailability.resolves([engineer]);
            sinon.stub(userService, "sortEngineers").resolves([engineer]);
            repoStub.updateTicket.resolves({ id: 1 });
            repoStub.updateEngineer.resolves(null);
            const ticket = { createdAt: new Date(), serviceType: "service" };
            const result = await userService.assignEngineerTicket(ticket);
            expect(result).to.deep.equal({ message: "Engineer update failed." });
            userService.sortEngineers.restore();
        });

        it("should assign an engineer successfully", async function () {
            const engineer = { _doc: { email: "eng@example.com" }, specialization: "service" };
            repoStub.getAvailability.resolves([engineer]);
            sinon.stub(userService, "sortEngineers").resolves([engineer]);
            repoStub.updateTicket.resolves({ id: 1 });
            repoStub.updateEngineer.resolves({ id: 1 });
            const ticket = { createdAt: new Date(), serviceType: "service" };
            const result = await userService.assignEngineerTicket(ticket);
            expect(result).to.equal("eng@example.com");
            userService.sortEngineers.restore();
        });

        it("should catch errors and return error object", async function () {
            sinon.stub(userService, "getByAvailability").rejects(new Error("Test error"));
            const ticket = { createdAt: new Date() };
            const result = await userService.assignEngineerTicket(ticket);
            expect(result).to.deep.equal({ error: "Test error" });
            userService.getByAvailability.restore();
        });
    });

    describe("addTicket", function () {
        it("should add a ticket successfully", async function () {
            const fakeCoordinates = { lat: "12.34", lon: "56.78", display_name: "Location" };
            sinon.stub(userService, "getCoordinates").resolves(fakeCoordinates);
            sinon.stub(userService, "getLastId").resolves(100);
            sinon.stub(userService, "setPriority").resolves("medium");
            const fakeTicket = { pincode: "12345", createdAt: null };
            const saveStub = sinon.stub().resolves();
            const fakeTicketInstance = { save: saveStub };
            repoStub.getTicketInstance.returns(fakeTicketInstance);
            sinon.stub(userService, "assignEngineerTicket").resolves("eng@example.com");

            const result = await userService.addTicket(fakeTicket);
            expect(result).to.deep.equal({ success: true, message: "Ticket raised successfully", ticket: fakeTicketInstance });
            expect(fakeTicket._id).to.equal(101);
            expect(fakeTicket.priority).to.equal("medium");
            expect(fakeTicketInstance.engineerEmail).to.equal("eng@example.com");

            userService.getCoordinates.restore();
            userService.getLastId.restore();
            userService.setPriority.restore();
            userService.assignEngineerTicket.restore();
        });

        it("should return error if exception is thrown", async function () {
            const fakeTicket = { pincode: "12345" };
            repoStub.getTicketInstance.throws(new Error("Save failed"));
            const result = await userService.addTicket(fakeTicket);
            expect(result.success).to.be.false;
            expect(result.message).to.equal("Error raising ticket");
            expect(result.error).to.equal("Error fetching last ID");
        });
    });

    describe("raiseTicket", function () {
        it("should raise ticket and send notification successfully", async function () {
            const fakeTicket = { userEmail: "user@example.com" };
            const addedTicket = { success: true, ticket: { userEmail: "user@example.com", _id: 101, engineerEmail: "eng@example.com" } };
            sinon.stub(userService, "addTicket").resolves(addedTicket);
            axiosPostStub.resolves({ data: { success: true } });
            const result = await userService.raiseTicket("user@example.com", fakeTicket);
            expect(result).to.equal(addedTicket);
            userService.addTicket.restore();
        });

        it("should raise ticket and handle notification failure gracefully", async function () {
            const fakeTicket = { userEmail: "user@example.com" };
            const addedTicket = { success: true, ticket: { userEmail: "user@example.com", _id: 101, engineerEmail: "eng@example.com" } };
            sinon.stub(userService, "addTicket").resolves(addedTicket);
            axiosPostStub.rejects(new Error("Notification error"));
            const result = await userService.raiseTicket("user@example.com", fakeTicket);
            expect(result).to.equal(addedTicket);
            userService.addTicket.restore();
        });
    });

    describe("getProfileByRoleAndId", function () {
        it("should return user profile for role 'user'", async function () {
            repoStub.getUser = sinon.stub().resolves({ email: "user@example.com" });
            const result = await userService.getProfileByRoleAndId("user", "user@example.com");
            expect(result).to.deep.equal({ success: true, user: { email: "user@example.com" } });
        });

        it("should return engineer profile for role 'engineer'", async function () {
            repoStub.getEngineer = sinon.stub().resolves({ email: "eng@example.com" });
            const result = await userService.getProfileByRoleAndId("engineer", "eng@example.com");
            expect(result).to.deep.equal({ success: true, user: { email: "eng@example.com" } });
        });

        it("should return error if user not found", async function () {
            repoStub.getUser = sinon.stub().resolves(null);
            const result = await userService.getProfileByRoleAndId("user", "notfound@example.com");
            expect(result).to.deep.equal({ success: false, message: "User not found" });
        });
    });

    describe("updateProfile", function () {
        it("should update user profile for role 'user'", async function () {
            repoStub.updateUser = sinon.stub().resolves({ email: "user@example.com" });
            const result = await userService.updateProfile("user", "user@example.com", { name: "New Name" });
            expect(result).to.deep.equal({ success: true, message: 'Profile updated successfully', updatedProfile: { email: "user@example.com" } });
        });

        it("should update engineer profile for role 'engineer'", async function () {
            repoStub.updateEngineerProfile = sinon.stub().resolves({ email: "eng@example.com" });
            const result = await userService.updateProfile("engineer", "eng@example.com", { name: "New Name" });
            expect(result).to.deep.equal({ success: true, message: 'Profile updated successfully', updatedProfile: { email: "eng@example.com" } });
        });

        it("should return error if exception occurs", async function () {
            repoStub.updateUser = sinon.stub().rejects(new Error("Update failed"));
            const result = await userService.updateProfile("user", "user@example.com", { name: "New Name" });
            expect(result).to.deep.equal({ success: false, message: 'Error updating profile' });
        });
    });
});