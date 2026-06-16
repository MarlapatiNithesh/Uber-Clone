import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const containerStyle = {
  width: "100%",
  height: "100vh",
};

const defaultCenter = [28.6139, 77.2090]; // Delhi coordinates

const LiveTracking = ({ pickup, destination, rideActive }) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  
  const [currentPosition, setCurrentPosition] = useState(null);
  const [routePath, setRoutePath] = useState([]);
  const [driverPos, setDriverPos] = useState(null);

  // References to map elements to avoid recreating them
  const userMarkerRef = useRef(null);
  const pickupMarkerRef = useRef(null);
  const destMarkerRef = useRef(null);
  const driverMarkerRef = useRef(null);
  const routeLineRef = useRef(null);

  // 1. Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize map
    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      attributionControl: false,
    }).setView(defaultCenter, 14);

    // Add zoom control at bottom-right
    L.control.zoom({ position: "bottomright" }).addTo(map);

    // Add TileLayer (OpenStreetMap)
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // 2. Track User Location
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
    const intervalId = setInterval(updateLocation, 5000);
    return () => clearInterval(intervalId);
  }, []);

  // 3. Render/Update User Location Marker
  useEffect(() => {
    if (!mapRef.current || !currentPosition) return;

    const blueDotIcon = L.icon({
      iconUrl: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
      iconSize: [32, 32],
      iconAnchor: [16, 32],
    });

    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng([currentPosition.lat, currentPosition.lng]);
    } else {
      userMarkerRef.current = L.marker([currentPosition.lat, currentPosition.lng], {
        icon: blueDotIcon,
      }).addTo(mapRef.current);
    }

    // Only pan to user position if there is no active route
    if (routePath.length === 0) {
      mapRef.current.setView([currentPosition.lat, currentPosition.lng], 14);
    }
  }, [currentPosition, routePath]);

  // 4. Fetch Route and Plot Markers/Polyline when pickup/destination changes
  useEffect(() => {
    if (!pickup || !destination) {
      // Clean up previous route path and markers
      setRoutePath([]);
      setDriverPos(null);

      if (routeLineRef.current) {
        routeLineRef.current.remove();
        routeLineRef.current = null;
      }
      if (pickupMarkerRef.current) {
        pickupMarkerRef.current.remove();
        pickupMarkerRef.current = null;
      }
      if (destMarkerRef.current) {
        destMarkerRef.current.remove();
        destMarkerRef.current = null;
      }
      return;
    }

    // Do not call route API if addresses are too short (prevents 400 validation error in backend)
    if (pickup.length < 3 || destination.length < 3) {
      return;
    }

    let isMounted = true;

    const fetchRoute = async () => {
      try {
        const token = localStorage.getItem("token");

        // Fetch directions route directly from our backend endpoint
        const routeRes = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/maps/get-route`,
          {
            params: { pickup, destination },
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!isMounted || !mapRef.current) return;

        const { pickup: pCoords, destination: dCoords, coordinates: path } = routeRes.data;

        setRoutePath(path);
        setDriverPos(path[0]); // Start driver at pickup

        // Plot Polyline
        if (routeLineRef.current) {
          routeLineRef.current.remove();
        }
        routeLineRef.current = L.polyline(path, {
          color: "black",
          weight: 5,
          opacity: 0.8,
        }).addTo(mapRef.current);

        // Define pickup and destination icons
        const pickupIcon = L.icon({
          iconUrl: "https://maps.google.com/mapfiles/ms/icons/green-dot.png",
          iconSize: [32, 32],
          iconAnchor: [16, 32],
        });
        const destIcon = L.icon({
          iconUrl: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
          iconSize: [32, 32],
          iconAnchor: [16, 32],
        });

        // Set pickup marker
        if (pickupMarkerRef.current) {
          pickupMarkerRef.current.remove();
        }
        pickupMarkerRef.current = L.marker([pCoords.lat, pCoords.lng], {
          icon: pickupIcon,
        }).addTo(mapRef.current);

        // Set destination marker
        if (destMarkerRef.current) {
          destMarkerRef.current.remove();
        }
        destMarkerRef.current = L.marker([dCoords.lat, dCoords.lng], {
          icon: destIcon,
        }).addTo(mapRef.current);

        // Zoom map to fit the full route
        const bounds = L.polyline(path).getBounds();
        mapRef.current.fitBounds(bounds, { padding: [50, 50] });

      } catch (err) {
        console.error("Error drawing Leaflet route:", err);
      }
    };

    // Debounce the call by 1.2s to prevent multiple quick requests when user is typing
    const debounceTimer = setTimeout(() => {
      fetchRoute();
    }, 1200);

    return () => {
      isMounted = false;
      clearTimeout(debounceTimer);
    };
  }, [pickup, destination]);

  // 5. Simulate Driver Movement
  useEffect(() => {
    if (!rideActive || routePath.length === 0) {
      setDriverPos(null);
      return;
    }

    let index = 0;
    const interval = setInterval(() => {
      if (index < routePath.length) {
        setDriverPos(routePath[index]);
        index++;
      } else {
        clearInterval(interval);
      }
    }, 1500); // Update driver position every 1.5 seconds

    return () => clearInterval(interval);
  }, [rideActive, routePath]);

  // 6. Draw/Update Driver Marker
  useEffect(() => {
    if (!mapRef.current) return;

    if (rideActive && driverPos) {
      const taxiIcon = L.icon({
        iconUrl: "https://cdn-icons-png.flaticon.com/512/3097/3097180.png", // Black cab topdown icon
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });

      if (driverMarkerRef.current) {
        driverMarkerRef.current.setLatLng([driverPos[0], driverPos[1]]);
      } else {
        driverMarkerRef.current = L.marker([driverPos[0], driverPos[1]], {
          icon: taxiIcon,
          title: "Your Driver",
        }).addTo(mapRef.current);
      }
    } else {
      if (driverMarkerRef.current) {
        driverMarkerRef.current.remove();
        driverMarkerRef.current = null;
      }
    }
  }, [rideActive, driverPos]);

  return (
    <div style={containerStyle}>
      <div ref={mapContainerRef} style={{ width: "100%", height: "100%" }} />
    </div>
  );
};

export default LiveTracking;
