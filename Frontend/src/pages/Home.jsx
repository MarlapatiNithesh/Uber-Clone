import React, { useRef, useState, useEffect, useContext } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import "remixicon/fonts/remixicon.css";
import LocationSearchPanel from "../components/LocationSearchPanel";
import VehiclePanel from "../components/VehiclePanel";
import ConfirmRide from "../components/ConfirmRide";
import LookingForDriver from "../components/LookingForDriver";
import WaitingForDriver from "../components/WaitingForDriver";
import axios from "axios";
import { SocketDataContext } from "../context/SocketContext";
import { UserDataContext } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import LiveTracking from "../components/LiveTracking";

const Home = () => {
  const [pickUp, setPickUp] = useState("");
  const [destination, setDestination] = useState("");
  const [panelOpen, setPanelOpen] = useState(false);
  const [vehiclePanel, setVehiclePanel] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [vehicleFound, setVehicleFound] = useState(false);
  const [waitingForDriver, setWaitingForDriver] = useState(false);
  const [activeField, setActiveField] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [fare, setFare] = useState({});
  const [vehicletype, setVehicletype] = useState(null);
  const [rideData,setRideData]=useState(null);

  const panelRef = useRef(null);
  const panelClose = useRef(null);
  const vehiclePanelRef = useRef(null);
  const confirmRidePanelRef = useRef(null);
  const vehicleFoundRef = useRef(null);
  const waitingForDriverRef = useRef(null);

  const navigate = useNavigate()

  const { sendMessage, receiveMessage } = useContext(SocketDataContext);
  const { user } = useContext(UserDataContext);

  useEffect(() => {
    if (user && user._id) {
      sendMessage("join", { userType: "user", userId: user._id });
    }
  }, [user]);

  useEffect(() => {
    receiveMessage("ride-confirmed", (data) => {
      setWaitingForDriver(true);
      setVehicleFound(false)
      console.log("New confirm ride data:", data);
      setRideData(data)
    });

    receiveMessage("ride-started", (ride) => {
      try {
        if (!ride) {
          console.error("Ride data is missing.");
          return;
        }
    
        setWaitingForDriver(false);
        console.log(`Ride has started:`, ride);
        localStorage.setItem("userData", JSON.stringify(ride));
        navigate("/riding", { state: { user: ride } });
      } catch (error) {
        console.error("Error handling ride-started event:", error);
      }
    });
    
  }, [receiveMessage,navigate]);

  const fetchSuggestion = async (query) => {
    if (!query) {
      setSuggestions([]);
      return;
    }

    const token = localStorage.getItem("token");

    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/maps/get-suggestions`,
        {
          params: { input: query },
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data && Array.isArray(response.data)) {
        setSuggestions(response.data.map((item) => item.description));
      } else {
        setSuggestions([]);
      }
    } catch (error) {
      console.error(
        "Error fetching suggestions:",
        error.response?.data || error.message
      );
      setSuggestions([]);
    }
  };

  const handlerFare = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/rides/get-fare`,
        {
          params: {
            pickup: pickUp,
            destination: destination,
          },
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setFare(response.data);
      setPanelOpen(false);
      setVehiclePanel(true);
    } catch (e) {
      console.error("Error fetching fare: ", e.message);
    }
  };

  async function createRide() {
    const token = localStorage.getItem("token");

    if (!token) {
      console.error("Error: No token found! Please log in.");
      return;
    }

    if (!pickUp || !destination || !vehicletype) {
      console.error("Error: Missing required fields", {
        pickUp,
        destination,
        vehicletype,
      });
      return;
    }

    console.log("Creating ride with:", {
      pickup: pickUp,
      destination,
      vehicleType: vehicletype,
    });

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/rides/create`,
        {
          pickup: pickUp,
          destination: destination,
          vehicleType: vehicletype,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("Ride created successfully:", response.data);
    } catch (e) {
      console.error("Error creating ride:", e.response?.data || e.message);
      if (e.response?.data?.errors) {
        e.response.data.errors.forEach((err) => console.error(err));
      }
    }
  }

  const submitHandler = (e) => {
    e.preventDefault();
  };

  useEffect(() => {
    if (activeField === "pickup") {
      fetchSuggestion(pickUp);
    } else if (activeField === "destination") {
      fetchSuggestion(destination);
    }
  }, [pickUp, destination, activeField]);

  useGSAP(() => {
    if (panelOpen) {
      gsap.to(panelRef.current, { height: "70%", padding: 24 });
      gsap.to(panelClose.current, { opacity: 1 });
    } else {
      gsap.to(panelRef.current, { height: "0%", padding: 0 });
      gsap.to(panelClose.current, { opacity: 0 });
    }
  }, [panelOpen]);

  useGSAP(
    function () {
      if (vehiclePanel) {
        gsap.to(vehiclePanelRef.current, {
          y: 0,
          autoAlpha: 1,
          duration: 0.3,
        });
      } else {
        gsap.to(vehiclePanelRef.current, {
          y: "100%",
          autoAlpha: 0,
          duration: 0.3,
        });
      }
    },
    [vehiclePanel]
  );

  useGSAP(
    function () {
      if (confirm) {
        gsap.to(confirmRidePanelRef.current, {
          y: 0,
          autoAlpha: 1,
          duration: 0.3,
        });
      } else {
        gsap.to(confirmRidePanelRef.current, {
          y: "100%",
          autoAlpha: 0,
          duration: 0.3,
        });
      }
    },
    [confirm]
  );

  useGSAP(() => {
    if (vehicleFound) {
      gsap.to(vehicleFoundRef.current, {
        y: 0,
        autoAlpha: 1,
        duration: 0.3,
      });
    } else {
      gsap.to(vehicleFoundRef.current, {
        y: "100%",
        autoAlpha: 0,
        duration: 0.3,
      });
    }
  }, [vehicleFound]);

  useGSAP(
    function () {
      if (waitingForDriver) {
        gsap.to(waitingForDriverRef.current, {
          y: 0,
          autoAlpha: 1,
          duration: 0.3,
        });
      } else {
        gsap.to(waitingForDriverRef.current, {
          y: "100%",
          autoAlpha: 0,
          duration: 0.3,
        });
      }
    },
    [waitingForDriver]
  );

  return (
    <div className="h-screen relative overflow-hidden">
      {/* Uber Logo */}

      <img
        className="w-14 absolute left-5 top-5"
        src="https://in.pinterest.com/pin/1548181158815462/"
        alt=""
      ></img>

      {/* Fullscreen Background Image */}
      <div className="fixed inset-0">
        <LiveTracking/>
      </div>

      {/* Bottom Panel */}
      <div className="h-screen flex flex-col justify-end absolute top-0 w-full overflow-hidden">
        <div className="min-h-[20%] p-4 bg-white relative">
          {/* Close Button for Panel */}
          <h5
            ref={panelClose}
            onClick={() => setPanelOpen(false)}
            className="absolute opacity-0 right-6 top-6 text-2xl cursor-pointer transition-opacity"
          >
            <i className="ri-arrow-down-wide-line"></i>
          </h5>

          {/* Title */}
          <h4 className="text-2xl font-semibold text-center mb-3">
            Find a trip
          </h4>
          <form onSubmit={submitHandler} className="flex flex-col space-y-3">
            {/* Pickup Input */}
            <input
              onClick={() => {
                setPanelOpen(true);
                setActiveField("pickup");
              }}
              value={pickUp}
              onChange={(e) => setPickUp(e.target.value)}
              className="bg-gray-100 px-4 py-3 rounded-lg w-full text-lg focus:ring-2 focus:ring-gray-500 border border-gray-300 focus:outline-none border-none"
              type="text"
              placeholder="Add a pick-up location"
            />

            {/* Destination Input */}
            <input
              onClick={() => {
                setPanelOpen(true);
                setActiveField("destination");
              }}
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="bg-gray-100 px-4 py-3 rounded-lg w-full text-lg focus:ring-2 focus:ring-gray-500 border border-gray-300 focus:outline-none border-none"
              type="text"
              placeholder="Enter your destination"
            />

            {/* Find Trip Button */}
            <button
              onClick={handlerFare}
              className="bg-black text-white text-lg py-3 rounded-lg w-full transition-all duration-300 hover:bg-gray-900 active:scale-95 shadow-md"
            >
              Find Trip
            </button>
          </form>
        </div>

        {/* Expandable Panel for Location Search */}
        <div ref={panelRef} className="bg-white h-0 overflow-auto py-4">
          <LocationSearchPanel
            setPanelOpen={setPanelOpen}
            suggestions={suggestions}
            setSuggestions={setSuggestions}
            setPickUp={setPickUp}
            setDestination={setDestination}
            activeField={activeField}
          />
        </div>

        {/* Ride Details Section */}
        <div
          ref={vehiclePanelRef}
          className="fixed bottom-0 bg-white w-full translate-y-full px-3 py-10 pt-12"
        >
          <VehiclePanel
            setConfirm={setConfirm}
            setVehiclePanel={setVehiclePanel}
            setPanelOpen={setPanelOpen}
            setVehicletype={setVehicletype}
            fare={fare}
          />
        </div>
        <div
          ref={confirmRidePanelRef}
          className="fixed bottom-0 bg-white w-full translate-y-full px-3 py-6 pt-12"
        >
          <ConfirmRide
            setConfirm={setConfirm}
            setVehiclePanel={setVehiclePanel}
            pickUp={pickUp}
            destination={destination}
            fare={fare}
            vehicletype={vehicletype}
            createRide={createRide}
            setVehicleFound={setVehicleFound}
          />
        </div>
        <div
          ref={vehicleFoundRef}
          className="fixed bottom-0 bg-white w-full translate-y-full px-3 py-6 pt-12 invisible"
        >
          <LookingForDriver
            setVehicleFound={setVehicleFound}
            pickUp={pickUp}
            destination={destination}
            fare={fare}
            vehicletype={vehicletype}
            createRide={createRide}
          />
        </div>
        <div
          ref={waitingForDriverRef}
          className="fixed bottom-0 translate-y-full bg-white w-full px-3 py-6 pt-12"
        >
          <WaitingForDriver rideData={rideData}/>
        </div>
      </div>
    </div>
  );
};

export default Home;
