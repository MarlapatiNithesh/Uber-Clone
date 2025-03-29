import React, { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Link, useLocation } from "react-router-dom";
import FinishRide from "../components/FinishRide";
import LiveTracking from "../components/LiveTracking";

const CaptainRideing = () => {
  const [finishRidePanel, setFinishRidePanel] = useState(false);
  const location = useLocation()
  const rideData =
    location.state?.ride || JSON.parse(localStorage.getItem("rideData"));
  console.log("Received rideData:", JSON.stringify(rideData, null, 2));

  const finishRidePanelRef = useRef(null);
  useGSAP(
    function () {
      if (finishRidePanel) {
        gsap.to(finishRidePanelRef.current, {
          transform: "translateY(0)",
        });
      } else {
        gsap.to(finishRidePanelRef.current, {
          transform: "translateY(100%)",
        });
      }
    },
    [finishRidePanel]
  );

  return (
    <div className="h-screen w-full overflow-hidden relative flex flex-col justify-end">
      <div className="max-h-[80%]">
      <LiveTracking/>
      </div>
      <div
        onClick={() => {
          setFinishRidePanel(true);
        }}
        className="h-1/5 flex items-center justify-between p-6 bg-yellow-400 relative"
      >
        <h5
          onClick={() => {}}
          className="p-1 w-[95%] text-center absolute top-0"
        >
          <i className="text-3xl text-black ri-arrow-up-wide-line"></i>
        </h5>
        <h1 className="text-xl font-semibold">4 KM away</h1>
        <button className="bg-green-600 text-white font-semibold py-3 px-10 rounded-lg">
          complete Ride
        </button>
      </div>
      <div ref={finishRidePanelRef} className="h-screen fixed z-10 bottom-0 bg-white w-full translate-y-full px-3 py-10 pt-12">
        <FinishRide rideData={rideData} setFinishRidePanel={setFinishRidePanel}/>
      </div>

      <div className="absolute p-6 top-0 flex items-center justify-between w-full">
        <img className="w-16" src="/Image/uber_log.png"></img>
        <Link
          to="/captain-home"
          className="h-10 w-10 bg-white flex items-center justify-center rounded-full"
        >
          <i className="text-lg font-medium ri-logout-box-r-line"></i>
        </Link>
      </div>
    </div>
  );
};

export default CaptainRideing;




