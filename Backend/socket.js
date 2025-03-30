const { Server } = require("socket.io");
const userModel = require("./models/user.model");
const captainModel = require("./models/captain.model");

let io;

function initializeSocket(server) {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on("join", async (data) => {
      if (!data || typeof data !== "object") {
        console.error("Received null or invalid data");
        return;
      }

      const { userId, userType } = data; // ✅ Now safe to destructure

      console.log(`User ID: ${userId}, User Type: ${userType}`);

      try {
        if (userType === "user") {
          await userModel.findByIdAndUpdate(userId, { socketId: socket.id });
        } else if (userType === "captain") {
          await captainModel.findByIdAndUpdate(userId, { socketId: socket.id });
        }
      } catch (error) {
        console.error("Database update error:", error.message);
      }
    });

    socket.on("update-location-captain", async (data) => {
      try {
        if (!data || typeof data !== "object") {
          return socket.emit("error", { message: "Invalid data format" });
        }

        const { userId, location } = data;

        if (!userId || !location || typeof location.lat !== "number" || typeof location.lng !== "number") {
          return socket.emit("error", { message: "Invalid location data" });
        }

        await captainModel.findByIdAndUpdate(userId, { location:{
            lat:location.lat,
            lng:location.lng,
        } });

      } catch (error) {
        console.error("Error updating captain location:", error.message);
        socket.emit("error", { message: "Failed to update location" });
      }
    });

    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
}

function sendMessageToSocketId(socketId, messageObj) {
  if (io) {
    io.to(socketId).emit(messageObj.event, messageObj.ride);
  } else {
    console.error("Socket.io is not initialized.");
  }
}

module.exports = { initializeSocket, sendMessageToSocketId };
