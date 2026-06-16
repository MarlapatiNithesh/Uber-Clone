import React from "react";

const LookingForDriver = ({ setVehicleFound, vehicletype, pickUp, destination, fare }) => {
  const vehicleImages = {
    car: import.meta.env.VITE_CAR,
    moto: import.meta.env.VITE_MOTO,
    auto: import.meta.env.VITE_AUTO,
  };

  return (
    <div>
      <h5
        onClick={() => setVehicleFound(false)}
        className="p-1 w-[93%] text-center absolute top-0"
      >
        <i className="text-3xl text-gray-200 ri-arrow-down-wide-line"></i>
      </h5>

      <h3 className="text-2xl text-center font-semibold mb-5">Looking for a Driver</h3>

      <div className="flex flex-col gap-2 justify-between items-center">
        <img className="h-20" src={vehicleImages[vehicletype]} alt={`${vehicletype} image`} />

        <div className="w-full mt-5">
          <div className="flex items-center gap-5 p-3 border-b-2">
            <i className="text-lg ri-map-pin-user-fill"></i>
            <div>
              <p className="text-lg -mt-1 text-gray-600">{pickUp}</p>
            </div>
          </div>

          <div className="flex items-center gap-5 p-3 border-b-2">
            <i className="text-lg ri-map-pin-2-fill"></i>
            <div>
              <p className="text-lg -mt-1 text-gray-600">{destination}</p>
            </div>
          </div>

          <div className="flex items-center gap-5 p-3">
            <i className="text-lg ri-currency-line"></i>
            <div>
              <h3 className="text-xl font-medium">₹{Math.floor(fare[vehicletype])}</h3>
              <p className="text-lg -mt-1 text-gray-600">Cash</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LookingForDriver;
