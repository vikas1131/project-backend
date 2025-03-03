const express = require('express');
const hazardController = require('../controller/hazardController');

const router = express.Router();

// Get all hazards
router.get('/getAllHazards', hazardController.getAllHazards)

// add new hazard
router.post('/addNewHazard', hazardController.addNewHazards)

// update hazard
router.patch('/updateHazard/:id', hazardController.updateHazard)

//delete hazard
router.delete('/deleteHazard/:id', hazardController.deleteHazard)

//get hazard by id

router.get('/getHazardById/:id', hazardController.getHazardById)

module.exports = router;