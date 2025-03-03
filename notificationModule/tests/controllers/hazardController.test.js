const { expect } = require("chai");
const sinon = require("sinon");
const hazardController = require("../../src/controller/hazardController");
const HazardService = require("../../src/service/hazardService");

describe("Hazard Controller Unit Tests", function () {
    let sandbox;
    let mockService;

    beforeEach(() => {
        sandbox = sinon.createSandbox();

        mockService = {
            getAllHazards: sandbox.stub(),
            addNewHazard: sandbox.stub(),
            updateHazard: sandbox.stub(),
            deleteHazard: sandbox.stub(),
            getHazardById: sandbox.stub()
        };

        const realService = hazardController.hazardService || HazardService.prototype;

        sandbox.stub(realService, "getAllHazards").callsFake(mockService.getAllHazards);
        sandbox.stub(realService, "addNewHazard").callsFake(mockService.addNewHazard);
        sandbox.stub(realService, "updateHazard").callsFake(mockService.updateHazard);
        sandbox.stub(realService, "deleteHazard").callsFake(mockService.deleteHazard);
        sandbox.stub(realService, "getHazardById").callsFake(mockService.getHazardById);
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe("getAllHazards", function () {
        it("should fetch all hazards successfully", async function () {
            const hazards = [{ id: "1", name: "Flood" }];
            mockService.getAllHazards.resolves(hazards);

            const req = { method: "GET" };
            const res = { status: sandbox.stub().returnsThis(), send: sandbox.stub() };
            const next = sandbox.stub();

            await hazardController.getAllHazards(req, res, next);

            expect(mockService.getAllHazards.calledOnce).to.be.true;
            expect(res.status.calledWith(200)).to.be.true;
            expect(res.send.calledWith({ success: true, hazards })).to.be.true;
        });
    });

    describe("addNewHazards", function () {
        it("should add a new hazard successfully", async function () {
            const newHazard = { id: "2", name: "Earthquake" };
            mockService.addNewHazard.resolves(newHazard);

            const req = { method: "POST", body: { name: "Earthquake" } };
            const res = { status: sandbox.stub().returnsThis(), send: sandbox.stub() };
            const next = sandbox.stub();

            await hazardController.addNewHazards(req, res, next);

            expect(mockService.addNewHazard.calledOnce).to.be.true;
            expect(res.status.calledWith(201)).to.be.true;
            expect(res.send.calledWith({ success: true, hazard: newHazard })).to.be.true;
        });
    });

    describe("updateHazard", function () {
        it("should update a hazard successfully", async function () {
            const updatedHazard = { id: "3", name: "Tsunami" };
            mockService.updateHazard.resolves(updatedHazard);

            const req = { method: "PUT", params: { id: "3" }, body: { name: "Tsunami" } };
            const res = { status: sandbox.stub().returnsThis(), send: sandbox.stub() };
            const next = sandbox.stub();

            await hazardController.updateHazard(req, res, next);

            expect(mockService.updateHazard.calledOnce).to.be.true;
            expect(res.status.calledWith(202)).to.be.true;
            expect(res.send.calledWith({ success: true, hazard: updatedHazard })).to.be.true;
        });
    });

    describe("deleteHazard", function () {
        it("should delete a hazard successfully", async function () {
            mockService.deleteHazard.resolves({ message: "Hazard deleted" });

            const req = { method: "DELETE", params: { id: "4" } };
            const res = { status: sandbox.stub().returnsThis(), send: sandbox.stub() };
            const next = sandbox.stub();

            await hazardController.deleteHazard(req, res, next);

            expect(mockService.deleteHazard.calledOnce).to.be.true;
            expect(res.status.calledWith(204)).to.be.true;
            expect(res.send.calledWith({ success: true, hazard: { message: "Hazard deleted" } })).to.be.true;
        });
    });

    describe("getHazardById", function () {
        it("should get hazard by ID successfully", async function () {
            const hazard = { id: "5", name: "Fire" };
            mockService.getHazardById.resolves(hazard);

            const req = { method: "GET", params: { id: "5" } };
            const res = { status: sandbox.stub().returnsThis(), send: sandbox.stub() };
            const next = sandbox.stub();

            await hazardController.getHazardById(req, res, next);

            expect(mockService.getHazardById.calledOnce).to.be.true;
            expect(res.status.calledWith(200)).to.be.true;
            expect(res.send.calledWith({ success: true, hazard })).to.be.true;
        });
    });
});
