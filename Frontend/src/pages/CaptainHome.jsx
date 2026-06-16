import React, { useRef, useState,useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import CaptainDetails from "../components/CaptainDetails";
import RidePopup from "../components/RidePopup";
import {useGSAP} from "@gsap/react"
import gsap from "gsap";
import AcceptRidePopup from "../components/AcceptRidePopup";
import { SocketDataContext } from "../context/SocketContext";
import { CaptainDataContext } from "../context/CaptainContext";
import axios from "axios";
import LiveTracking from "../components/LiveTracking";
import RideHistoryDashboard from "../components/RideHistoryDashboard";

const CaptainHome = () => {
  const [ridePopupPanel,setRidePopupPanel]=useState(false)
  const [acceptRidePopupPanel,setAcceptRidePopupPanel]=useState(false)
  const [historyOpen, setHistoryOpen] = useState(false);
  const [ride,setRide]=useState(null)

  const ridePopupPanelRef=useRef(null)
  const acceptRidePopupPanelRef=useRef(null)

  const {sendMessage,receiveMessage} = useContext(SocketDataContext);
    const {captain} = useContext(CaptainDataContext);

    console.log("captain deatiles",captain)

  useEffect(()=>{
    sendMessage("join",{
      userType:"captain",
      userId:captain._id
    })

    const updateLocation = () => {
      if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition(position => {
          sendMessage("update-location-captain",{
            userId:captain._id,
            location:{
              lat:position.coords.latitude,
              lng:position.coords.longitude
            }
          })
        })
      }
    }

    const locationInterval = setInterval(updateLocation,10000)
    updateLocation()
    return () => {clearInterval(locationInterval)}
  },[captain])


  useEffect(() => {
    receiveMessage("new-ride", (data) => {
      console.log("New ride data:", data); 
      setRide(data)
      setRidePopupPanel(true)
    });

    receiveMessage("ride-taken", (data) => {
      console.log("Ride taken by other captain:", data);
      if (ride && (ride._id === data.rideId || ride.id === data.rideId)) {
        setRidePopupPanel(false);
        setAcceptRidePopupPanel(false);
        alert("This ride has already been accepted by another captain.");
      }
    });
  }, [receiveMessage, ride]);


  async function confirmRide(ride) {
    try {
      const token = localStorage.getItem("token");

      if (!token || !ride._id) {
        console.error("Error: Missing token or ride id");
        return false;
      }

      console.log(`ride is ${ride._id}`)
  
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/rides/confirm`,
        { rideId:ride._id,
          captainId:captain._id
         },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
  
      console.log("Ride confirmed successfully:", response.data);
      return true;
    } catch (error) {
      console.error("Error confirming ride:", error.response?.data || error.message);
      return false;
    }
  }
  
  



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
    <div className="h-screen relative flex flex-col justify-end">
      <div className="fixed p-6 top-0 flex items-center justify-between w-full z-30">
        <img className="w-16" src="/Image/uber_log.png"></img>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setHistoryOpen(true)}
            className="bg-white/90 hover:bg-gray-100 border border-gray-200 text-gray-800 flex items-center gap-2 px-4 py-2 rounded-full font-bold shadow-lg transition-all duration-300 active:scale-95 cursor-pointer backdrop-blur-sm"
          >
            <i className="ri-bar-chart-2-line text-lg"></i>
            <span>Dashboard</span>
          </button>
          <Link
            to="/captain-login"
            className="h-10 w-10 bg-white flex items-center justify-center rounded-full shadow-md hover:bg-gray-100 transition-colors"
          >
            <i className="text-lg font-medium ri-logout-box-r-line"></i>
          </Link>
        </div>
      </div>
      <div className="h-2/5 p-6 bg-white">
        <CaptainDetails />
      </div>
      <div ref={ridePopupPanelRef} className="fixed z-10 bottom-0 bg-white w-full translate-y-full px-3 py-10 pt-12">
        <RidePopup ride={ride} setRidePopupPanel={setRidePopupPanel} setAcceptRidePopupPanel={setAcceptRidePopupPanel} confirmRide={confirmRide}/>
      </div>
      <div ref={acceptRidePopupPanelRef} className="h-screen fixed z-10 bottom-0 bg-white w-full translate-y-full px-3 py-10 pt-12">
        <AcceptRidePopup ride={ride} setRidePopupPanel={setRidePopupPanel} setAcceptRidePopupPanel={setAcceptRidePopupPanel}/>
      </div>

      <div className="h-screen w-screen fixed top-0 z-[-1]">
        <LiveTracking/>
      </div>

      {historyOpen && (
        <RideHistoryDashboard isCaptain={true} onClose={() => setHistoryOpen(false)} />
      )}
    </div>
  );
};

export default CaptainHome;
