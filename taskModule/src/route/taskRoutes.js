const express = require('express');
const taskController = require('../controller/taskController');
const { default: axios } = require('axios');
const authMiddleware = require('../utils/authMiddleware')

const router = express.Router();

// Get role specific Tasks by email
router.get('/:role/:email', authMiddleware(), taskController.getTasks)

// Get role specific Tasks by status
router.get('/:role/:email/:status', authMiddleware(), taskController.getTasksByStatus)

// Get role specific Tasks by priority
router.get('/:role/:email/priority/:priority', authMiddleware(), taskController.getTasksByPriority)

//update ticket status
router.patch('/updateTicketStatus/:id', authMiddleware(), taskController.updateTicketStatus)

//accept task
router.patch('/:ticketId/accept/:email', authMiddleware(['engineer']), taskController.acceptTask)

//reject task
router.patch('/:ticketId/reject/:email', authMiddleware(['engineer']), taskController.rejectTask)


module.exports = router;