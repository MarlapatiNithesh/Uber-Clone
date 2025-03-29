import React from 'react'

const VehiclePanel = ({setPanelOpen,setConfirm,setVehiclePanel,fare={},setVehicletype}) => {
  return (
    <div>
        <h5 onClick={()=>{
            setVehiclePanel(false)
            setPanelOpen(true)
          }} className="p-1 w-[93%] text-center absolute top-0"><i className="text-3xl text-gray-200 ri-arrow-down-wide-line"></i></h5>
          <h3 className="text-2xl font-semibold mb-5 text-center">Choose a Vehicle</h3>

          <div onClick={()=>{
            setConfirm(true)
            setVehiclePanel(false)
            setVehicletype('car')
          }} className="flex border-2 active:border-black  rounded-xl items-center mb-2 p-3 justify-between w-full">
            <img
              className="h-12 object-contain"
              src="https://www.pngplay.com/wp-content/uploads/8/Uber-PNG-Photos.png"
              alt="Uber Car"
            />
            <div className="w-1/2">
              <h4 className="font-medium text-base">
                UberGo <i className="ri-user-3-fill ml-2 text-gray-500"></i> 4
              </h4>
              <h5 className="font-medium text-sm">2 mins away</h5>
              <p className="font-medium text-xs">Affordable, compact rides</p>
            </div>
            <h2 className="text-lg font-semibold">₹{Math.floor(fare.car)}</h2>
          </div>
          <div onClick={()=>{
            setConfirm(true)
            setVehiclePanel(false)
            setVehicletype('moto') 
          }} className="flex border-2 active:border-black rounded-xl items-center mb-2 p-3 justify-between w-full">
            <img
              className="h-12 object-contain"
              src="https://www.uber-assets.com/image/upload/f_auto,q_auto:eco,c_fill,h_368,w_552/v1649231091/assets/2c/7fa194-c954-49b2-9c6d-a3b8601370f5/original/Uber_Moto_Orange_312x208_pixels_Mobile.png"
              alt="Uber moto"
            />
            <div className="w-1/2 mr-5">
              <h4 className="font-medium text-base">
                Moto <i className="ri-user-3-fill ml-2 text-gray-500"></i> 1
              </h4>
              <h5 className="font-medium text-sm">3 mins away</h5>
              <p className="font-medium text-xs">
                Affordable, motorcycle rides
              </p>
            </div>
            <h2 className="text-lg font-semibold">₹{Math.floor(fare.moto)}</h2>
          </div>
          <div onClick={()=>{
            setConfirm(true)
            setVehiclePanel(false)
            setVehicletype('auto')
          }} className="flex border-2 active:border-black  rounded-xl items-center mb-2 p-3 justify-between w-full">
            <img
              className="h-12 object-contain"
              src="https://www.uber-assets.com/image/upload/f_auto,q_auto:eco,c_fill,h_368,w_552/v1648431773/assets/1d/db8c56-0204-4ce4-81ce-56a11a07fe98/original/Uber_Auto_558x372_pixels_Desktop.png"
              alt="Uber auto"
            />
            <div className="w-1/2">
              <h4 className="font-medium text-base">
                UberAuto <i className="ri-user-3-fill ml-2 text-gray-500"></i> 3
              </h4>
              <h5 className="font-medium text-sm">4 mins away</h5>
              <p className="font-medium text-xs">Affordable, Auto rides</p>
            </div>
            <h2 className="text-lg font-semibold">₹{Math.floor(fare.auto)}</h2>
          </div>
    </div>
  )
}

export default VehiclePanel