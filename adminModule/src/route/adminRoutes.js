const express = require('express');
const adminController = require('../controller/adminController');
const { default: axios } = require('axios');
const authMiddleware = require('../utils/authMiddleware');

const router = express.Router();

// Get All Tasks

router.get('/tasks',authMiddleware(['admin']), adminController.getAllTasks);

// get All users and engineers

router.get('/:role/',authMiddleware(['admin']), adminController.getUsersByRole);

// get engineer By email

router.get("/engineer/:Email",authMiddleware(['admin']), adminController.getEngineerByEmail);

// get tasks by status

router.get("/status/:status",authMiddleware(['admin']), adminController.getTicketsByStatus);

// get tasks by priority

router.get('/priority/:level',authMiddleware(['admin']), adminController.getTicketsByPriority);

// get engineer by availability

router.get('/engineers/availability/:day', authMiddleware(['admin']), adminController.getEngineersByAvailability);

// get eligible engineers for ticket reassignment

router.get('/engineers/eligible/:ticketId/:day', authMiddleware(['admin']), adminController.getEligibleEngineersForTicket);
// re assign tasks to engineers

router.patch('/reassign/:ticketId/:newEngineerEmail',authMiddleware(['admin']),adminController.reassignTicket)

//get all approved engineers

router.get('/approval/engineers',authMiddleware(['admin']), adminController.getUnapprovedEngineers)

// approve engineer

router.patch('/approve-engineer/:email',authMiddleware(['admin']), adminController.approveEngineer)

module.exports = router;