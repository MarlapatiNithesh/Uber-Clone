import React from "react";

const LocationSearchPanel = ({setPanelOpen, setVehiclePanel }) => {
  const locations = [
    "24B, Near Kappor's Cafe, Sheryians Coding School, Bhopal",
    "22B, Near Malhotra's Cafe, Sheryians Coding School, Bhopal",
    "20B, Near Singhai's Cafe, Sheryians Coding School, Bhopal",
    "18A, Near Sharma's Cafe, Sheryians Coding School, Bhopal",
  ];

  return (
    <div>
      {/* Perfect Circle Icon */}
      {locations.map((location, index) => (
        <div
          key={index}
          onClick={() =>{
            setPanelOpen(false)
            setVehiclePanel(true)
          }}
          className="flex gap-4 border-2 p-3 border-gray-50 active:border-black rounded-xl items-center my-2 justify-start cursor-pointer"
        >
          <h2 className="h-10 w-10 bg-[#eee] flex items-center justify-center rounded-full">
            <i className="ri-map-pin-fill"></i>
          </h2>
          <h4 className="ml-3">{location}</h4>
        </div>
      ))}
    </div>
  );
};

export default LocationSearchPanel;
