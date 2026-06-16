package com.uberclone.backend.config;

import com.corundumstudio.socketio.SocketIOServer;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@RequiredArgsConstructor
public class SocketIOConfig {

    @Value("${socket.host:0.0.0.0}")
    private String host;

    @Value("${socket.port:5001}")
    private Integer port;

    private SocketIOServer server;

    @Bean
    public SocketIOServer socketIOServer() {
        com.corundumstudio.socketio.Configuration config = new com.corundumstudio.socketio.Configuration();
        config.setHostname(host);
        config.setPort(port);
        config.setOrigin("*"); // Allow CORS
        // Configure size limits if necessary
        config.setMaxFramePayloadLength(1024 * 1024);
        config.setMaxHttpContentLength(1024 * 1024);

        this.server = new SocketIOServer(config);
        return this.server;
    }

    @PostConstruct
    public void startSocketIOServer() {
        // Delay start slightly or start asynchronously to let Spring boot finish loading
        new Thread(() -> {
            try {
                // Wait for the bean to be initialized
                Thread.sleep(1000);
                if (server != null) {
                    System.out.println("🚀 Starting Socket.IO server on port " + port);
                    server.start();
                }
            } catch (Exception e) {
                System.err.println("❌ Failed to start Socket.IO server: " + e.getMessage());
            }
        }).start();
    }

    @PreDestroy
    public void stopSocketIOServer() {
        if (server != null) {
            System.out.println("🔌 Stopping Socket.IO server...");
            server.stop();
        }
    }
}
