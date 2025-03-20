import React from "react";
import { Link } from "react-router-dom";
import { useState } from "react";

const CaptainSignup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [userData, setUserData] = useState({});

  const handlerSubmit = (e) => {
    e.preventDefault();
    setEmail(" ");
    setPassword(" ");
    setFirstName(" ");
    setLastName(" ");
    setUserData({
      firstName: firstName,
      lastName: lastName,
      email: email,
      password: password,
    });
  };
  return (
    <div className="py-5 px-5 h-screen flex flex-col justify-between">
      <div>
        <img className="w-14 mb-10" src="https://pngimg.com/d/uber_PNG24.png" alt="Uber Logo" />
        <form
          onSubmit={(e) => {
            handlerSubmit(e);
          }}
        >
          <h3 className="text-lg font-medium mb-2">What's our Captain's name</h3>
          <div className="flex gap-5 mb-6">
            <input
              className="bg-[#eeeeee] rounded px-4 py-2 border w-full text-lg placeholder:text-base"
              required
              value={firstName}
              onChange={(e) => {
                setFirstName(e.target.value);
              }}
              type="text"
              placeholder="Firstname"
            />
            <input
              className="bg-[#eeeeee] rounded px-4 py-2 border w-full text-lg placeholder:text-base"
              type="text"
              value={lastName}
              onChange={(e) => {
                setLastName(e.target.value);
              }}
              placeholder="Lastname"
            />
          </div>
          <h3 className="text-lg font-medium mb-2">What's our Captain's email</h3>
          <input
            className="bg-[#eeeeee] rounded mb-6 px-4 py-2 border w-full text-lg placeholder:text-base"
            required
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
            }}
            type="email"
            placeholder="email@example.com"
          />

          <h3 className="text-lg font-medium mb-2">Enter Password</h3>

          <input
            className="bg-[#eeeeee] mb-6 rounded px-4 py-2 border w-full text-lg placeholder:text-base "
            required
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
            }}
            type="password"
            placeholder="password"
          />

          <button className="bg-[#111] text-white font-semibold w-full rounded mb-2 px-4 py-2">
            Login
          </button>
          <p className="text-center">
            Already have a account?{" "}
            <Link to="/captain-login" className="text-blue-600">
              Login here
            </Link>
          </p>
        </form>
      </div>
      <div>
        <p className="text-[6px] leading-tight">
          By proceeding, you consent to get calls, WhatsApp or SMS messages,
          including by automated means, from Uber and its affiliates to the
          number provided.
        </p>
      </div>
    </div>
  );
};

export default CaptainSignup;
