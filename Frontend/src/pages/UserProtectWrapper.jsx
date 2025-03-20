import React, { useContext, useEffect, useState } from 'react';
import { UserDataContext } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const UserProtectWrapper = ({ children }) => {
    const navigate = useNavigate();
    const { setUser } = useContext(UserDataContext);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token'); // Retrieve token inside useEffect

        if (!token) {
            navigate('/login');
            return;
        }

        const fetchUserProfile = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/users/profile`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (response.status === 200) {
                    setUser(response.data.user);
                }
            } catch (error) {
                console.error('Error fetching user profile:', error);
                localStorage.removeItem('token');
                navigate('/login');
            } finally {
                setLoading(false); // Ensure loading is stopped in all cases
            }
        };

        fetchUserProfile();
    }, [navigate, setUser]); // Ensured correct dependencies

    if (loading) {
        return <div className="flex items-center justify-center h-screen">Loading...</div>; // Centered loader
    }

    return <>{children}</>;
};

export default UserProtectWrapper;
