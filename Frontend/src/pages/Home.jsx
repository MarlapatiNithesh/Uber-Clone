import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div>
      <div className="h-screen bg-cover bg-[url(/Image/uber_bg.jpg)]  bg-no-repeat bg-center pt-8 w-full flex justify-between flex-col">
        <img className="w-14 ml-8 " src="/Image/uber_log.png" alt="Uber Logo" />

        <div className="bg-white pb-7 py-4 px-4">
          <h2 className="text-[30px] font-bold">Get Started with Uber</h2>
          <Link to='/login' className="flex items-center justify-center w-full bg-black text-white py-3 rounded-lg mt-5">Continue</Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
