import React from 'react'

const VehiclePanel = ({setPanelOpen,setConfirm,setVehiclePanel,fare={},setVehicletype}) => {
  return (
    <div className="glass-panel p-6 rounded-t-3xl shadow-2xl relative border-t border-white/50">
        <h5 onClick={()=>{
            setVehiclePanel(false)
            setPanelOpen(true)
          }} className="p-2 w-[93%] text-center absolute top-2 left-1/2 transform -translate-x-1/2 cursor-pointer transition-transform hover:translate-y-0.5">
          <i className="text-3xl text-gray-400 ri-arrow-down-wide-line"></i>
        </h5>
        
        <h3 className="text-2xl font-bold mb-6 text-center text-gray-800 tracking-tight mt-4">
          Select Your Ride
        </h3>

        {/* Car Ride Option */}
        <div onClick={()=>{
          setConfirm(true)
          setVehiclePanel(false)
          setVehicletype('car')
        }} className="flex border border-gray-150 hover:border-black/55 bg-white/60 active:scale-[0.98] transition-all duration-300 cursor-pointer rounded-2xl items-center mb-3 p-4 justify-between w-full shadow-sm hover:shadow-md">
          <img
            className="h-14 w-18 object-contain transform hover:scale-105 transition-transform"
            src="https://www.pngplay.com/wp-content/uploads/8/Uber-PNG-Photos.png"
            alt="Uber Car"
          />
          <div className="w-1/2 px-2">
            <h4 className="font-semibold text-lg text-gray-800 flex items-center">
              UberGo <span className="ml-2 bg-gray-100 px-2 py-0.5 text-xs rounded-full text-gray-500 font-medium"><i className="ri-user-3-fill text-gray-400"></i> 4</span>
            </h4>
            <h5 className="font-medium text-sm text-green-600 font-semibold">2 mins away</h5>
            <p className="text-gray-500 text-xs mt-0.5">Affordable, comfortable cars</p>
          </div>
          <h2 className="text-xl font-bold text-gray-900">₹{Math.floor(fare.car || 0)}</h2>
        </div>

        {/* Moto Ride Option */}
        <div onClick={()=>{
          setConfirm(true)
          setVehiclePanel(false)
          setVehicletype('moto') 
        }} className="flex border border-gray-150 hover:border-black/55 bg-white/60 active:scale-[0.98] transition-all duration-300 cursor-pointer rounded-2xl items-center mb-3 p-4 justify-between w-full shadow-sm hover:shadow-md">
          <img
            className="h-14 w-18 object-contain transform hover:scale-105 transition-transform"
            src="https://www.uber-assets.com/image/upload/f_auto,q_auto:eco,c_fill,h_368,w_552/v1649231091/assets/2c/7fa194-c954-49b2-9c6d-a3b8601370f5/original/Uber_Moto_Orange_312x208_pixels_Mobile.png"
            alt="Uber Moto"
          />
          <div className="w-1/2 px-2">
            <h4 className="font-semibold text-lg text-gray-800 flex items-center">
              Moto <span className="ml-2 bg-gray-100 px-2 py-0.5 text-xs rounded-full text-gray-500 font-medium"><i className="ri-user-3-fill text-gray-400"></i> 1</span>
            </h4>
            <h5 className="font-medium text-sm text-green-600 font-semibold">3 mins away</h5>
            <p className="text-gray-500 text-xs mt-0.5">Affordable, quick motorcycle rides</p>
          </div>
          <h2 className="text-xl font-bold text-gray-900">₹{Math.floor(fare.moto || 0)}</h2>
        </div>

        {/* Auto Ride Option */}
        <div onClick={()=>{
          setConfirm(true)
          setVehiclePanel(false)
          setVehicletype('auto')
        }} className="flex border border-gray-150 hover:border-black/55 bg-white/60 active:scale-[0.98] transition-all duration-300 cursor-pointer rounded-2xl items-center mb-3 p-4 justify-between w-full shadow-sm hover:shadow-md">
          <img
            className="h-14 w-18 object-contain transform hover:scale-105 transition-transform"
            src="https://www.uber-assets.com/image/upload/f_auto,q_auto:eco,c_fill,h_368,w_552/v1648431773/assets/1d/db8c56-0204-4ce4-81ce-56a11a07fe98/original/Uber_Auto_558x372_pixels_Desktop.png"
            alt="Uber Auto"
          />
          <div className="w-1/2 px-2">
            <h4 className="font-semibold text-lg text-gray-800 flex items-center">
              UberAuto <span className="ml-2 bg-gray-100 px-2 py-0.5 text-xs rounded-full text-gray-500 font-medium"><i className="ri-user-3-fill text-gray-400"></i> 3</span>
            </h4>
            <h5 className="font-medium text-sm text-green-600 font-semibold">4 mins away</h5>
            <p className="text-gray-500 text-xs mt-0.5">Affordable auto-rickshaw rides</p>
          </div>
          <h2 className="text-xl font-bold text-gray-900">₹{Math.floor(fare.auto || 0)}</h2>
        </div>
    </div>
  )
}

export default VehiclePanel