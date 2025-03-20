import React, { useState } from "react";
import { Link } from "react-router-dom";

const UserLogin = () => {
    const [email,setEmail]=useState('')
    const [password,setPassword]=useState('')
    const [userData,setUserData]=useState({})

    const handlerSubmit = (e) => {
        e.preventDefault()
        setUserData({
            email:email,
            password:password
        })

        setEmail(' ')
        setPassword('')
    }
  return (
    <div className="p-7 h-screen flex flex-col justify-between">
      <div>
        <img className="w-14 mb-10" src="/Image/uber_log.png" alt="Uber Logo" />
        <form onSubmit={(e)=>{
            handlerSubmit(e)
        }}>
          <h3 className="text-lg font-medium mb-2">What's your email</h3>
          <input
            className="bg-[#eeeeee] mb-7 rounded px-4 py-2 border w-full text-lg placeholder:text-base"
            required
            value={email}
            onChange={(e)=>{
                setEmail(e.target.value)
            }}
            type="email"
            placeholder="email@example.com"
          />

          <h3 className="text-lg font-medium mb-2">Enter Password</h3>

          <input
            className="bg-[#eeeeee] mb-7 rounded px-4 py-2 border w-full text-lg placeholder:text-base "
            required
            value={password}
            onChange={(e)=>{
                setPassword(e.target.value)
            }}
            type="password"
            placeholder="password"
          />

          <button className="bg-[#111] text-white font-semibold w-full rounded mb-2 px-4 py-2">
            Login
          </button>
          <p className="text-center">New Here? <Link to='/signup' className="text-blue-600">Create new Account</Link></p>
        </form>
      </div>
      <div>
        <Link to='/captain-login' className="bg-[#10b461] text-white flex item-center justify-center font-semibold w-full mb-7 rounded px-4 py-2">Sign in as Captain</Link>
      </div>
    </div>
  );
};

export default UserLogin;
