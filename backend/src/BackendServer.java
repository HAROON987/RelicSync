import com.sun.net.httpserver.HttpServer;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpExchange;

import java.io.IOException;
import java.io.OutputStream;
import java.io.InputStream;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Scanner;

public class BackendServer {

    private static UserDAO userDAO = new UserDAO();
    private static ItemDAO itemDAO = new ItemDAO();
    private static CategoryDAO categoryDAO = new CategoryDAO();
    private static LocationDAO locationDAO = new LocationDAO();
    private static ClaimDAO claimDAO = new ClaimDAO();
    private static NotificationDAO notificationDAO = new NotificationDAO();

    public static void main(String[] args) throws IOException {
        HttpServer server = HttpServer.create(new InetSocketAddress(8080), 0);
        
        server.createContext("/api/login", new LoginHandler());
        server.createContext("/api/register", new RegisterHandler());
        server.createContext("/api/items", new ItemsHandler());
        server.createContext("/api/matches", new MatchesHandler());
        server.createContext("/api/categories", new CategoriesHandler());
        server.createContext("/api/locations", new LocationsHandler());
        server.createContext("/api/claims", new ClaimsHandler());
        server.createContext("/api/claims/status", new ClaimsStatusHandler());
        server.createContext("/api/notifications", new NotificationsHandler());
        server.createContext("/api/users", new UsersHandler());
        server.createContext("/api/matches/status", new MatchesStatusHandler());

        server.setExecutor(null);
        System.out.println("Backend Server started on port 8080...");
        server.start();
    }

    static class LoginHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            addCorsHeaders(exchange);
            String body = readBody(exchange);
            logRequest(exchange, body);

            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                exchange.sendResponseHeaders(204, -1);
                return;
            }

            if ("POST".equalsIgnoreCase(exchange.getRequestMethod())) {
                String email = extractJsonValue(body, "email");
                String password = extractJsonValue(body, "password");
                String role = extractJsonValue(body, "role");

                System.out.println("Login attempt: " + email + " as " + role);
                User user = userDAO.loginUser(email, password, role);
                if (user != null) {
                    String jsonResponse = String.format(
                        "{\"UserID\":%d, \"FullName\":\"%s\", \"Email\":\"%s\", \"UserRole\":\"%s\"}",
                        user.getUserId(), escapeJson(user.getFullName()), escapeJson(user.getEmail()), escapeJson(user.getUserRole())
                    );
                    sendResponse(exchange, jsonResponse, 200);
                } else {
                    sendResponse(exchange, "{\"error\":\"Invalid credentials\"}", 401);
                }
            }
        }
    }

    static class RegisterHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            addCorsHeaders(exchange);
            String body = readBody(exchange);
            logRequest(exchange, body);

            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                exchange.sendResponseHeaders(204, -1);
                return;
            }

            if ("POST".equalsIgnoreCase(exchange.getRequestMethod())) {
                String fullName = extractJsonValue(body, "fullName");
                String email = extractJsonValue(body, "email");
                String password = extractJsonValue(body, "password");
                String phone = extractJsonValue(body, "phone");
                String role = extractJsonValue(body, "role");

                User newUser;
                if ("Admin".equals(role)) {
                    newUser = new Admin(fullName, email, phone, password);
                } else {
                    newUser = new Student(fullName, email, phone, password);
                }

                if (userDAO.registerUser(newUser)) {
                    sendResponse(exchange, "{\"message\":\"User registered successfully\"}", 201);
                } else {
                    sendResponse(exchange, "{\"error\":\"Registration failed\"}", 400);
                }
            }
        }
    }
    static class ItemsHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            addCorsHeaders(exchange);
            String body = readBody(exchange);
            logRequest(exchange, body);

            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                exchange.sendResponseHeaders(204, -1);
                return;
            }

            if ("GET".equalsIgnoreCase(exchange.getRequestMethod())) {
                String query = exchange.getRequestURI().getQuery();
                List<Item> items;
                if (query != null && query.contains("userId=")) {
                    int userId = Integer.parseInt(query.split("userId=")[1].split("&")[0]);
                    items = itemDAO.getItemsByUser(userId);
                } else {
                    items = itemDAO.getAllItems();
                }

                StringBuilder sb = new StringBuilder("[");
                for (int i = 0; i < items.size(); i++) {
                    Item item = items.get(i);
                    sb.append(String.format(
                        "{\"ItemID\":%d, \"Title\":\"%s\", \"Description\":\"%s\", \"ItemStatus\":\"%s\", \"DateReported\":\"%s\", \"UserID\":%d, \"CategoryID\":%d, \"LocationID\":%d}",
                        item.getItemId(), escapeJson(item.getTitle()), escapeJson(item.getDescription()), escapeJson(item.getItemStatus()), 
                        escapeJson(item.getDateReported()), item.getUserId(), item.getCategoryId(), item.getLocationId()
                    ));
                    if (i < items.size() - 1) sb.append(",");
                }
                sb.append("]");
                sendResponse(exchange, sb.toString(), 200);
            } else if ("POST".equalsIgnoreCase(exchange.getRequestMethod())) {
                String title = extractJsonValue(body, "Title");
                String description = extractJsonValue(body, "Description");
                String status = extractJsonValue(body, "ItemStatus");
                int userId = Integer.parseInt(extractJsonValue(body, "UserID"));
                int categoryId = Integer.parseInt(extractJsonValue(body, "CategoryID"));
                int locationId = Integer.parseInt(extractJsonValue(body, "LocationID"));

                Item newItem = new Item(title, description, status, userId, categoryId, locationId);
                int newItemId = itemDAO.reportItem(newItem);
                if (newItemId > 0) {
                    newItem.setItemId(newItemId);
                    // Trigger AI matching
                    new Thread(() -> runMatching(newItem)).start();
                    sendResponse(exchange, "{\"message\":\"Item reported\", \"ItemID\":" + newItemId + "}", 201);
                } else {
                    sendResponse(exchange, "{\"error\":\"Failed to report item\"}", 400);
                }
            }
        }

        private void runMatching(Item newItem) {
            System.out.println("Real AI: Checking matches for item " + newItem.getItemId() + " (" + newItem.getTitle() + ")");
            MatchDAO matchDAO = new MatchDAO();
            List<Item> allItems = itemDAO.getAllItems();
            int matchCount = 0;
            
            try {
                java.net.http.HttpClient client = java.net.http.HttpClient.newHttpClient();
                
                for (Item other : allItems) {
                    if (other.getItemId() == newItem.getItemId()) continue;
                    
                    // Rule: Same Category, Different Status
                    if (other.getCategoryId() == newItem.getCategoryId() && !other.getItemStatus().equals(newItem.getItemStatus())) {
                        
                        String lostDesc = "Lost".equals(newItem.getItemStatus()) ? newItem.getTitle() + ". " + newItem.getDescription() : other.getTitle() + ". " + other.getDescription();
                        String foundDesc = "Found".equals(newItem.getItemStatus()) ? newItem.getTitle() + ". " + newItem.getDescription() : other.getTitle() + ". " + other.getDescription();
                        
                        // Clean quotes and newlines for JSON payload
                        lostDesc = lostDesc.replace("\"", "\\\"").replace("\n", " ");
                        foundDesc = foundDesc.replace("\"", "\\\"").replace("\n", " ");
                        
                        String jsonInputString = String.format("{\"lostItemDescription\":\"%s\", \"foundItemDescription\":\"%s\"}", lostDesc, foundDesc);
                            
                        java.net.http.HttpRequest request = java.net.http.HttpRequest.newBuilder()
                                .uri(java.net.URI.create("http://localhost:9002/api/ai-match"))
                                .header("Content-Type", "application/json")
                                .POST(java.net.http.HttpRequest.BodyPublishers.ofString(jsonInputString))
                                .build();
                                
                        java.net.http.HttpResponse<String> response = client.send(request, java.net.http.HttpResponse.BodyHandlers.ofString());
                        
                        if (response.statusCode() == 200) {
                            String respBody = response.body();
                            System.out.println("AI Response: " + respBody);
                            
                            boolean isMatch = "true".equalsIgnoreCase(extractJsonValue(respBody, "isPotentialMatch"));
                            String scoreStr = extractJsonValue(respBody, "similarityScore");
                            double score = 0.0;
                            try {
                                score = scoreStr.isEmpty() ? 0.0 : Double.parseDouble(scoreStr);
                            } catch(NumberFormatException e) {
                                score = 0.0;
                            }
                            
                            if (isMatch || score >= 0.7) {
                                System.out.println("Real AI: Strong match found with item " + other.getItemId() + " (Score: " + score + ")");
                                Match m = new Match(0, 
                                    "Lost".equals(newItem.getItemStatus()) ? newItem.getItemId() : other.getItemId(),
                                    "Found".equals(newItem.getItemStatus()) ? newItem.getItemId() : other.getItemId(),
                                    java.time.LocalDateTime.now().toString(),
                                    false, 
                                    score
                                );
                                if (matchDAO.createMatch(m)) matchCount++;
                            }
                        } else {
                            System.out.println("AI API Error: " + response.statusCode() + " " + response.body());
                        }
                    }
                }
            } catch (Exception e) {
                System.out.println("Error calling AI API: " + e.getMessage());
                e.printStackTrace();
            }
            
            System.out.println("Real AI: Matching finished. Matches created: " + matchCount);
        }
    }

    static class MatchesHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            addCorsHeaders(exchange);
            MatchDAO matchDAO = new MatchDAO();

            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                exchange.sendResponseHeaders(204, -1);
                return;
            }

            if ("GET".equalsIgnoreCase(exchange.getRequestMethod())) {
                logRequest(exchange, null);
                List<Match> matches = matchDAO.getAllMatches();
                StringBuilder sb = new StringBuilder("[");
                for (int i = 0; i < matches.size(); i++) {
                    Match m = matches.get(i);
                    sb.append(String.format(
                        "{\"MatchID\":%d, \"LostItem\":%d, \"FoundItem\":%d, \"MatchDate\":\"%s\", \"IsVerified\":%b, \"Score\":%f}",
                        m.getMatchId(), m.getLostItem(), m.getFoundItem(), m.getMatchDate(), m.isVerified(), m.getScore()
                    ));
                    if (i < matches.size() - 1) sb.append(",");
                }
                sb.append("]");
                sendResponse(exchange, sb.toString(), 200);
            } else if ("POST".equalsIgnoreCase(exchange.getRequestMethod())) {
                String body = readBody(exchange);
                logRequest(exchange, body);
                int lostId = Integer.parseInt(extractJsonValue(body, "LostItem"));
                int foundId = Integer.parseInt(extractJsonValue(body, "FoundItem"));
                double score = Double.parseDouble(extractJsonValue(body, "Score"));

                Match m = new Match(0, lostId, foundId, java.time.LocalDateTime.now().toString(), false, score);
                if (matchDAO.createMatch(m)) {
                    sendResponse(exchange, "{\"message\":\"Match created\"}", 201);
                } else {
                    sendResponse(exchange, "{\"error\":\"Failed\"}", 400);
                }
            }
        }
    }

    static class CategoriesHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            addCorsHeaders(exchange);
            CategoryDAO catDAO = new CategoryDAO();
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                exchange.sendResponseHeaders(204, -1);
                return;
            }
            if ("GET".equalsIgnoreCase(exchange.getRequestMethod())) {
                List<Category> cats = catDAO.getAllCategories();
                StringBuilder sb = new StringBuilder("[");
                for (int i = 0; i < cats.size(); i++) {
                    sb.append(String.format("{\"CategoryID\":%d, \"CategoryName\":\"%s\"}", 
                        cats.get(i).getCategoryId(), escapeJson(cats.get(i).getCategoryName())));
                    if (i < cats.size() - 1) sb.append(",");
                }
                sb.append("]");
                sendResponse(exchange, sb.toString(), 200);
            } else if ("POST".equalsIgnoreCase(exchange.getRequestMethod())) {
                String body = readBody(exchange);
                String name = extractJsonValue(body, "CategoryName");
                if (catDAO.addCategory(new Category(0, name))) {
                    sendResponse(exchange, "{\"message\":\"Category added\"}", 201);
                } else {
                    sendResponse(exchange, "{\"error\":\"Failed\"}", 400);
                }
            } else if ("DELETE".equalsIgnoreCase(exchange.getRequestMethod())) {
                String query = exchange.getRequestURI().getQuery();
                if (query != null && query.contains("id=")) {
                    int id = Integer.parseInt(query.split("id=")[1].split("&")[0]);
                    if (catDAO.deleteCategory(id)) {
                        sendResponse(exchange, "{\"message\":\"Deleted\"}", 200);
                    } else {
                        sendResponse(exchange, "{\"error\":\"Failed\"}", 400);
                    }
                }
            }
        }
    }

    static class LocationsHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            addCorsHeaders(exchange);
            LocationDAO locDAO = new LocationDAO();
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                exchange.sendResponseHeaders(204, -1);
                return;
            }
            if ("GET".equalsIgnoreCase(exchange.getRequestMethod())) {
                List<Location> locs = locDAO.getAllLocations();
                StringBuilder sb = new StringBuilder("[");
                for (int i = 0; i < locs.size(); i++) {
                    sb.append(String.format("{\"LocationID\":%d, \"LocationName\":\"%s\"}", 
                        locs.get(i).getLocationId(), escapeJson(locs.get(i).getLocationName())));
                    if (i < locs.size() - 1) sb.append(",");
                }
                sb.append("]");
                sendResponse(exchange, sb.toString(), 200);
            } else if ("POST".equalsIgnoreCase(exchange.getRequestMethod())) {
                String body = readBody(exchange);
                String name = extractJsonValue(body, "LocationName");
                if (locDAO.addLocation(new Location(0, name))) {
                    sendResponse(exchange, "{\"message\":\"Location added\"}", 201);
                } else {
                    sendResponse(exchange, "{\"error\":\"Failed\"}", 400);
                }
            } else if ("DELETE".equalsIgnoreCase(exchange.getRequestMethod())) {
                String query = exchange.getRequestURI().getQuery();
                if (query != null && query.contains("id=")) {
                    int id = Integer.parseInt(query.split("id=")[1].split("&")[0]);
                    if (locDAO.deleteLocation(id)) {
                        sendResponse(exchange, "{\"message\":\"Deleted\"}", 200);
                    } else {
                        sendResponse(exchange, "{\"error\":\"Failed\"}", 400);
                    }
                }
            }
        }
    }

    static class ClaimsHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            addCorsHeaders(exchange);
            String body = readBody(exchange);
            logRequest(exchange, body);

            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                exchange.sendResponseHeaders(204, -1);
                return;
            }

            if ("GET".equalsIgnoreCase(exchange.getRequestMethod())) {
                List<Claim> claims = claimDAO.getAllClaims();
                StringBuilder sb = new StringBuilder("[");
                for (int i = 0; i < claims.size(); i++) {
                    Claim c = claims.get(i);
                    sb.append(String.format(
                        "{\"ClaimID\":%d, \"ItemID\":%d, \"ClaimantID\":%d, \"ClaimantName\":\"%s\", \"ClaimantEmail\":\"%s\", \"ClaimantPhone\":\"%s\", \"ProofDetails\":\"%s\", \"ClaimStatus\":\"%s\"}",
                        c.getClaimId(), c.getItemId(), c.getClaimantId(), escapeJson(c.getClaimantName()), escapeJson(c.getClaimantEmail()), escapeJson(c.getClaimantPhone()), escapeJson(c.getProofDetails()), escapeJson(c.getClaimStatus())
                    ));
                    if (i < claims.size() - 1) sb.append(",");
                }
                sb.append("]");
                sendResponse(exchange, sb.toString(), 200);
            } else if ("POST".equalsIgnoreCase(exchange.getRequestMethod())) {
                int itemId = Integer.parseInt(extractJsonValue(body, "ItemID"));
                int claimantId = Integer.parseInt(extractJsonValue(body, "ClaimantID"));
                String proof = extractJsonValue(body, "ProofDetails");

                Claim claim = new Claim(itemId, claimantId, proof);
                if (claimDAO.fileClaim(claim)) {
                    // Notify Admin
                    notificationDAO.addNotification(new Notification(0, 1, true, "New claim filed for Item #" + itemId, "now"));
                    sendResponse(exchange, "{\"message\":\"Claim filed\"}", 201);
                } else {
                    sendResponse(exchange, "{\"error\":\"Failed to file claim\"}", 400);
                }
            }
        }
    }

    static class ClaimsStatusHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            addCorsHeaders(exchange);
            String body = readBody(exchange);
            logRequest(exchange, body);

            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                exchange.sendResponseHeaders(204, -1);
                return;
            }

            if ("POST".equalsIgnoreCase(exchange.getRequestMethod())) {
                try {
                    int claimId = Integer.parseInt(extractJsonValue(body, "ClaimID"));
                    String status = extractJsonValue(body, "ClaimStatus");
                    System.out.println("DEBUG: Updating claimID=[" + claimId + "] to Status=[" + status + "]");

                    List<Claim> allClaims = claimDAO.getAllClaims();
                    Claim currentClaim = null;
                    for (Claim c : allClaims) { if (c.getClaimId() == claimId) { currentClaim = c; break; } }

                    if (currentClaim == null) {
                        System.out.println("ERROR: ClaimID " + claimId + " not found in database.");
                        sendResponse(exchange, "{\"error\":\"Claim ID " + claimId + " not found\"}", 404);
                        return;
                    }

                    if (claimDAO.updateClaimStatus(claimId, status)) {
                        Item item = itemDAO.getItemById(currentClaim.getItemId());
                        String itemTitle = (item != null) ? item.getTitle() : "Unknown Item";

                        if ("Approved".equalsIgnoreCase(status)) {
                            System.out.println("Claim APPROVED logic executing...");
                            itemDAO.updateItemStatus(currentClaim.getItemId(), "Handed over");
                            notificationDAO.addNotification(new Notification(0, currentClaim.getClaimantId(), false, 
                                "Your claim for '" + itemTitle + "' was accepted! Please contact Admin.", "now"));
                            if (item != null) {
                                notificationDAO.addNotification(new Notification(0, item.getUserId(), false, 
                                    "The item you found ('" + itemTitle + "') has been successfully handed over to its owner.", "now"));
                            }
                        } else if ("Rejectd".equalsIgnoreCase(status) || "Rejected".equalsIgnoreCase(status)) {
                            System.out.println("Claim REJECTED (Rejectd) logic executing...");
                            notificationDAO.addNotification(new Notification(0, currentClaim.getClaimantId(), false, 
                                "Your claim for '" + itemTitle + "' was rejected.", "now"));
                        }
                        sendResponse(exchange, "{\"message\":\"Claim status updated\"}", 200);
                    } else {
                        System.out.println("ERROR: Database update failed for ClaimID " + claimId);
                        sendResponse(exchange, "{\"error\":\"Database update failed for Claim " + claimId + "\"}", 400);
                    }
                } catch (Exception e) {
                    e.printStackTrace();
                    sendResponse(exchange, "{\"error\":\"Internal error: " + e.getMessage() + "\"}", 500);
                }
            }
        }
    }

    static class NotificationsHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            addCorsHeaders(exchange);
            logRequest(exchange, null);
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                exchange.sendResponseHeaders(204, -1);
                return;
            }
            List<Notification> notifs = notificationDAO.getAllNotifications();
            StringBuilder sb = new StringBuilder("[");
            for (int i = 0; i < notifs.size(); i++) {
                Notification n = notifs.get(i);
                sb.append(String.format(
                    "{\"NotificationID\":%d, \"UserID\":%d, \"Message\":\"%s\", \"IsForAdmin\":%b, \"CreatedAt\":\"%s\"}",
                    n.getNotificationId(), n.getUserId(), escapeJson(n.getMessage()), n.isForAdmin(), escapeJson(n.getCreatedAt())
                ));
                if (i < notifs.size() - 1) sb.append(",");
            }
            sb.append("]");
            sendResponse(exchange, sb.toString(), 200);
        }
    }

    static class UsersHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            addCorsHeaders(exchange);
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                exchange.sendResponseHeaders(204, -1);
                return;
            }
            if ("GET".equalsIgnoreCase(exchange.getRequestMethod())) {
                List<User> users = userDAO.getAllUsers();
                StringBuilder sb = new StringBuilder("[");
                for (int i = 0; i < users.size(); i++) {
                    User u = users.get(i);
                    sb.append(String.format(
                        "{\"UserID\":%d, \"FullName\":\"%s\", \"Email\":\"%s\", \"Phone\":\"%s\", \"UserRole\":\"%s\"}",
                        u.getUserId(), escapeJson(u.getFullName()), escapeJson(u.getEmail()), escapeJson(u.getPhone()), escapeJson(u.getUserRole())
                    ));
                    if (i < users.size() - 1) sb.append(",");
                }
                sb.append("]");
                sendResponse(exchange, sb.toString(), 200);
            }
        }
    }

    static class MatchesStatusHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            addCorsHeaders(exchange);
            String body = readBody(exchange);
            logRequest(exchange, body);

            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                exchange.sendResponseHeaders(204, -1);
                return;
            }

            if ("POST".equalsIgnoreCase(exchange.getRequestMethod())) {
                try {
                    int matchId = Integer.parseInt(extractJsonValue(body, "MatchID"));
                    String status = extractJsonValue(body, "Status");

                    MatchDAO matchDAO = new MatchDAO();
                    List<Match> allMatches = matchDAO.getAllMatches();
                    Match currentMatch = null;
                    for (Match m : allMatches) { if (m.getMatchId() == matchId) { currentMatch = m; break; } }

                    if (currentMatch == null) {
                        sendResponse(exchange, "{\"error\":\"Match ID not found\"}", 404);
                        return;
                    }

                    if ("Accepted".equalsIgnoreCase(status)) {
                        itemDAO.updateItemStatus(currentMatch.getLostItem(), "Handed over");
                        itemDAO.updateItemStatus(currentMatch.getFoundItem(), "Handed over");

                        Item lostItem = itemDAO.getItemById(currentMatch.getLostItem());
                        Item foundItem = itemDAO.getItemById(currentMatch.getFoundItem());

                        if (lostItem != null && foundItem != null) {
                            notificationDAO.addNotification(new Notification(0, lostItem.getUserId(), false, 
                                "Your lost item '" + lostItem.getTitle() + "' matched and was approved by Admin. It is now handed over.", "now"));
                            notificationDAO.addNotification(new Notification(0, foundItem.getUserId(), false, 
                                "The item you found '" + foundItem.getTitle() + "' has been successfully handed over to its owner.", "now"));
                        }
                    }

                    if (matchDAO.deleteMatch(matchId)) {
                        sendResponse(exchange, "{\"message\":\"Match updated and removed\"}", 200);
                    } else {
                        sendResponse(exchange, "{\"error\":\"Failed to remove match\"}", 400);
                    }
                } catch (Exception e) {
                    e.printStackTrace();
                    sendResponse(exchange, "{\"error\":\"Internal error: \"}", 500);
                }
            }
        }
    }

    private static String escapeJson(String input) {
        if (input == null) return "";
        return input.replace("\\", "\\\\")
                    .replace("\"", "\\\"")
                    .replace("\n", "\\n")
                    .replace("\r", "\\r")
                    .replace("\t", "\\t");
    }

    private static void addCorsHeaders(HttpExchange exchange) {
        exchange.getResponseHeaders().add("Access-Control-Allow-Origin", "*");
        exchange.getResponseHeaders().add("Access-Control-Allow-Methods", "GET, POST, OPTIONS, DELETE, PUT");
        exchange.getResponseHeaders().add("Access-Control-Allow-Headers", "Content-Type");
    }

    private static void sendResponse(HttpExchange exchange, String response, int code) throws IOException {
        byte[] bytes = response.getBytes(StandardCharsets.UTF_8);
        exchange.sendResponseHeaders(code, bytes.length);
        OutputStream os = exchange.getResponseBody();
        os.write(bytes);
        os.close();
    }

    private static String readBody(HttpExchange exchange) throws IOException {
        InputStream is = exchange.getRequestBody();
        Scanner s = new Scanner(is).useDelimiter("\\A");
        return s.hasNext() ? s.next() : "";
    }

    private static String extractJsonValue(String json, String key) {
        String patternString = "\"" + key + "\"\\s*:\\s*(\"[^\"]*\"|[^,}]*)";
        java.util.regex.Pattern pattern = java.util.regex.Pattern.compile(patternString, java.util.regex.Pattern.CASE_INSENSITIVE);
        java.util.regex.Matcher matcher = pattern.matcher(json);
        if (matcher.find()) {
            String value = matcher.group(1).trim();
            if (value.startsWith("\"") && value.endsWith("\"")) {
                value = value.substring(1, value.length() - 1);
            }
            return value;
        }
        return "";
    }

    private static void logRequest(HttpExchange exchange, String body) {
        System.out.println(String.format("[%s] %s %s", 
            new java.util.Date().toString(),
            exchange.getRequestMethod(), 
            exchange.getHttpContext().getPath()
        ));
        if (body != null && !body.isEmpty()) {
            System.out.println("Body: " + body);
        }
    }
}
