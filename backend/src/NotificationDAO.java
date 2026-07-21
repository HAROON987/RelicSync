import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class NotificationDAO {
    public boolean addNotification(Notification notification) {
        String query = "INSERT INTO Notifications(UserID, Message, IsForAdmin) VALUES(?,?,?)";
        try (Connection con = DatabaseConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(query)) {
            ps.setInt(1, notification.getUserId());
            ps.setString(2, notification.getMessage());
            ps.setBoolean(3, notification.isForAdmin());
            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    public List<Notification> getAllNotifications() {
        List<Notification> notifications = new ArrayList<>();
        String query = "SELECT * FROM Notifications ORDER BY CreatedAt DESC";
        try (Connection con = DatabaseConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(query)) {
            ResultSet rs = ps.executeQuery();
            while (rs.next()) {
                notifications.add(new Notification(
                    rs.getInt("NotificationID"),
                    rs.getInt("UserID"),
                    rs.getBoolean("IsForAdmin"),
                    rs.getString("Message"),
                    rs.getTimestamp("CreatedAt").toString()
                ));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return notifications;
    }
}
