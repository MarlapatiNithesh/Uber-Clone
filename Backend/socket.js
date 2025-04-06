const { Server } = require("socket.io");
const userModel = require("./models/user.model");
const captainModel = require("./models/captain.model");

let io;

function initializeSocket(server) {
  io = new Server(server, {
    cors: {
      origin: [
        "https://uber-clone-frontend-jjai.onrender.com",
        "http://localhost:5173"
      ],
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log(`✅ Socket connected: ${socket.id}`);

    // ✅ Send test event to frontend
    socket.emit("test", "🧠 Hello from server via WebSocket!");

    // ✅ Join event
    socket.on("join", async (data) => {
      if (!data || typeof data !== "object") {
        console.error("❌ Received null or invalid join data");
        return;
      }

      const { userId, userType } = data;
      console.log(`📌 Join: User ID - ${userId}, Type - ${userType}`);

      try {
        if (userType === "user") {
          await userModel.findByIdAndUpdate(userId, { socketId: socket.id });
        } else if (userType === "captain") {
          await captainModel.findByIdAndUpdate(userId, { socketId: socket.id });
        }
      } catch (error) {
        console.error("❌ DB update error on join:", error.message);
      }
    });

    // ✅ Location update event
    socket.on("update-location-captain", async (data) => {
      try {
        if (!data || typeof data !== "object") {
          return socket.emit("error", { message: "Invalid data format" });
        }

        const { userId, location } = data;

        if (
          !userId ||
          !location ||
          typeof location.lat !== "number" ||
          typeof location.lng !== "number"
        ) {
          return socket.emit("error", { message: "Invalid location data" });
        }

        await captainModel.findByIdAndUpdate(userId, {
          location: {
            lat: location.lat,
            lng: location.lng,
          },
        });

        console.log(`📍 Updated location for captain ${userId}`);

      } catch (error) {
        console.error("❌ Error updating location:", error.message);
        socket.emit("error", { message: "Failed to update location" });
      }
    });

    // ✅ Disconnect event
    socket.on("disconnect", () => {
      console.log(`⚠️ Socket disconnected: ${socket.id}`);
    });

    // ✅ Global error catcher
    socket.on("error", (err) => {
      console.error("🚨 Socket error:", err);
    });
  });
}

// ✅ External socket emit function
function sendMessageToSocketId(socketId, messageObj) {
  if (io) {
    io.to(socketId).emit(messageObj.event, messageObj.ride);
  } else {
    console.error("❌ Socket.io is not initialized.");
  }
}

module.exports = { initializeSocket, sendMessageToSocketId };
