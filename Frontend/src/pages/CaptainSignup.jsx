import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { CaptainDataContext } from "../context/CaptainContext";

const CaptainSignup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [vehicleColor, setVehicleColor] = useState("");
  const [vehiclePlate, setVehiclePlate] = useState("");
  const [vehicleCapacity, setVehicleCapacity] = useState("");
  const [vehicleType, setVehicleType] = useState("");
  const [error, setError] = useState(""); // For displaying errors

  const navigate = useNavigate();
  const { setCaptain } = useContext(CaptainDataContext);

  const handlerSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Clear previous errors

    const captainData = {
      fullname: {
        firstname: firstName,
        lastname: lastName,
      },
      email,
      password,
      vehicle: {
        color: vehicleColor,
        plate: vehiclePlate,
        capacity: vehicleCapacity,
        vehicleType,
      },
    };

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/captains/register`,
        captainData
      );

      if (response.status === 201) {
        const data = response.data;
        console.log("Signup successful:", data);

        setCaptain(data.captain);
        localStorage.setItem("token", data.token);
        navigate("/captain-home");

        // Clear form inputs on successful signup
        setEmail("");
        setFirstName("");
        setLastName("");
        setPassword("");
        setVehicleColor("");
        setVehiclePlate("");
        setVehicleCapacity("");
        setVehicleType("");
      }
    } catch (error) {
      console.error("Signup failed:", error.response?.data || error.message);
      setError(error.response?.data?.message || "Registration failed. Please try again.");
    }
  };

  return (
    <div className="py-3 px-3 h-screen flex flex-col justify-between">
      <div>
        <img className="w-14 mb-8" src="https://pngimg.com/d/uber_PNG24.png" alt="Uber Logo" />
        <form onSubmit={handlerSubmit}>
          <h3 className="text-lg font-medium mb-2">What's our Captain's name?</h3>
          <div className="flex gap-5 mb-4">
            <input
              className="bg-[#eeeeee] rounded px-4 py-2 border w-full text-lg placeholder:text-base"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              type="text"
              placeholder="Firstname"
            />
            <input
              className="bg-[#eeeeee] rounded px-4 py-2 border w-full text-lg placeholder:text-base"
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              type="text"
              placeholder="Lastname"
            />
          </div>

          <h3 className="text-lg font-medium mb-2">What's our Captain's email?</h3>
          <input
            className="bg-[#eeeeee] rounded mb-4 px-4 py-2 border w-full text-lg placeholder:text-base"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="email@example.com"
          />

          <h3 className="text-lg font-medium mb-2">Enter Password</h3>
          <input
            className="bg-[#eeeeee] mb-4 rounded px-4 py-2 border w-full text-lg placeholder:text-base"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="password"
          />

          <h3 className="text-lg font-medium mb-2">Vehicle Details</h3>
          <div className="flex gap-5 mb-4">
            <input
              className="bg-[#eeeeee] rounded px-4 py-2 border w-full text-lg placeholder:text-base"
              required
              value={vehicleColor}
              onChange={(e) => setVehicleColor(e.target.value)}
              type="text"
              placeholder="Vehicle Color"
            />
            <input
              className="bg-[#eeeeee] rounded px-4 py-2 border w-full text-lg placeholder:text-base"
              required
              value={vehiclePlate}
              onChange={(e) => setVehiclePlate(e.target.value)}
              type="text"
              placeholder="Vehicle Plate Number"
            />
          </div>
          <div className="flex gap-5 mb-4">
            <input
              className="bg-[#eeeeee] rounded px-4 py-2 border w-full text-lg placeholder:text-base"
              required
              value={vehicleCapacity}
              onChange={(e) => setVehicleCapacity(e.target.value)}
              type="number"
              placeholder="Vehicle Capacity"
            />
            <select
              className="bg-[#eeeeee] rounded px-4 py-2 border w-full text-lg placeholder:text-base"
              required
              value={vehicleType}
              onChange={(e) => setVehicleType(e.target.value)}
            >
              <option value="" disabled>Select Vehicle Type</option>
              <option value="car">Car</option>
              <option value="auto">Auto</option>
              <option value="moto">Moto</option>
            </select>
          </div>

          {error && <p className="text-red-600 text-sm mb-3">{error}</p>}

          <button className="bg-[#111] text-white font-semibold w-full rounded mb-2 px-4 py-2">
            Create Captain Account
          </button>

          <p className="text-center">
            Already have an account?{" "}
            <Link to="/captain-login" className="text-blue-600">
              Login here
            </Link>
          </p>
        </form>
      </div>
      
      <div>
        <p className="text-[6px] leading-tight">
          By proceeding, you consent to get calls, WhatsApp, or SMS messages, including by automated means,
          from Uber and its affiliates to the number provided.
        </p>
      </div>
    </div>
  );
};

export default CaptainSignup;
