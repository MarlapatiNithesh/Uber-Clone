import React from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const FinishRide = (props) => {

  const navigate = useNavigate()

  const finishRide = async () => {
    const token = localStorage.getItem("token")

    try{
      const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/rides/end-ride`,{
        rideId: props.rideData._id
      },{
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      console.log("response api ride ended",response.data);
      navigate("/captain-home")
    }
    catch(e){
      console.log(e)
    }
  }

  return (
    <div className="w-full h-full bg-white rounded-t-2xl shadow-xl overflow-hidden fixed bottom-0 left-0">
      <h5 onClick={() => props.setFinishRidePanel(false)} className="p-3 w-full text-center cursor-pointer">
        <i className="text-3xl text-gray-500 ri-arrow-down-wide-line"></i>
      </h5>
      <h3 className="text-2xl font-semibold text-center mb-5">Finish this Ride</h3>
      <div className="flex items-center justify-between p-3 bg-yellow-400 rounded-lg mx-3 shadow-md">
        <div className="flex items-center gap-4">
          <img className="h-12 w-12 rounded-full object-cover" src="https://i.pinimg.com/474x/03/18/c0/0318c096dd8382a1aadb05196f491d20.jpg" alt="User" />
          <h2 className="text-xl font-semibold capitalize">{props.rideData?.captain?.fullname?.firstname+" "+props.rideData?.captain?.fullname?.lastname}
          </h2>
        </div>
        <h5 className="text-sm font-semibold">2.2KM</h5>
      </div>
      <div className="w-full mt-5">
        <div className="flex items-center gap-5 p-4 border-b">
          <i className="text-lg text-green-600 ri-map-pin-user-fill"></i>
          <div>
            <p className="text-lg text-gray-600 capitalize">{props.rideData?.pickup}</p>
          </div>
        </div>
        <div className="flex items-center gap-5 p-4 border-b">
          <i className="text-lg text-red-600 ri-map-pin-2-fill"></i>
          <div>
            <p className="text-lg text-gray-600 capitalize">{props.rideData?.destination}</p>
          </div>
        </div>
        <div className="flex items-center gap-5 p-4">
          <i className="text-lg text-yellow-600 ri-currency-line"></i>
          <div>
            <h3 className="text-xl font-medium">₹{Math.floor(props.rideData?.fare)}</h3>
            <p className="text-sm text-gray-600">Cash</p>
          </div>
        </div>
      </div>
      <div className="p-5 w-full bg-white fixed bottom-0 left-0 shadow-lg">
        <button onClick={finishRide} className="bg-green-600 text-white text-lg font-semibold py-3 px-10 rounded-lg w-full inline-block text-center">
          Finish Ride
        </button>
        <p className="text-red-500 text-sm mt-6 text-center">click on finish ride if you have completed the payment</p>
      </div>
    </div>
  );
};

export default FinishRide;
