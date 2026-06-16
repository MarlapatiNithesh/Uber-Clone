package com.uberclone.backend.socket;

import com.corundumstudio.socketio.SocketIOClient;
import com.corundumstudio.socketio.SocketIOServer;
import com.uberclone.backend.model.Captain;
import com.uberclone.backend.service.CaptainService;
import com.uberclone.backend.service.UserService;
import jakarta.annotation.PostConstruct;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SocketService {

    private final SocketIOServer server;
    private final UserService userService;
    private final CaptainService captainService;

    @PostConstruct
    public void init() {
        server.addConnectListener(client -> {
            System.out.println("✅ Socket connected: " + client.getSessionId());
            client.sendEvent("test", "🧠 Hello from server via WebSocket!");
        });

        server.addDisconnectListener(client -> {
            System.out.println("⚠️ Socket disconnected: " + client.getSessionId());
        });

        server.addEventListener("join", JoinData.class, (client, data, ackSender) -> {
            if (data == null || data.getUserId() == null || data.getUserType() == null) {
                System.err.println("❌ Received invalid join data");
                return;
            }

            String userId = data.getUserId();
            String userType = data.getUserType();
            String socketId = client.getSessionId().toString();

            System.out.println("📌 Join: User ID - " + userId + ", Type - " + userType + ", Socket - " + socketId);

            try {
                if ("user".equals(userType)) {
                    userService.findById(userId).ifPresent(user -> {
                        user.setSocketId(socketId);
                        userService.save(user);
                    });
                } else if ("captain".equals(userType)) {
                    captainService.findById(userId).ifPresent(captain -> {
                        captain.setSocketId(socketId);
                        captainService.save(captain);
                    });
                }
            } catch (Exception e) {
                System.err.println("❌ DB update error on join: " + e.getMessage());
            }
        });

        server.addEventListener("update-location-captain", UpdateLocationData.class, (client, data, ackSender) -> {
            if (data == null || data.getUserId() == null || data.getLocation() == null) {
                client.sendEvent("error", new ErrorMessage("Invalid location data"));
                return;
            }

            try {
                String userId = data.getUserId();
                UpdateLocationData.Location location = data.getLocation();

                if (location.getLat() == null || location.getLng() == null) {
                    client.sendEvent("error", new ErrorMessage("Invalid location coordinates"));
                    return;
                }

                captainService.findById(userId).ifPresent(captain -> {
                    captain.setLocation(new Captain.Location(location.getLat(), location.getLng()));
                    captainService.save(captain);
                    System.out.println("📍 Updated location for captain " + userId);
                });
            } catch (Exception e) {
                System.err.println("❌ Error updating location: " + e.getMessage());
                client.sendEvent("error", new ErrorMessage("Failed to update location"));
            }
        });
    }

    public void sendMessageToSocketId(String socketId, String event, Object data) {
        try {
            if (socketId != null) {
                UUID uuid = UUID.fromString(socketId);
                SocketIOClient client = server.getClient(uuid);
                if (client != null) {
                    client.sendEvent(event, data);
                } else {
                    System.err.println("❌ Socket client not found for UUID: " + socketId);
                }
            }
        } catch (Exception e) {
            System.err.println("❌ Error sending message to socket " + socketId + ": " + e.getMessage());
        }
    }

    @Data
    public static class JoinData {
        private String userId;
        private String userType;
    }

    @Data
    public static class UpdateLocationData {
        private String userId;
        private Location location;

        @Data
        public static class Location {
            private Double lat;
            private Double lng;
        }
    }

    @Data
    public static class ErrorMessage {
        private final String message;
    }
}
