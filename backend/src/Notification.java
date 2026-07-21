/**
 * Represents a Notification in the system
 */
public class Notification {
    private int notificationId;
    private int userId;
    private boolean isForAdmin;
    private String message;
    private String createdAt;

    public Notification(int userId, String message, boolean isForAdmin) {
        this.userId = userId;
        this.message = message;
        this.isForAdmin = isForAdmin;
        this.createdAt = java.time.LocalDateTime.now().toString();
    }

    public Notification(int notificationId, int userId, boolean isForAdmin, String message, String createdAt) {
        this.notificationId = notificationId;
        this.userId = userId;
        this.isForAdmin = isForAdmin;
        this.message = message;
        this.createdAt = createdAt;
    }

    public int getNotificationId() { return notificationId; }
    public int getUserId() { return userId; }
    public boolean isForAdmin() { return isForAdmin; }
    public String getMessage() { return message; }
    public String getCreatedAt() { return createdAt; }
}
