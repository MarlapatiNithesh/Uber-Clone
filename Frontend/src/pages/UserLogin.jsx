import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { UserDataContext } from "../context/UserContext";

const UserLogin = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");  // State to store error messages

    const { setUser } = useContext(UserDataContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");  // Reset error state before attempting login

        try {
            const response = await axios.post(
                `${import.meta.env.VITE_BASE_URL}/users/login`,
                { email, password }
            );

            if (response.status === 200) {
                const { user, token } = response.data;
                localStorage.setItem("token", token);
                setUser(user);
                navigate("/home");

                // Reset fields only after successful login
                setEmail("");
                setPassword("");
            }
        } catch (error) {
            console.error("Login failed:", error);
            setError(error.response?.data?.message || "Login failed. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-7 h-screen flex flex-col justify-between">
            <div>
                <img className="w-14 mb-10" src="https://pathforward.org/wp-content/uploads/2019/01/Uber_Logo_Black-e1547485455995.jpg" alt="" />
                <form onSubmit={handleSubmit}>
                    <h3 className="text-lg font-medium mb-2">What's your email</h3>
                    <input
                        className="bg-[#eeeeee] mb-4 rounded px-4 py-2 border w-full text-lg placeholder:text-base"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        type="email"
                        placeholder="email@example.com"
                    />

                    <h3 className="text-lg font-medium mb-2">Enter Password</h3>
                    <input
                        className="bg-[#eeeeee] mb-4 rounded px-4 py-2 border w-full text-lg placeholder:text-base"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        type="password"
                        placeholder="password"
                    />

                    {error && <p className="text-red-600 text-sm mb-3">{error}</p>} {/* Display error message */}

                    <button
                        className="bg-[#111] text-white font-semibold w-full rounded mb-2 px-4 py-2 disabled:bg-gray-500"
                        disabled={isLoading}
                    >
                        {isLoading ? "Logging in..." : "Login"}
                    </button>

                    <p className="text-center">
                        New Here?{" "}
                        <Link to="/signup" className="text-blue-600">
                            Create new Account
                        </Link>
                    </p>
                </form>
            </div>
            <div>
                <Link
                    to="/captain-login"
                    className="bg-[#10b461] text-white flex items-center justify-center font-semibold w-full mb-7 rounded px-4 py-2"
                >
                    Sign in as Captain
                </Link>
            </div>
        </div>
    );
};

export default UserLogin;
