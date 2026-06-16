package com.uberclone.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.uberclone.backend.model.Captain;
import com.uberclone.backend.repository.CaptainRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.util.*;

@Service
@RequiredArgsConstructor
public class MapService {

    private final CaptainRepository captainRepository;
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    private MapService self;
    private static final long MIN_REQUEST_INTERVAL_MS = 1000;
    private static long lastRequestTime = 0;

    private static synchronized void enforceRateLimit() {
        long now = System.currentTimeMillis();
        long elapsed = now - lastRequestTime;
        if (elapsed < MIN_REQUEST_INTERVAL_MS) {
            try {
                Thread.sleep(MIN_REQUEST_INTERVAL_MS - elapsed);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }
        lastRequestTime = System.currentTimeMillis();
    }

    @org.springframework.beans.factory.annotation.Autowired
    @org.springframework.context.annotation.Lazy
    public void setSelf(MapService self) {
        this.self = self;
    }

    @Cacheable(value = "maps", key = "#address", unless = "#result == null")
    public Map<String, Double> getCoordinatesFromAddress(String address) {
        String currentQuery = address;
        while (true) {
            try {
                enforceRateLimit();
                URI uri = UriComponentsBuilder.fromHttpUrl("https://nominatim.openstreetmap.org/search")
                        .queryParam("q", currentQuery)
                        .queryParam("format", "json")
                        .queryParam("limit", 1)
                        .build()
                        .toUri();

                HttpHeaders headers = new HttpHeaders();
                headers.set("User-Agent", "UberCloneBackend/1.0 (com.uberclone.backend)");
                HttpEntity<String> entity = new HttpEntity<>(headers);

                ResponseEntity<String> responseEntity = restTemplate.exchange(uri, HttpMethod.GET, entity, String.class);
                String response = responseEntity.getBody();

                JsonNode root = objectMapper.readTree(response);

                if (root.isArray() && root.size() > 0) {
                    JsonNode first = root.get(0);
                    Map<String, Double> coords = new HashMap<>();
                    coords.put("lat", Double.parseDouble(first.path("lat").asText()));
                    coords.put("lng", Double.parseDouble(first.path("lon").asText()));
                    return coords;
                } else {
                    int firstCommaIndex = currentQuery.indexOf(',');
                    if (firstCommaIndex != -1 && firstCommaIndex < currentQuery.length() - 1) {
                        currentQuery = currentQuery.substring(firstCommaIndex + 1).trim();
                        System.out.println("Geocoding mismatch. Retrying with parent area: '" + currentQuery + "'");
                    } else {
                        throw new RuntimeException("Address not found on OpenStreetMap: " + address);
                    }
                }
            } catch (Exception e) {
                System.err.println("Error fetching coordinates for query '" + currentQuery + "': " + e.getMessage());
                int firstCommaIndex = currentQuery.indexOf(',');
                if (firstCommaIndex != -1 && firstCommaIndex < currentQuery.length() - 1) {
                    currentQuery = currentQuery.substring(firstCommaIndex + 1).trim();
                    try {
                        Thread.sleep(500);
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                    }
                } else {
                    throw new RuntimeException("Geocoding failed for '" + address + "': " + e.getMessage(), e);
                }
            }
        }
    }

    @Cacheable(value = "maps", key = "#origin + '-' + #destination", unless = "#result == null")
    public Map<String, Object> getDistanceTime(String origin, String destination) {
        try {
            Map<String, Double> originCoords = (self != null ? self : this).getCoordinatesFromAddress(origin);
            Map<String, Double> destCoords = (self != null ? self : this).getCoordinatesFromAddress(destination);

            Double originLat = originCoords.get("lat");
            Double originLng = originCoords.get("lng");
            Double destLat = destCoords.get("lat");
            Double destLng = destCoords.get("lng");

            URI uri = UriComponentsBuilder.fromHttpUrl("https://router.project-osrm.org/route/v1/driving/" 
                    + originLng + "," + originLat + ";" + destLng + "," + destLat)
                    .queryParam("overview", "false")
                    .build()
                    .toUri();

            String response = restTemplate.getForObject(uri, String.class);
            JsonNode root = objectMapper.readTree(response);
            String code = root.path("code").asText();

            if ("Ok".equals(code)) {
                JsonNode route = root.path("routes").get(0);
                double distanceValue = route.path("distance").asDouble(); // in meters
                double durationValue = route.path("duration").asDouble(); // in seconds

                Map<String, Object> result = new HashMap<>();
                
                Map<String, Object> distanceMap = new HashMap<>();
                distanceMap.put("text", String.format("%.1f km", distanceValue / 1000.0));
                distanceMap.put("value", (int) distanceValue);
                result.put("distance", distanceMap);

                Map<String, Object> durationMap = new HashMap<>();
                durationMap.put("text", String.format("%.0f mins", durationValue / 60.0));
                durationMap.put("value", (int) durationValue);
                result.put("duration", durationMap);

                result.put("status", "OK");
                return result;
            } else {
                throw new RuntimeException("OSRM routing error: " + code);
            }
        } catch (Exception e) {
            System.err.println("Error fetching distance/time: " + e.getMessage());
            throw new RuntimeException("Distance calculation failed: " + e.getMessage(), e);
        }
    }

    @Cacheable(value = "maps", key = "#input", unless = "#result == null")
    public List<Map<String, Object>> getAutoCompleteSuggestions(String input) {
        enforceRateLimit();
        URI uri = UriComponentsBuilder.fromHttpUrl("https://nominatim.openstreetmap.org/search")
                .queryParam("q", input)
                .queryParam("format", "json")
                .queryParam("addressdetails", 1)
                .build()
                .toUri();

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("User-Agent", "UberCloneBackend/1.0 (com.uberclone.backend)");
            HttpEntity<String> entity = new HttpEntity<>(headers);

            ResponseEntity<String> responseEntity = restTemplate.exchange(uri, HttpMethod.GET, entity, String.class);
            String response = responseEntity.getBody();

            JsonNode root = objectMapper.readTree(response);
            List<Map<String, Object>> resultList = new ArrayList<>();

            if (root.isArray()) {
                for (JsonNode item : root) {
                    Map<String, Object> map = new HashMap<>();
                    map.put("description", item.path("display_name").asText());
                    resultList.add(map);
                }
            }
            return resultList;
        } catch (Exception e) {
            System.err.println("Error fetching suggestions: " + e.getMessage());
            throw new RuntimeException("AutoComplete suggestions failed: " + e.getMessage(), e);
        }
    }

    public List<Captain> getCaptainsInTheRadius(Double lat, Double lng, Double radiusInKm) {
        // Radius in radians = radius / 6371.0
        Double radiusInRadians = radiusInKm / 6371.0;
        System.out.println("Searching captains near: lat=" + lat + ", lng=" + lng + ", radius=" + radiusInKm + " km");
        return captainRepository.findCaptainsInRadius(lat, lng, radiusInRadians);
    }

    @Cacheable(value = "maps", key = "#pickup + '-' + #destination + '-route'", unless = "#result == null")
    public Map<String, Object> getRoute(String pickup, String destination) {
        try {
            Map<String, Double> originCoords = (self != null ? self : this).getCoordinatesFromAddress(pickup);
            Map<String, Double> destCoords = (self != null ? self : this).getCoordinatesFromAddress(destination);

            Double originLat = originCoords.get("lat");
            Double originLng = originCoords.get("lng");
            Double destLat = destCoords.get("lat");
            Double destLng = destCoords.get("lng");

            URI uri = UriComponentsBuilder.fromHttpUrl("https://router.project-osrm.org/route/v1/driving/" 
                    + originLng + "," + originLat + ";" + destLng + "," + destLat)
                    .queryParam("overview", "full")
                    .queryParam("geometries", "geojson")
                    .build()
                    .toUri();

            String response = restTemplate.getForObject(uri, String.class);
            JsonNode root = objectMapper.readTree(response);
            String code = root.path("code").asText();

            if ("Ok".equals(code)) {
                JsonNode route = root.path("routes").get(0);
                JsonNode coordinatesNode = route.path("geometry").path("coordinates");
                
                List<List<Double>> path = new ArrayList<>();
                if (coordinatesNode.isArray()) {
                    for (JsonNode coord : coordinatesNode) {
                        List<Double> point = new ArrayList<>();
                        point.add(coord.get(1).asDouble());
                        point.add(coord.get(0).asDouble());
                        path.add(point);
                    }
                }

                Map<String, Object> result = new HashMap<>();
                result.put("pickup", originCoords);
                result.put("destination", destCoords);
                result.put("coordinates", path);
                return result;
            } else {
                throw new RuntimeException("OSRM routing error: " + code);
            }
        } catch (Exception e) {
            System.err.println("Error fetching route directions: " + e.getMessage());
            throw new RuntimeException("Routing failed: " + e.getMessage(), e);
        }
    }

    @Cacheable(value = "maps", key = "#lat + '-' + #lng + '-reverse'", unless = "#result == null")
    public Map<String, String> getAddressFromCoordinates(Double lat, Double lng) {
        enforceRateLimit();
        URI uri = UriComponentsBuilder.fromHttpUrl("https://nominatim.openstreetmap.org/reverse")
                .queryParam("lat", lat)
                .queryParam("lon", lng)
                .queryParam("format", "json")
                .build()
                .toUri();

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("User-Agent", "UberCloneBackend/1.0 (com.uberclone.backend)");
            HttpEntity<String> entity = new HttpEntity<>(headers);

            ResponseEntity<String> responseEntity = restTemplate.exchange(uri, HttpMethod.GET, entity, String.class);
            String response = responseEntity.getBody();

            JsonNode root = objectMapper.readTree(response);
            String displayName = root.path("display_name").asText();

            if (displayName != null && !displayName.isEmpty()) {
                return Map.of("address", displayName);
            } else {
                return Map.of("address", String.format("Location (%.5f, %.5f)", lat, lng));
            }
        } catch (Exception e) {
            System.err.println("Error reverse geocoding coordinates (" + lat + ", " + lng + "): " + e.getMessage());
            return Map.of("address", String.format("Location (%.5f, %.5f)", lat, lng));
        }
    }
}
