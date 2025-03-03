const Hazard = require('../model/hazards.model'); 
class HazardRepository {
    async getAllHazards() {
        return await Hazard.find({});
    }
    async addHazard(newHazardData) {
        return await Hazard.insertOne(newHazardData);
    }
    async updateHazard(id, data) {
        return await Hazard.findOneAndUpdate({ _id: id }, data, { new: true });
    }
    async deleteHazard(id) {
        return await Hazard.findOneAndDelete({ _id: id });
    }
    async getHazardById(id) {
        return await Hazard.findById(id);
    }

}

module.exports = HazardRepository;