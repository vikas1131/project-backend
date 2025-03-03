const HazardRepository = require('../repository/hazardRepository'); 
const axios = require('axios');
const https = require('https');

class HazardService {
    constructor() {
        this.HazardRepository = new HazardRepository(); 
        this.axios = axios;
    }
    async getAllHazards() {
        return await this.HazardRepository.getAllHazards();
    }

    async getCoordinates(pincode) {
        try {
            const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(pincode)}`;
            const response = await this.axios.get(url, {
                httpsAgent: new https.Agent({
                    rejectUnauthorized: false
                })
            });
            if (response.data.length === 0) {
                return { message: 'No results found for the given address' };
            }
            const location = response.data[0];
            return {
                latitude: location.lat,
                longitude: location.lon,
                address: location.display_name
            };
        } catch (error) {
            return null;
        }
    }

    async addNewHazard(newHazardData) {
        try {
            let coordinates = await this.getCoordinates(newHazardData.pincode);
            newHazardData.location = {
                latitude: coordinates.latitude,
                longitude: coordinates.longitude
            };

            newHazardData.address = coordinates.address;
            console.log(newHazardData);
            const newHazard = this.HazardRepository.addHazard(newHazardData)
            return await newHazard;
        } catch (error) {
            return { error: "Error saving new hazard" };
        }
    }

    async updateHazard(id, data) {
        try {
            if (data.pincode) {
                let coordinates = await this.getCoordinates(data.pincode);
                data.location = {
                    latitude: coordinates.latitude,
                    longitude: coordinates.longitude
                };
                data.address = coordinates.address;
            }
            let updatedHazard = await this.HazardRepository.updateHazard(id,data)
            return { success: true, message: 'hazard updated successfully', updatedHazard: updatedHazard };
        } catch (err) {
            return { success: false, message: 'Error updating hazard' };
        }
    }

    async deleteHazard(id) {
        try {
            let deletedHazard = await this.HazardRepository.deleteHazard(id)
            return { success: true, message: 'hazard deleted successfully', deletedHazard: deletedHazard };
        } catch (err) {
            return { success: false, message: 'Error deleting hazard' };
        }
    }

    async getHazardById(id) {
        return await this.HazardRepository.getHazardById(id);
    }

}

module.exports = HazardService;