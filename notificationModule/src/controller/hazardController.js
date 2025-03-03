const { routeHandler } = require('ca-webutils/expressx');
const HazardService = require('../service/hazardService');
const hazardService = new HazardService();

const hazardController = {
    getAllHazards: routeHandler(async () => {
        const hazards = await hazardService.getAllHazards();
        return { success: true, hazards };
    }),

    addNewHazards: routeHandler(async ({ body }) => {
        const newHazard = body
        const hazard = await hazardService.addNewHazard(newHazard);
        return { success: true, hazard };
    }),

    updateHazard: routeHandler(async ({ params, body }) => {
        const data = body
        const { id } = params;
        const hazard = await hazardService.updateHazard(id, data);
        return { success: true, hazard };
    }),

    deleteHazard: routeHandler(async ({ params }) => {
        const { id } = params;
        const hazard = await hazardService.deleteHazard(id);
        return { success: true, hazard };
    }),

    getHazardById: routeHandler(async ({ params }) => {
        const { id } = params;
        const hazard = await hazardService.getHazardById(id);
        return { success: true, hazard };
    }),
}

module.exports = hazardController