import React, { useState, useEffect } from "react";
import { useLoadScript, GoogleMap, Marker } from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "100vh",
};

const defaultCenter = { lat: 28.6139, lng: 77.2090 };

const LiveTracking = () => {
  const [currentPosition, setCurrentPosition] = useState(null);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API,
  });

  useEffect(() => {
    if (!navigator.geolocation) return;

    const updateLocation = () => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentPosition({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => console.error("Geolocation Error:", error),
        { enableHighAccuracy: true }
      );
    };

    updateLocation();
    const intervalId = setInterval(updateLocation, 1000);
    return () => clearInterval(intervalId);
  }, []);

  if (loadError) return <p>Error loading Google Maps</p>;
  if (!isLoaded) return <p>Loading Maps...</p>;

  return (
    <div>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={currentPosition || defaultCenter}
        zoom={15}
      >
        {currentPosition && <Marker position={currentPosition} />}
      </GoogleMap>
    </div>
  );
};

export default LiveTracking;
