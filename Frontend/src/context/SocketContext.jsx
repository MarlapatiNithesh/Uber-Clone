import React, { createContext, useEffect, useRef } from "react";
import { io } from "socket.io-client";

export const SocketDataContext = createContext();

const SocketContext = ({ children }) => {
  const socket = useRef(null);

  useEffect(() => {
    socket.current = io(`${import.meta.env.VITE_BASE_URL}`); 
    console.log("Socket connected");

    // Cleanup on component unmount
    return () => {
      socket.current.disconnect();
      console.log("Socket disconnected");
    };
  }, []);

  const sendMessage = (eventName, data) => {
    if (socket.current) {
      socket.current.emit(eventName, data);
    }
  };

  const receiveMessage = (eventName, callback) => {
    if (socket.current) {
      socket.current.on(eventName, callback);
    }
  };

  return (
    <SocketDataContext.Provider value={{ sendMessage, receiveMessage }}>
      {children}
    </SocketDataContext.Provider>
  );
};

export default SocketContext;
