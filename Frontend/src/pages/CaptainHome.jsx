import React, { useRef, useState } from "react";
import { Link } from "react-router-dom";
import CaptainDetails from "../components/CaptainDetails";
import RidePopup from "../components/RidePopup";
import {useGSAP} from "@gsap/react"
import gsap from "gsap";
import AcceptRidePopup from "../components/AcceptRidePopup";

const CaptainHome = () => {
  const [ridePopupPanel,setRidePopupPanel]=useState(true)
  const [acceptRidePopupPanel,setAcceptRidePopupPanel]=useState(false)

  const ridePopupPanelRef=useRef(null)
  const acceptRidePopupPanelRef=useRef(null)


  useGSAP(function(){
    if(ridePopupPanel){
      gsap.to(ridePopupPanelRef.current,{
        transform:'translateY(0)'
      })
    }
    else{
      gsap.to(ridePopupPanelRef.current,{
        transform:'translateY(100%)',
      })
    }
  },[ridePopupPanel])


  useGSAP(function(){
    if(acceptRidePopupPanel){
      gsap.to(acceptRidePopupPanelRef.current,{
        transform:'translateY(0)'
      })
    }
    else{
      gsap.to(acceptRidePopupPanelRef.current,{
        transform:'translateY(100%)',
        })
    }
  },[acceptRidePopupPanel])


  return (
    <div className="h-screen">
      <div className="fixed p-6 top-0 flex items-center justify-between w-full">
        <img className="w-16" src="/Image/uber_log.png"></img>
        <Link
          to="/captain-home"
          className="h-10 w-10 bg-white flex items-center justify-center rounded-full"
        >
          <i className="text-lg font-medium ri-logout-box-r-line"></i>
        </Link>
      </div>
      <div className="h-3/5">
        <img
          className="h-full w-full object-cover"
          src="https://s.wsj.net/public/resources/images/BN-XR452_201802_M_20180228165525.gif"
          alt=""
        ></img>
      </div>
      <div className="h-2/5 p-6">
        <CaptainDetails />
      </div>
      <div ref={ridePopupPanelRef} className="fixed z-10 bottom-0 bg-white w-full translate-y-full px-3 py-10 pt-12">
        <RidePopup setRidePopupPanel={setRidePopupPanel} setAcceptRidePopupPanel={setAcceptRidePopupPanel}/>
      </div>
      <div ref={acceptRidePopupPanelRef} className="h-screen fixed z-10 bottom-0 bg-white w-full translate-y-full px-3 py-10 pt-12">
        <AcceptRidePopup setAcceptRidePopupPanel={setAcceptRidePopupPanel}/>
      </div>
    </div>
  );
};

export default CaptainHome;
