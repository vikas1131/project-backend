const chai = require('chai');
const sinon = require('sinon');
const axios = require('axios');
const https = require('https');
const HazardService = require('../../src/service/hazardService');
const HazardRepository = require('../../src/repository/hazardRepository');;

const { expect } = chai;

describe("HazardService", function () {
    let hazardService;
    let mockHazardRepository;
    let axiosStub;

    beforeEach(function () {
        mockHazardRepository = {
            getAllHazards: sinon.stub(),
            addHazard: sinon.stub(),
            updateHazard: sinon.stub(),
            deleteHazard: sinon.stub(),
            getHazardById: sinon.stub()
        };

        axiosStub = sinon.stub(axios, "get");
        sinon.stub(HazardRepository.prototype, "constructor").returns(mockHazardRepository);
        hazardService = new HazardService();
        hazardService.HazardRepository = mockHazardRepository;
    });

    afterEach(function () {
        sinon.restore();
    });

    describe("getAllHazards", function () {
        it("should return all hazards", async function () {
            const expectedHazards = [{ id: 1, name: "Hazard 1" }, { id: 2, name: "Hazard 2" }];
            mockHazardRepository.getAllHazards.resolves(expectedHazards);

            const result = await hazardService.getAllHazards();
            expect(result).to.deep.equal(expectedHazards);
        });
    });

    describe("addNewHazard", function () {
        it("should successfully add a new hazard", async function () {
            const newHazardData = { name: "Test Hazard", pincode: "560001" };
            const coordinates = { latitude: "12.9715987", longitude: "77.5945627", address: "Bangalore, Karnataka" };

            sinon.stub(hazardService, "getCoordinates").resolves(coordinates);
            mockHazardRepository.addHazard.resolves({ ...newHazardData, location: coordinates, address: coordinates.address });

            const result = await hazardService.addNewHazard(newHazardData);
            expect(result).to.deep.equal({ ...newHazardData, location: coordinates, address: coordinates.address });
        });

        it("should return an error when failing to add a hazard", async function () {
            sinon.stub(hazardService, "getCoordinates").throws(new Error("API Error"));

            const result = await hazardService.addNewHazard({ name: "Test Hazard", pincode: "560001" });
            expect(result).to.deep.equal({ error: "Error saving new hazard" });
        });
    });

    describe("updateHazard", function () {
        it("should successfully update a hazard", async function () {
            const hazardId = "123";
            const updateData = { name: "Updated Hazard", pincode: "560001" };
            const coordinates = { latitude: "12.9715987", longitude: "77.5945627", address: "Bangalore, Karnataka" };

            sinon.stub(hazardService, "getCoordinates").resolves(coordinates);
            mockHazardRepository.updateHazard.resolves({ ...updateData, location: coordinates, address: coordinates.address });

            const result = await hazardService.updateHazard(hazardId, updateData);
            expect(result).to.deep.equal({
                success: true,
                message: "hazard updated successfully",
                updatedHazard: { ...updateData, location: coordinates, address: coordinates.address }
            });
        });

        it("should return an error when failing to update a hazard", async function () {
            mockHazardRepository.updateHazard.rejects(new Error("Update Error"));

            const result = await hazardService.updateHazard("123", {});
            expect(result).to.deep.equal({ success: false, message: "Error updating hazard" });
        });
    });

    describe("deleteHazard", function () {
        it("should successfully delete a hazard", async function () {
            const hazardId = "123";
            const deletedHazard = { id: hazardId, name: "Deleted Hazard" };
            mockHazardRepository.deleteHazard.resolves(deletedHazard);

            const result = await hazardService.deleteHazard(hazardId);
            expect(result).to.deep.equal({ success: true, message: "hazard deleted successfully", deletedHazard });
        });

        it("should return an error when failing to delete a hazard", async function () {
            mockHazardRepository.deleteHazard.rejects(new Error("Delete Error"));

            const result = await hazardService.deleteHazard("123");
            expect(result).to.deep.equal({ success: false, message: "Error deleting hazard" });
        });
    });

    describe("getHazardById", function () {
        it("should return hazard by id", async function () {
            const hazardId = "123";
            const expectedHazard = { id: hazardId, name: "Test Hazard" };
            mockHazardRepository.getHazardById.resolves(expectedHazard);

            const result = await hazardService.getHazardById(hazardId);
            expect(result).to.deep.equal(expectedHazard);
        });
    });

    describe("getCoordinates", function () {
        it("should return coordinates when API responds correctly", async function () {
            const pincode = "560001";
            const expectedResponse = [{ lat: "12.9715987", lon: "77.5945627", display_name: "Bangalore, Karnataka" }];
            axiosStub.resolves({ data: expectedResponse });

            const result = await hazardService.getCoordinates(pincode);
            expect(result).to.deep.equal({ latitude: "12.9715987", longitude: "77.5945627", address: "Bangalore, Karnataka" });
        });

        it("should return message when no results are found", async function () {
            axiosStub.resolves({ data: [] });

            const result = await hazardService.getCoordinates("560001");
            expect(result).to.deep.equal({ message: "No results found for the given address" });
        });

        it("should return null when an error occurs", async function () {
            axiosStub.rejects(new Error("API Error"));

            const result = await hazardService.getCoordinates("560001");
            expect(result).to.be.null;
        });
    });
});
