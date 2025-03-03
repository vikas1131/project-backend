const express = require('express');
const userController = require('../controller/userController');
const { default: axios } = require('axios');
const authMiddleware = require('../utils/authMiddleware');

const router = express.Router();

// Get All Users

router.get('/', userController.getAllUsers);

// get ticket by status

router.get('/:email/:status', userController.getTicketsByStatus);

// Creating new user

router.post("/newUser", userController.createNewUser);

// checking user existance

router.post("/checkUser", userController.checkUser);

//reset password
router.post('/reset', userController.resetPassword);

//raise ticket
router.post('/raiseTicket/:userEmail', authMiddleware(['user']), userController.raiseTicket);

// get profile
router.get("/profile/:role/:Email", authMiddleware(), userController.profile);

//update profile
router.patch("/updateProfile/:role/:Email", authMiddleware(), userController.updateProfile);

module.exports = router;