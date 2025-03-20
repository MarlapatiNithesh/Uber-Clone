import React from "react";
import { Link } from "react-router-dom";
import { useState } from "react";

const CaptainLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [captainData, setCaptainData] = useState({});

  const handlerSubmit = (e) => {
    e.preventDefault();
    setCaptainData({
      email: email,
      password: password,
    });

    setEmail(" ");
    setPassword("");
  };

  return (
    <div className="p-7 h-screen flex flex-col justify-between">
      <div>
        <img className="w-14 mb-10" src="https://pngimg.com/d/uber_PNG24.png" alt="" />
        <form
          onSubmit={(e) => {
            handlerSubmit(e);
          }}
        >
          <h3 className="text-lg font-medium mb-2">What's your email</h3>
          <input
            className="bg-[#eeeeee] mb-7 rounded px-4 py-2 border w-full text-lg placeholder:text-base"
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
            className="bg-[#eeeeee] mb-7 rounded px-4 py-2 border w-full text-lg placeholder:text-base "
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
            Join a fleet?{" "}
            <Link to="/captain-signup" className="text-blue-600">
            Register as a Captain
            </Link>
          </p>
        </form>
      </div>
      <div>
        <Link
          to="/login"
          className="bg-[#d5622d] text-white flex item-center justify-center font-semibold w-full mb-7 rounded px-4 py-2"
        >
          Sign in as User
        </Link>
      </div>
    </div>
  );
};

export default CaptainLogin;
