const chai = require("chai");
const sinon = require("sinon");
const mongoose = require("mongoose");
const HazardRepository = require("../../src/repository/hazardRepository");
const Hazard = require("../../src/model/hazards.model");

const { expect } = chai;

describe("HazardRepository", function () {
    let hazardRepo;
    let sandbox;

    beforeEach(function () {
        hazardRepo = new HazardRepository();
        sandbox = sinon.createSandbox();
    });

    afterEach(function () {
        sandbox.restore();
    });

    it("should return all hazards", async function () {
        const mockHazards = [{ _id: "hazard1" }, { _id: "hazard2" }];
        sandbox.stub(Hazard, "find").resolves(mockHazards);

        const result = await hazardRepo.getAllHazards();
        expect(result).to.deep.equal(mockHazards);
    });

    it("should add a new hazard", async function () {
        const newHazard = { name: "Fire", severity: "High" };
        const createdHazard = { _id: "hazard1", ...newHazard };
        sandbox.stub(Hazard, "create").resolves(createdHazard);

        const result = await hazardRepo.addHazard(newHazard);
        expect(result).to.deep.equal(createdHazard);
    });

    it("should update an existing hazard", async function () {
        const updatedHazard = { _id: "hazard1", name: "Flood", severity: "Medium" };
        sandbox.stub(Hazard, "findOneAndUpdate").resolves(updatedHazard);

        const result = await hazardRepo.updateHazard("hazard1", { severity: "Medium" });
        expect(result).to.deep.equal(updatedHazard);
    });

    it("should delete a hazard", async function () {
        const deletedHazard = { _id: "hazard1", name: "Fire" };
        sandbox.stub(Hazard, "findOneAndDelete").resolves(deletedHazard);

        const result = await hazardRepo.deleteHazard("hazard1");
        expect(result).to.deep.equal(deletedHazard);
    });

    it("should return a hazard by ID", async function () {
        const mockHazard = { _id: "hazard1", name: "Landslide" };
        sandbox.stub(Hazard, "findById").resolves(mockHazard);

        const result = await hazardRepo.getHazardById("hazard1");
        expect(result).to.deep.equal(mockHazard);
    });

    it("should return null when trying to delete a non-existing hazard", async function () {
        sandbox.stub(Hazard, "findOneAndDelete").resolves(null);

        const result = await hazardRepo.deleteHazard("nonexistentId");
        expect(result).to.be.null;
    });

    it("should return null when updating a non-existing hazard", async function () {
        sandbox.stub(Hazard, "findOneAndUpdate").resolves(null);

        const result = await hazardRepo.updateHazard("nonexistentId", { severity: "Low" });
        expect(result).to.be.null;
    });
});
