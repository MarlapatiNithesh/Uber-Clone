import React from 'react'

const CaptainDetails = () => {
  return (
    <div>
         <div className="flex items-center justify-between">
          <div className="flex items-center justify-start gap-3">
            <img
              className="h-10 w-10 rounded-full object-cover"
              src="https://i.pinimg.com/474x/ca/28/47/ca28478cd4788b38d99b167e56e0a555.jpg"
              alt=""
            ></img>
            <h4 className="text-lg font-medium">Harsh patel</h4>
          </div>
          <div>
            <h4 className="text-xl font-semibold">₹295.20</h4>
            <p className="text-sm text-gray-400">Earned</p>
          </div>
        </div>

        <div className="flex p-3 mt-6 bg-gray-100 rounded-xl justify-center gap-5 items-start">
          <div className="text-center">
            <i className="text-3xl mb-2 font-thin ri-timer-2-line"></i>
            <h5 className="text-lg font-medium">10.2</h5>
            <p className="text-sm text-gray-400">Hours Online</p>
          </div>
          <div className="text-center">
            <i className="text-3xl mb-2 font-thin ri-speed-up-line"></i>
            <h5 className="text-lg font-medium">10.2</h5>
            <p className="text-sm text-gray-400">Hours Online</p>
          </div>
          <div className="text-center">
            <i className="text-3xl mb-2 font-thin ri-booklet-line"></i>
            <h5 className="text-lg font-medium">10.2</h5>
            <p className="text-sm text-gray-400">Hours Online</p>
          </div>
        </div>
    </div>
  )
}

export default CaptainDetails