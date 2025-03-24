import React from "react";

const WaitingForDriver = ({ waitingForDriver }) => {
  return (
    <div>
      {/* Close Button */}
      <h5 onClick={() => waitingForDriver(false)}
        className="p-1 w-[93%] text-center absolute top-0"
      >
        <i className="text-3xl text-gray-200 ri-arrow-down-wide-line"></i>
      </h5>

      {/* Driver Info */}
      <div className="flex items-center justify-between">
        <img
          className="h-10"
          src="https://www.pngplay.com/wp-content/uploads/8/Uber-PNG-Photos.png"
          alt="Uber Vehicle"
        />
        <div className="text-right">
          <h2 className="text-lg font-medium">Nitheesh</h2>
          <h4 className="text-xl font-semibold -mt-1 -mb-1">Mp04 AB 1234</h4>
          <p className="text-sm text-gray-600">Maruti Suzuki Auto</p>
        </div>
      </div>

      {/* Ride Details */}
      <div className="flex flex-col gap-2 justify-between items-center">
        <div className="w-full mt-5">
          {/* Pickup Location */}
          <div className="flex items-center gap-5 p-3 border-b-2">
            <i className="text-lg ri-map-pin-user-fill"></i>
            <div>
              <h3 className="text-xl font-medium">562/11-A</h3>
              <p className="text-sm -mt-1 text-gray-600">
                Kankariya Talab, Bhopal
              </p>
            </div>
          </div>

          {/* Destination */}
          <div className="flex items-center gap-5 p-3 border-b-2">
            <i className="text-lg ri-map-pin-2-fill"></i>
            <div>
              <h3 className="text-xl font-medium">562/11-A</h3>
              <p className="text-sm -mt-1 text-gray-600">
                Kankariya Talab, Bhopal
              </p>
            </div>
          </div>

          {/* Payment Details */}
          <div className="flex items-center gap-5 p-3">
            <i className="text-lg ri-currency-line"></i>
            <div>
              <h3 className="text-xl font-medium">₹193.50</h3>
              <p className="text-sm -mt-1 text-gray-600">Cash</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WaitingForDriver;
