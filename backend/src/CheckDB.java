import java.sql.*;

public class CheckDB {
    public static void main(String[] args) {
        try (Connection con = DatabaseConnection.getConnection()) {
            System.out.println("Users:");
            ResultSet rs = con.createStatement().executeQuery("SELECT * FROM Users");
            while (rs.next()) {
                System.out.println(String.format("ID: %d, Name: %s, Email: %s, Pass: [%s], Role: %s",
                    rs.getInt("UserID"), rs.getString("FullName"), rs.getString("Email"), 
                    rs.getString("Password"), rs.getString("UserRole")));
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
