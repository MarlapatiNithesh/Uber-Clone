import React from "react";
import { Link } from "react-router-dom";

const Riding = () => {
  return (
    <div className="h-screen">
        <Link to="/home" className="fixed right-2 top-2 h-10 w-10 bg-white flex items-center justify-center rounded-full">
            <i className="text-lg font-medium ri-home-5-line"></i>
        </Link>
      <div className="h-1/2">
        <img
          className="h-full w-full object-cover"
          src="https://s.wsj.net/public/resources/images/BN-XR452_201802_M_20180228165525.gif"
          alt=""
        ></img>
      </div>
      <div className="h-1/2 p-4">
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
        <button className="w-full mt-5 bg-green-600 text-white font-semibold p-2 rounded-xl">Make a payment</button>
      </div>
    </div>
  );
};

export default Riding;
