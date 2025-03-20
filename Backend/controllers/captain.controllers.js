const captainModel = require("../models/captain.model.js");
const captainService = require("../services/captain.services.js");
const blacklistTokenModel = require('../models/blacklistToken.model')
const { validationResult } = require("express-validator");

module.exports.registerCaptain = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array() }); // Added `return` to prevent further execution
  }

  const { fullname, email, password, vehicle } = req.body; // Fixed typo: `vechile` → `vehicle`

  const isCaptainAlreadyExist = await captainModel.findOne({ email });
  if (isCaptainAlreadyExist) {
    return res.status(400).json({ message: "Captain already exists" }); // Fixed typo in message
  }

  const hashPassword = await captainModel.prototype.hashPassword(password);

  const captain = await captainService.createCaptain({
    firstname: fullname.firstname,
    lastname: fullname.lastname,
    email,
    password: hashPassword,
    color: vehicle?.color,
    plate: vehicle?.plate,
    capacity: vehicle?.capacity,
    vehicleType: vehicle?.vehicleType, // ✅ Fix: corrected the key name
  });

  const token = captain.generateToken();
  res.status(201).json({ token, captain });
};


module.exports.loginCaptain = async (req,res,next) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array() }); // Added `return` to prevent further execution
    }

    const {email,password}=req.body

    const captain=await captainModel.findOne({email}).select('+password')

    if(!captain){
        return res.status(401).json({message:'Invalid email or password'})
    }

    const isPasswordMatch=await captain.comparePassword(password)

    if(!isPasswordMatch){
        return res.status(401).json({message:'Invalid email or password'})
    }

    const token=captain.generateToken()
    res.cookie('token',token)
    res.status(200).json({token,captain})
}

module.exports.getProfile = async (req,res,next) => {
    return res.status(200).json(req.captain)
}

module.exports.logoutCaptain = async (req,res,next) => {

    const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];

    await blacklistTokenModel.create({token})

    res.clearCookie('token')

    res.status(200).json({message:'logout successfully'})
}