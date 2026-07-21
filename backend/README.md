# RelicSync | Java Backend

Java HTTP server backend for the RelicSync Lost & Found Platform.

## Stack
- **Language**: Java 17
- **HTTP Server**: `com.sun.net.httpserver.HttpServer` (built-in Java)
- **Database Driver**: MySQL Connector/J 9.7.0 (`mysql-connector-j-9.7.0.jar`)
- **API**: RESTful JSON on port `8080`

## Setup

### 1. Configure Database

Edit `src/DatabaseConnection.java` and update your MySQL credentials:

```java
private static final String URL      = "jdbc:mysql://127.0.0.1:3306/project?allowPublicKeyRetrieval=true&useSSL=false";
private static final String USER     = "root";
private static final String PASSWORD = "your_mysql_password";
```

### 2. Run (Easy Way — Windows)

Double-click `start.bat` inside the `backend/` folder.

It will compile and start the server automatically.

### 3. Run (Manual)

From inside the `backend/` directory:

```batch
# Compile
javac -cp mysql-connector-j-9.7.0.jar -d bin src\*.java

# Run
java -cp "bin;mysql-connector-j-9.7.0.jar" BackendServer
```

Server starts on: `http://localhost:8080`

## Source Files

| File | Purpose |
|------|---------|
| `BackendServer.java` | Main HTTP server, all route handlers |
| `DatabaseConnection.java` | JDBC connection |
| `UserDAO.java` | User login, register, fetch |
| `ItemDAO.java` | Item report, status update |
| `ClaimDAO.java` | Claim management |
| `MatchDAO.java` | Match creation and verification |
| `NotificationDAO.java` | Notification system |
| `CategoryDAO.java` | Category management |
| `LocationDAO.java` | Location management |
| `User.java`, `Item.java`, etc. | Model classes |
