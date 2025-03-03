const { expect } = require("chai");
const mongoose = require("mongoose");
const Admin = require("../../src/model/admin.model");

describe("Admin Model Tests", function () {
    before(async function () {
        await mongoose.connect("mongodb://127.0.0.1:27017/testdb", {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
    });

    after(async function () {
        await mongoose.connection.dropDatabase();
        await mongoose.connection.close();
    });

    afterEach(async function () {
        await Admin.deleteMany({});
    });

    it("should create an admin with valid fields", async function () {
        const adminData = {
            email: "admin@example.com",
            name: "Admin User",
            phone: "1234567890",
            securityQuestion: "Your first pet's name?",
            securityAnswer: "Charlie",
            address: "123 Street, City",
            pincode: "560001",
            isAdmin: true,
            isEngineer: false,
            isUser: false
        };

        const admin = new Admin(adminData);
        const savedAdmin = await admin.save();

        expect(savedAdmin).to.have.property("_id");
        expect(savedAdmin.email).to.equal(adminData.email);
        expect(savedAdmin.name).to.equal(adminData.name);
        expect(savedAdmin.phone).to.equal(adminData.phone);
        expect(savedAdmin.securityQuestion).to.equal(adminData.securityQuestion);
        expect(savedAdmin.securityAnswer).to.equal(adminData.securityAnswer);
        expect(savedAdmin.address).to.equal(adminData.address);
        expect(savedAdmin.pincode).to.equal(adminData.pincode);
        expect(savedAdmin.isAdmin).to.be.true;
        expect(savedAdmin.isEngineer).to.be.false;
        expect(savedAdmin.isUser).to.be.false;
    });

    it("should fail to create an admin without required fields", async function () {
        const admin = new Admin({}); // Missing required fields

        try {
            await admin.save();
        } catch (error) {
            expect(error).to.exist;
            expect(error.errors).to.have.property("email");
            expect(error.errors).to.have.property("name");
            expect(error.errors).to.have.property("phone");
            expect(error.errors).to.have.property("securityQuestion");
            expect(error.errors).to.have.property("securityAnswer");
            expect(error.errors).to.have.property("address");
            expect(error.errors).to.have.property("pincode");
        }
    });

    it("should enforce unique email constraint", async function () {
        const adminData = {
            email: "admin@example.com",
            name: "Admin User",
            phone: "1234567890",
            securityQuestion: "Your first pet's name?",
            securityAnswer: "Charlie",
            address: "123 Street, City",
            pincode: "560001",
            isAdmin: true,
            isEngineer: false,
            isUser: false
        };

        const admin1 = new Admin(adminData);
        await admin1.save();

        const admin2 = new Admin(adminData);
        try {
            await admin2.save();
        } catch (error) {
            expect(error).to.exist;
            expect(error.code).to.equal(11000); // Duplicate key error code
        }
    });

    it("should set default values for isAdmin, isEngineer, and isUser", async function () {
        const adminData = {
            email: "admin@example.com",
            name: "Admin User",
            phone: "1234567890",
            securityQuestion: "Your first pet's name?",
            securityAnswer: "Charlie",
            address: "123 Street, City",
            pincode: "560001"
        };

        const admin = new Admin(adminData);
        const savedAdmin = await admin.save();

        expect(savedAdmin.isAdmin).to.be.false;
        expect(savedAdmin.isEngineer).to.be.false;
        expect(savedAdmin.isUser).to.be.false;
    });

    it("should have a createdAt timestamp", async function () {
        const adminData = {
            email: "admin@example.com",
            name: "Admin User",
            phone: "1234567890",
            securityQuestion: "Your first pet's name?",
            securityAnswer: "Charlie",
            address: "123 Street, City",
            pincode: "560001"
        };

        const admin = new Admin(adminData);
        const savedAdmin = await admin.save();

        expect(savedAdmin).to.have.property("createdAt");
        expect(savedAdmin.createdAt).to.be.a("date");
    });
});
