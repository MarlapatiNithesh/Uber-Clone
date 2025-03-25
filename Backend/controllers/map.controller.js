const mapService = require('../services/maps.service')
const {validationResult} = require('express-validator')


module.exports.getCoordinates = async (req,res,next) => {
     
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()})
    }
    const {address} = req.query

    try{
        const coordinates= await mapService.getCoordinatesFromAddress(address)
        res.status(200).json(coordinates)
    }
    catch(e){
        res.status(404).json({message:`Coordinates not found`})
    }
}

module.exports.getDistanceTime = async (req,res,next) => {
    const errors=validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()})
    }
    const {origin,destination} = req.query
    try{
        const distanceTime = await mapService.getDistanceTime(origin,destination)
        console.log("API Response:", distanceTime); 
        res.status(200).json(distanceTime)
    }
    catch(e){
        res.status(404).json({message:`Distance/Time not found`})
    }
}

module.exports.getAutoCompleteSuggestions = async (req,res,next) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()})
    }

    const {input} = req.query
    try{
        const autocompleteSuggestions = await mapService.getAutoCompleteSuggestions(input)
        res.status(200).json(autocompleteSuggestions)
    }
    catch(e){
        res.status(404).json({message:`Suggestions not found`})
    }
}