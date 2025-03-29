const express = require('express');
const router =express.Router()
const {body,query} = require('express-validator')
const rideController = require('../controllers/ride.controller')
const authMiddleware = require('../middlewares/auth.middleware')

router.post('/create',[
    body('pickup').isString().isLength({min:3}).withMessage('Invalid pickup address'),
    body('destination').isString().isLength({min:3}).withMessage('Invalid destination address'),
    body('vehicleType').isString().isIn(['auto','car','moto']).withMessage('Invalid vehicle Type')
],authMiddleware.authUser,rideController.createRide)

router.get('/get-fare',[
    query('pickup').isString().isLength({min:3}).withMessage('Invalid pickup'),
    query('destination').isString().isLength({min:3}).withMessage('Invalid destination'),
],authMiddleware.authUser,rideController.getFare)

router.post('/confirm',[
    body('rideId').isMongoId().withMessage('invalid ride id'),
],authMiddleware.authCaptain,rideController.confirmRide)

router.get('/start-ride',[
    query('rideId').isMongoId().withMessage('Invalid ride Id'),
    query('otp').isString().isLength({min:6,max:6}).withMessage('Invalid otp'),
],authMiddleware.authCaptain,rideController.startRide)

router.post('/end-ride',[
    body('rideId').isMongoId().withMessage('Invalid Ride Id')
],authMiddleware.authCaptain,rideController.endRide)


module.exports=router;