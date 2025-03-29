const rideModel = require("../models/ride.model");
const mapService = require("../services/maps.service");
const crypto = require("crypto");

async function getFare(pickup, destination) {
    if (!pickup || !destination) {
        throw new Error("Pickup and Destination are required");
    }

    try {
        // Fetch distance and duration from Google Maps API
        const distanceTime = await mapService.getDistanceTime(pickup, destination);

        // Check if API returned valid distance & duration
        if (!distanceTime || !distanceTime.distance || !distanceTime.duration) {
            throw new Error("Invalid distance or duration from API");
        }

        console.log("API Response:", distanceTime);

        const distanceInKm = distanceTime.distance.value / 1000; // Convert meters to km
        const durationInMinutes = distanceTime.duration.value / 60; // Convert seconds to minutes

        // Validate that distance and duration are numbers
        if (isNaN(distanceInKm) || isNaN(durationInMinutes)) {
            throw new Error("Distance or Duration is NaN");
        }

        // Define base fares
        const baseFare = {
            auto: 30,
            car: 50,
            moto: 20
        };

        // Define per km and per minute rates
        const perKmRate = {
            auto: 10,
            car: 15,
            moto: 8
        };

        const perMinuteRate = {
            auto: 2,
            car: 3,
            moto: 1.5
        };

        // Calculate fares for different vehicle types
        const fares = {
            auto: baseFare.auto + (distanceInKm * perKmRate.auto) + (durationInMinutes * perMinuteRate.auto),
            car: baseFare.car + (distanceInKm * perKmRate.car) + (durationInMinutes * perMinuteRate.car),
            moto: baseFare.moto + (distanceInKm * perKmRate.moto) + (durationInMinutes * perMinuteRate.moto)
        };

        return fares;

    } catch (error) {
        console.error("Error calculating fare:", error.message);
        throw new Error("Unable to calculate fare");
    }
}

module.exports.getFare = getFare

function getOtp(nums){
    function generateOtp(nums) {
        const otp = crypto.randomInt(0, Math.pow(10, nums)).toString().padStart(nums, '0');
        return otp;
    }

    return generateOtp(nums);
}

module.exports.createRide = async ({ user, pickup, destination, vehicleType }) => {
    if (!user || !pickup || !destination || !vehicleType) {
        throw new Error("User, Pickup, Destination, and Vehicle Type are required");
    }

    const fare = await getFare(pickup, destination);
    
    // Check if the requested vehicle type exists in fare calculation
    if (!fare.hasOwnProperty(vehicleType)) {
        throw new Error("Invalid vehicle type selected");
    }

    const ride = await rideModel.create({
        user,
        pickup,
        destination,
        otp:getOtp(6),
        fare: fare[vehicleType] // Assign correct fare based on vehicle type
    });

    return ride;
};

module.exports.confirmRide = async (
    rideId,captainId
) => {
    if(!rideId) {
        throw new Error("Ride ID is required");
    }
    if(!captainId){
        throw new Error("Captain Id is required");
    }

    await rideModel.findOneAndUpdate({
        _id: rideId
    },{
        status:"accepted",
        captain:captainId
    })

    const ride = await rideModel.findOne({
        _id: rideId
    }).populate('user').populate('captain').select('+otp');


    if(!ride){
        throw new Error("Ride not found");
    }

    return ride
}

module.exports.startRide = async (rideId,otp) => {
    if(!rideId || !otp) {
        throw new Error("Ride ID And OTP are required");
    }

    const ride = await rideModel.findOne({
        _id:rideId
    }).populate('user').populate('captain').select('+otp');

    if(!ride){
        throw new Error("Ride not found");
    }

    if(ride.status !== "accepted"){
        throw new Error("Ride status is not accepted");
    }

    if(ride.otp !== otp){
        throw new Error("Invalid OTP");
    }

    await rideModel.findOneAndUpdate({
        _id: rideId
    },{
        status:"ongoing",
    });

    return ride;
}

module.exports.endRide = async ({rideId,captain}) => {
    if(!rideId) {
        throw new Error("Ride ID is required");
    }

    const ride = await rideModel.findOne({
        _id:rideId,
        captain:captain._id
    }).populate('user').populate('captain').select('+otp')

    if(!ride){
        throw new Error("Ride not found");
    }

    if(ride.status!=="ongoing"){
        throw new Error("Ride status is not ongoing");
    }

    await rideModel.findOneAndUpdate({
        _id: rideId
    },{
        status:"completed",
    })

    return ride;
}
