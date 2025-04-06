import React, { createContext, useEffect, useRef } from "react";
import { io } from "socket.io-client";

export const SocketDataContext = createContext();

const SocketContext = ({ children }) => {
  const socket = useRef(null);

  useEffect(() => {
    // 🔐 Initialize socket
    socket.current = io(import.meta.env.VITE_BASE_URL);

    // ✅ Connection success
    socket.current.on("connect", () => {
      console.log("✅ Socket successfully connected:", socket.current.id);
    });

    // ❌ Connection error
    socket.current.on("connect_error", (err) => {
      console.error("🚨 Socket connection error:", err.message);
    });

    // 🧪 Listen for test message from server
    socket.current.on("test", (data) => {
      console.log("🧪 Received test message from server:", data);
    });

    // ✅ Cleanup
    return () => {
      if (socket.current) {
        socket.current.disconnect();
        socket.current.off("connect");
        socket.current.off("connect_error");
        socket.current.off("test");
        console.log("🔌 Socket disconnected");
      }
    };
  }, []);

  // 📤 Emit message
  const sendMessage = (eventName, data) => {
    if (socket.current && socket.current.connected) {
      socket.current.emit(eventName, data);
    } else {
      console.warn("⚠️ Cannot send message. Socket not connected.");
    }
  };

  // 📥 Listen to events
  const receiveMessage = (eventName, callback) => {
    if (socket.current) {
      socket.current.on(eventName, callback);
    } else {
      console.warn(`⚠️ Cannot listen for "${eventName}". Socket not initialized.`);
    }
  };

  return (
    <SocketDataContext.Provider value={{ sendMessage, receiveMessage }}>
      {children}
    </SocketDataContext.Provider>
  );
};

export default SocketContext;
