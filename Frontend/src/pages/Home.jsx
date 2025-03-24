import React, { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import "remixicon/fonts/remixicon.css";
import LocationSearchPanel from "../components/LocationSearchPanel";
import VehiclePanel from "../components/VehiclePanel";
import ConfirmRide from "../components/ConfirmRide";
import LookingForDriver from "../components/LookingForDriver";
import WaitingForDriver from "../components/WaitingForDriver";

const Home = () => {
  const [pickUp, setPickUp] = useState("");
  const [destination, setDestination] = useState("");
  const [panelOpen, setPanelOpen] = useState(false);
  const [vehiclePanel,setVehiclePanel]=useState(false)
  const [confirm,setConfirm]=useState(false)
  const [vehicleFound,setVehicleFound] = useState(false)
  const [waitingForDriver,setWaitingForDriver]=useState(false)

  const panelRef = useRef(null);
  const panelClose = useRef(null);
  const vehiclePanelRef = useRef(null);
  const confirmRidePanelRef = useRef(null)
  const vehicleFoundRef = useRef(null)
  const waitingForDriverRef=useRef(null)

  const submitHandler = (e) => {
    e.preventDefault();
  };

  useGSAP(() => {
    if (panelOpen) {
      gsap.to(panelRef.current, { height: "70%", padding: 24 });
      gsap.to(panelClose.current, { opacity: 1 });
    } else {
      gsap.to(panelRef.current, { height: "0%", padding: 0 });
      gsap.to(panelClose.current, { opacity: 0 });
    }
  }, [panelOpen]);

  useGSAP(function(){
    if(vehiclePanel){
      gsap.to(vehiclePanelRef.current,{
        transform:'translateY(0)'
      })
    }
    else{
      gsap.to(vehiclePanelRef.current,{
        transform:'translateY(100%)'
      })
    }
  },[vehiclePanel])

  useGSAP(function(){
    if(confirm){
      gsap.to(confirmRidePanelRef.current,{
        transform:'translateY(0)'
      })
    }
    else{
      gsap.to(confirmRidePanelRef.current,{
        transform:'translateY(100%)'
      })
    }
  },[confirm])

  useGSAP(function(){
    if(vehicleFound){
      gsap.to(vehicleFoundRef.current,{
        transform:'translateY(0)'
      })
    }
    else{
      gsap.to(vehicleFoundRef.current,{
        transform:'translateY(100%)'
      })
    }
  },[vehicleFound])

  useGSAP(function(){
    if(waitingForDriver){
      gsap.to(waitingForDriverRef.current,{
        transform:'translateY(0)'
      })
    }
    else{
      gsap.to(waitingForDriverRef.current,{
        transform:'translateY(100%)'
      })
    }
  },[waitingForDriver])

  return (
    <div className="h-screen relative overflow-hidden">
      {/* Uber Logo */}

      <img className="w-14 absolute left-5 top-5" src="/Image/uber_log.png" alt=""></img>

      {/* Fullscreen Background Image */}
      <div className="fixed inset-0">
        <img
          className="h-full w-full object-cover"
          src="https://s.wsj.net/public/resources/images/BN-XR452_201802_M_20180228165525.gif"
          alt="Uber Background"
        />
      </div>

      {/* Bottom Panel */}
      <div className="h-screen flex flex-col justify-end absolute top-0 w-full">
        <div className="h-[30%] p-6 bg-white relative">
          {/* Close Button for Panel */}
          <h5
            ref={panelClose}
            onClick={() => setPanelOpen(false)}
            className="absolute opacity-0 right-6 top-6 text-2xl cursor-pointer transition-opacity"
          >
            <i className="ri-arrow-down-wide-line"></i>
          </h5>

          {/* Title */}
          <h4 className="text-2xl font-semibold">Find a trip</h4>

          {/* Form */}
          <form onSubmit={submitHandler}>
            <div className="absolute h-16 w-1 top-[45%] left-10 bg-gray-900 rounded-full"></div>

            {/* Pickup Input */}
            <input
              onClick={() => setPanelOpen(true)}
              value={pickUp}
              onChange={(e) => setPickUp(e.target.value)}
              className="bg-[#eeeeee] px-12 py-2 rounded-lg w-full mt-5 text-lg placeholder:text-base focus:ring-2 focus:ring-gray-500"
              type="text"
              placeholder="Add a pick-up location"
            />

            {/* Destination Input */}
            <input
              onClick={() => setPanelOpen(true)}
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="bg-[#eeeeee] px-12 py-2 rounded-lg w-full mt-3 text-lg placeholder:text-base focus:ring-2 focus:ring-gray-500"
              type="text"
              placeholder="Enter your destination"
            />
          </form>
        </div>

        {/* Expandable Panel for Location Search */}
        <div ref={panelRef} className="bg-white h-0 overflow-hidden">
          <LocationSearchPanel setPanelOpen={setPanelOpen} vehiclePanel={vehiclePanel} setVehiclePanel={setVehiclePanel} />
        </div>

        {/* Ride Details Section */}
        <div ref={vehiclePanelRef} className="fixed z-10 bottom-0 bg-white w-full translate-y-full px-3 py-10 pt-12">
          <VehiclePanel setConfirm={setConfirm} setVehiclePanel={setVehiclePanel}/>
        </div>
        <div ref={confirmRidePanelRef} className="fixed z-10 bottom-0 bg-white w-full translate-y-full px-3 py-6 pt-12">
          <ConfirmRide setConfirm={setConfirm} setVehicleFound={setVehicleFound}/>
        </div>
        <div ref={vehicleFoundRef} className="fixed z-10 bottom-0 bg-white w-full translate-y-full px-3 py-6 pt-12">
          <LookingForDriver setVehicleFound={setVehicleFound}/>
        </div>
        <div ref={waitingForDriverRef} className="fixed z-10 bottom-0 bg-white w-full px-3 py-6 pt-12">
          <WaitingForDriver waitingForDriver={waitingForDriver}/>
        </div>
      </div>
    </div>
  );
};

export default Home;
