import React, { useContext, useEffect, useState } from 'react';
import { CaptainDataContext } from '../context/CaptainContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { SocketDataContext } from '../context/SocketContext';

const CaptainProtectWrapper = ({ children }) => {
    const token = localStorage.getItem('token');
    const navigate = useNavigate();
    const { captain, setCaptain } = useContext(CaptainDataContext);
    const [isLoading, setIsLoading] = useState(true);

    

    useEffect(() => {
        if (!token) {
            navigate('/captain-login');
            return;
        }

        if (!captain) {
            console.log("Fetching captain details...");
            axios.get(`${import.meta.env.VITE_BASE_URL}/captains/profile`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            .then(response => {
                console.log("Full API Response:", response);
                console.log("API Response (data):", response.data);

                if (response.status === 200 && response.data) {
                    setCaptain(response.data);
                    console.log("Captain set successfully:", response.data);
                } else {
                    console.error("Unexpected API response structure:", response);
                }
                setIsLoading(false);
            })
            .catch(err => {
                console.error("Error fetching captain:", err);
                localStorage.removeItem('token');
                navigate('/captain-login');
            });
        } else {
            console.log("Captain already available:", captain);
            setIsLoading(false);
        }
    }, [token, captain, setCaptain, navigate]);

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return <>{children}</>;
};

export default CaptainProtectWrapper;
