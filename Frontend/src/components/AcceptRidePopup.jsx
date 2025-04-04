import axios from "axios";
import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const AcceptRidePopup = (props) => {
  const [otp, setOtp] = useState(["", "", "", "","",""]); 
  const [error, setError] = useState("");
  const inputRefs = useRef([]);
  const navigate = useNavigate();

  // ✅ Handles digit input & auto-focus
  const handleChange = (index, e) => {
    const value = e.target.value;
    if (!/^[0-9]?$/.test(value)) return; // Only allow numbers

    let newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value !== "" && index < 5) {
      inputRefs.current[index + 1].focus(); // Move to next input
    }
  };

  // ✅ Handles backspace key navigation
  const handleBackspace = (index, e) => {
    if (e.key === "Backspace" && otp[index] === "" && index > 0) {
      inputRefs.current[index - 1].focus(); 
    }
  };


  const submitHandler = async (e) => {
    e.preventDefault();
  
    if (otp.includes("") || otp.length < 6) {
      setError("Please enter a 6-digit OTP");
      return;
    }
  
    setError("");
    props.setAcceptRidePopupPanel(false);
  
    const token = localStorage.getItem("token");
    const otpString = otp.join("");

    console.log(`ride id : ${props.ride._id}`);
  
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/rides/start-ride`,
        {
          params: {
            rideId: props.ride?._id,
            otp: otpString,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      console.log("Ride started:", response.data);
      props.setAcceptRidePopupPanel(false);
      props.setRidePopupPanel(false);
      localStorage.setItem("rideData", JSON.stringify(response.data));
      navigate("/captain-rideing", { state: { ride: response.data } });

    } catch (error) {
      console.error("Error starting ride:", error.response?.data || error.message);
      setError(error.response?.data?.message || "Failed to start the ride. Try again.");
    }
  };
  

  return (
    <div>
      <h5
        onClick={() => props.setAcceptRidePopupPanel(false)}
        className="p-1 w-[93%] text-center absolute top-0"
      >
        <i className="text-3xl text-gray-200 ri-arrow-down-wide-line"></i>
      </h5>
      <h3 className="text-2xl font-semibold text-center mb-5">Confirm this ride to Start</h3>

      {/* Ride Details */}
      <div className="flex items-center justify-between p-3 bg-yellow-400 rounded-lg mt-4">
        <div className="flex items-center gap-4">
          <img
            className="h-12 w-12 rounded-full object-cover"
            src="https://i.pinimg.com/474x/03/18/c0/0318c096dd8382a1aadb05196f491d20.jpg"
            alt="User"
          />
          <h2 className="text-xl font-semibold">{props.ride?.user?.fullname?.firstname+" "+props.ride?.user?.fullname?.lastname}</h2>
        </div>
        <h5 className="text-sm font-semibold">2.2KM</h5>
      </div>

      {/* Address & Fare Details */}
      <div className="w-full mt-5">
        <div className="flex items-center gap-5 p-3 border-b-2">
          <i className="text-lg ri-map-pin-user-fill"></i>
          <div>
            <p className="text-sm -mt-1 text-gray-600">{props.ride?.pickup}</p>
          </div>
        </div>
        <div className="flex items-center gap-5 p-3 border-b-2">
          <i className="text-lg ri-map-pin-2-fill"></i>
          <div>
            <p className="text-sm -mt-1 text-gray-600">{props.ride?.destination}</p>
          </div>
        </div>
        <div className="flex items-center gap-5 p-3">
          <i className="text-lg ri-currency-line"></i>
          <div>
            <h3 className="text-xl font-medium">₹{Math.floor(props.ride?.fare)}</h3>
            <p className="text-sm -mt-1 text-gray-600">Cash</p>
          </div>
        </div>
      </div>

      {/* OTP Input Section */}
      <div className="w-full mt-5 flex flex-col items-center">
        <form onSubmit={submitHandler} className="w-full px-5 flex flex-col items-center">
          <div className="flex gap-3 py-8">
            {otp.map((digit, index) => (
              <input
                key={index}
                type="text"
                maxLength="1"
                value={digit}
                onChange={(e) => handleChange(index, e)}
                onKeyDown={(e) => handleBackspace(index, e)}
                ref={(el) => (inputRefs.current[index] = el)}
                className="w-12 h-12 text-center text-2xl font-mono border-2 border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
              />
            ))}
          </div>

          {/* Show error message */}
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

          {/* Buttons inside the form */}
          <div className="flex items-center justify-between p-5 w-full fixed bottom-0 bg-white shadow-lg">
            <button
              type="button"
              onClick={() => props.setAcceptRidePopupPanel(false)}
              className="bg-red-600 text-white font-semibold py-3 px-10 rounded-lg"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="bg-green-600 text-white font-semibold py-3 px-10 rounded-lg"
            >
              Confirm
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AcceptRidePopup;
