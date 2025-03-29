const { validationResult } = require("express-validator");
const rideService = require("../services/ride.services");
const mapService = require("../services/maps.service");
const {sendMessageToSocketId}=require('../socket');
const rideModel = require("../models/ride.model");

module.exports.createRide = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  if (!req.user || !req.user._id) {
    return res.status(401).json({ message: "Unauthorized: User not found" });
  }

  const { pickup, destination, vehicleType } = req.body;

  try {
    const ride = await rideService.createRide({
      user: req.user._id,
      pickup,
      destination,
      vehicleType,
    });
    
    res.status(201).json(ride);

    const pickupCoordinates = await mapService.getCoordinatesFromAddress(pickup);
    console.log(pickupCoordinates)
    if (!pickupCoordinates || !pickupCoordinates.lat || !pickupCoordinates.lng) {
      console.error("Geocoding failed: No valid coordinates found.");
      return;
    }

    const captainsInRadius = await mapService.getCaptainsInTheRadius(
      pickupCoordinates.lat,
      pickupCoordinates.lng,
      2
    );

    if (!captainsInRadius.length) {
      console.log("No captains found in the radius.");
    } else {
      console.log("Available captains:", captainsInRadius);
    }

    ride.otp=""

    const rideWithUser = await rideModel.findOne({_id:ride._id}).populate('user')
    
    captainsInRadius.map((captain) => {
        if (captain.socketId) {
          try {
            console.log(captain, ride);
            sendMessageToSocketId(captain.socketId,{
                event:'new-ride',
                ride:rideWithUser
            });
          } catch (error) {
            console.error("Error sending message to captain:", error.message);
          }
        } else {
          console.log("Captain has no valid socketId", captain);
        }
      });
      

  } catch (error) {
    console.error("Error in createRide:", error.message);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

module.exports.getFare = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { pickup, destination } = req.query;
  try {
    const fare = await rideService.getFare(pickup, destination);
    return res.status(200).json(fare);
  } catch (error) {
    console.error("Error in getFare:", error.message);
    return res.status(500).json({ message: "Failed to fetch fare", error: error.message });
  }
};

module.exports.confirmRide = async (req,res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const {rideId,captainId}=req.body

  try{
    const ride = await rideService.confirmRide(rideId,captainId);
    sendMessageToSocketId(ride.user.socketId,{
      event:'ride-confirmed',
      ride:ride
    })
    return res.status(200).json(ride);
  }
  catch(e){
    return res.status(500).json({message:e.message})
  }
}

module.exports.startRide = async(req,res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const {rideId,otp} = req.query

  try{
    const ride = await rideService.startRide(rideId,otp);
    sendMessageToSocketId(ride.user.socketId,{
      event:'ride-started',
      ride:ride
    })
    return res.status(200).json(ride)
  }
  catch(error){

    return res.status(500).json({message:error.message})
  }
}


module.exports.endRide = async (req,res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const {rideId} = req.body

  try{
    const ride = await rideService.endRide({rideId,captain:req.captain});
    sendMessageToSocketId(ride.user.socketId,{
      event:"ride-ended",
      ride:ride
    })
    return res.status(200).json(ride)
  }
  catch(error){
    return res.status(500).json({message:error.message})
  }
}