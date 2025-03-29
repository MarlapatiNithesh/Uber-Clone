import React from "react";
import { useNavigate } from "react-router-dom";

const WaitingForDriver = (props) => {
  const navigate=useNavigate()
  const vehicleImages = {
    car: import.meta.env.VITE_CAR,
    moto: import.meta.env.VITE_MOTO,
    auto: import.meta.env.VITE_AUTO,
  };
  return (
    <div>
      {/* Close Button */}
      <h5 onClick={() => navigate('/home')}
        className="p-1 w-[93%] text-center absolute top-0"
      >
        <i className="text-3xl text-gray-200 ri-arrow-down-wide-line"></i>
      </h5>

      {/* Driver Info */}
      <div className="flex items-center justify-between">
        <img
          className="h-10"
          src={vehicleImages[props.rideData?.captain?.vehicle?.vehicleType]}
          alt="Uber Vehicle"
        />
        <div className="text-right">
          <h2 className="text-lg font-medium capitalize">{props.rideData?.captain?.fullname?.firstname+" "+props.rideData?.captain?.fullname?.lastname}</h2>
          <h4 className="text-xl font-semibold mt-1 mb-2 capitalize">{props.rideData?.captain?.vehicle?.plate}</h4>
          <h1 className="text-xl font-semibold">{props.rideData?.otp}</h1>
        </div>
      </div>

      {/* Ride Details */}
      <div className="flex flex-col gap-2 justify-between items-center">
        <div className="w-full mt-5">
          {/* Pickup Location */}
          <div className="flex items-center gap-5 p-3 border-b-2">
            <i className="text-lg ri-map-pin-user-fill"></i>
            <div>
              <p className="text-lg -mt-1 text-gray-600 capitalize">
                {props.rideData?.pickup}
              </p>
            </div>
          </div>

          {/* Destination */}
          <div className="flex items-center gap-5 p-3 border-b-2">
            <i className="text-lg ri-map-pin-2-fill"></i>
            <div>
              <p className="text-lg -mt-1 text-gray-600 capitalize">
                {props.rideData?.destination}
              </p>
            </div>
          </div>

          {/* Payment Details */}
          <div className="flex items-center gap-5 p-3">
            <i className="text-lg ri-currency-line"></i>
            <div>
              <h3 className="text-xl font-medium">₹{Math.floor(props.rideData?.fare)}</h3>
              <p className="text-sm -mt-1 text-gray-600">Cash</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WaitingForDriver;
