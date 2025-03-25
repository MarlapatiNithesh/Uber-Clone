const axios = require("axios");

const getCoordinatesFromAddress = async (address) => {
  try {
    const apiKey = process.env.GOOGLE_MAPS_API; // Ensure this is set in .env
    if (!apiKey) throw new Error("Missing GOOGLE_MAPS_API key in .env");

    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;
    
    const response = await axios.get(url);
    const data = response.data;

    if (data.status === "OK") {
      const location = data.results[0].geometry.location;
      return { lat: location.lat, lng: location.lng };
    } else {
      throw new Error(`Geocoding error: ${data.status}`);
    }
  } catch (error) {
    console.error("Error fetching coordinates:", error.message);
    throw error;
  }
};

const getDistanceTime = async (origin, destination) => {
  try {
    const apiKey = process.env.GOOGLE_MAPS_API;
    if (!apiKey) throw new Error("Missing GOOGLE_MAPS_API key in .env");

    if (!origin || !destination) {
      throw new Error("Origin and destination are required");
    }

    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(origin)}&destinations=${encodeURIComponent(destination)}&key=${apiKey}`;
    
    const response = await axios.get(url);
    const data = response.data;
    
    console.log("Google Maps API Response:", JSON.stringify(data, null, 2)); // Debugging

    if (data.status === "OK") {
        if(data.rows[0].elements[0].status==='ZERO_RESULTS'){
            throw new Error('No route found between the two points');
        }
        return data.rows[0].elements[0];
    } else {
      throw new Error(`Distance matrix error: ${data.status}`);
    }
  } catch (error) {
    console.error("Error fetching distance/time:", error.message);
    throw error;
  }
};

const getAutoCompleteSuggestions = async(input) => {
  if(!input){
    throw new Error('query is required');
  }
  const apiKey=process.env.GOOGLE_MAPS_API;
  const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&key=${apiKey}`;

  try{
    const response = await axios.get(url);
    const data=response.data;
    if(data.status==='OK'){
      return data.predictions;
    }
    else{
        throw new Error(`AutoComplete error: ${data.status}`);
    }
  }
  catch(e){
    console.error(e)
    throw e;
  }

}

// ✅ Export both functions properly
module.exports = {
  getCoordinatesFromAddress,
  getDistanceTime,
  getAutoCompleteSuggestions,
};
