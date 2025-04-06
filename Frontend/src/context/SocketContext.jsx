import React, { createContext, useEffect, useRef } from "react";
import { io } from "socket.io-client";

export const SocketDataContext = createContext();

const SocketContext = ({ children }) => {
  const socket = useRef(null);

  useEffect(() => {
    socket.current = io(import.meta.env.VITE_BASE_URL, {
      transports: ["websocket", "polling"],
      autoConnect: false,
      withCredentials: true,
    });

    socket.current.connect();

    socket.current.on("connect_error", (err) => {
      console.error("Socket connection error:", err.message);
    });

    socket.current.on("connect", () => {
      console.log("Socket successfully connected:", socket.current.id);
    });

    return () => {
      socket.current.disconnect();
      socket.current.off("connect_error");
      socket.current.off("connect");
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
