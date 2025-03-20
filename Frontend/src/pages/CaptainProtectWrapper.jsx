import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { CaptainDataContext } from "../context/CaptainContext";

const CaptainProtectWrapper = ({ children }) => {
  const navigate = useNavigate();
  const { setCaptain, isLoaded, setIsLoaded } = useContext(CaptainDataContext);
  const [token, setToken] = useState(localStorage.getItem("token"));

  useEffect(() => {
    if (!token) {
      navigate("/captain-login");
      return;
    }

    setIsLoaded(true); // Start loading state

    axios
      .get(`${import.meta.env.VITE_BASE_URL}/captains/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        if (response.status === 200) {
          setCaptain(response.data.captain);
        }
      })
      .catch((err) => {
        console.error("Authentication failed:", err);
        localStorage.removeItem("token");
        setToken(null);
        navigate("/captain-login");
      })
      .finally(() => {
        setIsLoaded(false); // Always stop loading
      });

  }, [navigate, setCaptain, token]);

  if (isLoaded) {
    return <div className="flex items-center justify-center h-screen text-lg">Loading...</div>;
  }

  return <>{children}</>;
};

export default CaptainProtectWrapper;
