import React, { useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const CaptainLogout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/captain-login"); // Redirect if no token is found
      return;
    }

    axios
      .get(`${import.meta.env.VITE_BASE_URL}/captains/logout`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        if (response.status === 200) {
          localStorage.removeItem("token");
          navigate("/captain-login");
        }
      })
      .catch((err) => {
        console.error("Logout failed:", err);
        alert("Logout failed. Please try again.");
      });
  }, [navigate]);

  return <div>Logging out...</div>;
};

export default CaptainLogout;
