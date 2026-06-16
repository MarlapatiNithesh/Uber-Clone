import React, { useContext, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { SocketDataContext } from "../context/SocketContext";
import LiveTracking from "../components/LiveTracking";

const Riding = () => {
  const vehicleImages = {
    car: import.meta.env.VITE_CAR,
    moto: import.meta.env.VITE_MOTO,
    auto: import.meta.env.VITE_AUTO,
  };
  const location = useLocation();
  const userData =
    location.state?.user || JSON.parse(localStorage.getItem("userData"));
  console.log("User Data is:", JSON.stringify(userData, null, 2));

  const { receiveMessage } = useContext(SocketDataContext);
  const navigate = useNavigate();

  useEffect(() => {
    const handleRideEnd = () => navigate("/home");
    receiveMessage("ride-ended", handleRideEnd);
    return () => receiveMessage("ride-ended", handleRideEnd);
  }, [receiveMessage, navigate]);

  return (
    <div className="h-screen flex flex-col justify-end">
      <Link
        to="/home"
        className="fixed right-2 top-2 h-10 w-10 bg-white flex items-center justify-center rounded-full"
      >
        <i className="text-lg font-medium ri-home-5-line"></i>
      </Link>
      
      <div className="min-h-[30%] p-4 bg-white">
        {/* Driver Info */}
        <div className="flex items-center justify-between">
          <img
            className="h-10"
            src={vehicleImages[userData.captain?.vehicle?.vehicleType]}
            alt="Uber Vehicle"
          />
          <div className="text-right">
            <h2 className="text-lg font-medium">
              {userData.captain?.fullname?.firstname +
                " " +
                userData.captain?.fullname?.lastname}
            </h2>
            <h4 className="text-xl font-semibold -mt-1 -mb-1">
              {userData.captain?.vehicle?.plate}
            </h4>
          </div>
        </div>

        {/* Ride Details */}
        <div className="flex flex-col gap-2 justify-between items-center">
          <div className="w-full mt-5">
            {/* Destination */}
            <div className="flex items-center gap-5 p-3 border-b-2">
              <i className="text-lg ri-map-pin-2-fill"></i>
              <div>
                <p className="text-lg -mt-1 text-gray-600">
                  {userData.destination}
                </p>
              </div>
            </div>

            {/* Payment Details */}
            <div className="flex items-center gap-5 p-3">
              <i className="text-lg ri-currency-line"></i>
              <div>
                <h3 className="text-xl font-medium">
                  ₹{Math.floor(userData.fare)}
                </h3>
                <p className="text-sm -mt-1 text-gray-600">Cash</p>
              </div>
            </div>
          </div>
        </div>
        <button className="w-full mt-5 bg-green-600 text-white font-semibold p-2 rounded-xl">
          Make a payment
        </button>
      </div>
      <div className="h-screen w-screen fixed top-0 z-[-1]">
        <LiveTracking />
      </div>
    </div>
  );
};

export default Riding;
