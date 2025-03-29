import React from "react";

const RidePopup = (props) => {
  return (
    <div>

      <h3 className="text-2xl text-center font-semibold mb-5">New Ride Available!</h3>
      <div className="flex items-center justify-between p-3 bg-yellow-400 rounded-lg mt-4">
        <div className="flex items-center justify-start gap-4">
          <img
            className="h-12 w-12 rounded-full object-cover"
            src="https://i.pinimg.com/474x/03/18/c0/0318c096dd8382a1aadb05196f491d20.jpg"
            alt=""
          ></img>
          <h2 className="text-xl font-semibold">{props.ride?.user.fullname.firstname+" "+props.ride?.user.fullname.lastname}</h2>
        </div>
        <h5 className="text-sm font-semibold">2.2KM</h5>
      </div>
      <div className="flex flex-col gap-2 justify-between items-center">
        <div className="w-full mt-5">
          <div className="flex items-center gap-5 p-3 border-b-2">
            <i className="text-lg ri-map-pin-user-fill"></i>
            <div>
              <p className="text-lg -mt-1 text-gray-600">
                {props.ride?.pickup}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-5 p-3 border-b-2">
            <i className="text-lg ri-map-pin-2-fill"></i>
            <div>
              <p className="text-lg -mt-1 text-gray-600">
                {props.ride?.destination}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-5 p-3">
            <i className="text-lg ri-currency-line"></i>
            <div>
              <h3 className="text-xl font-medium"> ₹{Math.floor(props.ride?.fare)}</h3>
              <p className="text-lg -mt-1 text-gray-600">Cash</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between w-full mt-5">
          <button
            onClick={() => {
              props.setRidePopupPanel(false);
            }}
            className=" bg-gray-300 text-gray-700 font-semibold p-3 px-10 rounded-lg"
          >
            Ignore
          </button>
          <button
            onClick={() => {
              props.setAcceptRidePopupPanel(true);
              props.setRidePopupPanel(false);
              props.confirmRide(props.ride)
            }}
            className=" bg-green-600 text-white font-semibold p-3 px-10 rounded-lg"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
};

export default RidePopup;
