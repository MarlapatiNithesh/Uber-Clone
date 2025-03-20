const express = require('express');
const router = express.Router();
const captainController = require('../controllers/captain.controllers.js');
const authMiddleware = require('../middlewares/auth.middleware.js');
const { body } = require('express-validator');

router.post('/register', [
    body('email').isEmail().withMessage('Invalid Email'),
    body('fullname.firstname').isLength({ min: 3 }).withMessage('First name must be at least 3 characters long'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
    body('vehicle.color').isLength({ min: 3 }).withMessage('Color must be at least 3 characters long'),
    body('vehicle.plate').isLength({ min: 3 }).withMessage('Plate must be at least 3 characters long'),
    body('vehicle.capacity').isInt({ min: 1 }).withMessage('Capacity must be at least 1'),
    body('vehicle.vehicleType').isLength({ min: 3 }).withMessage('Vehicle Type must be at least 3 characters long'),
], captainController.registerCaptain);

router.post('/login', [
    body('email').isEmail().withMessage('Invalid Email'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
], captainController.loginCaptain);

// 🔥 FIXED HERE
router.get('/profile', authMiddleware.authCaptain, captainController.getProfile);
router.get('/logout', authMiddleware.authCaptain, captainController.logoutCaptain);

module.exports = router;
