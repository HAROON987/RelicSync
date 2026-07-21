import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class UserDAO {
    public boolean registerUser(User user) {
        String query = "INSERT INTO Users(FullName, Email, Password, Phone, UserRole) VALUES(?,?,?,?,?)";
        try (Connection con = DatabaseConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(query)) {
            ps.setString(1, user.getFullName());
            ps.setString(2, user.getEmail());
            ps.setString(3, user.getPassword());
            ps.setString(4, user.getPhone());
            ps.setString(5, user.getUserRole());
            int result = ps.executeUpdate();
            return result > 0;
        } catch (SQLException e) {
            System.out.println("User registration failed: " + e.getMessage());
            return false;
        }
    }

    public User loginUser(String email, String password, String userRole) {
        String query = "SELECT * FROM Users WHERE Email = ? AND Password = ? AND UserRole = ?";
        try (Connection con = DatabaseConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(query)) {
            ps.setString(1, email);
            ps.setString(2, password);
            ps.setString(3, userRole);
            
            ResultSet rs = ps.executeQuery();
            if (rs.next()) {
                String fullName = rs.getString("FullName");
                String userEmail = rs.getString("Email");
                String phone = rs.getString("Phone");
                
                User user;
                if ("Admin".equals(userRole)) {
                    user = new Admin(fullName, userEmail, phone, password);
                } else {
                    user = new Student(fullName, userEmail, phone, password);
                }
                user.setUserId(rs.getInt("UserID"));
                return user;
            }
        } catch (SQLException e) {
            System.out.println("User login failed: " + e.getMessage());
        }
        return null;
    }

    public User getUserById(int userId) {
        String query = "SELECT * FROM Users WHERE UserID = ?";
        try (Connection con = DatabaseConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(query)) {
            ps.setInt(1, userId);

            ResultSet rs = ps.executeQuery();
            if (rs.next()) {
                String fullName = rs.getString("FullName");
                String email = rs.getString("Email");
                String phone = rs.getString("Phone");
                String password = rs.getString("Password");
                String role = rs.getString("UserRole");

                User user;
                if ("Admin".equals(role)) {
                    user = new Admin(fullName, email, phone, password);
                } else {
                    user = new Student(fullName, email, phone, password);
                }
                user.setUserId(rs.getInt("UserID"));
                return user;
            }
        } catch (SQLException e) {
            System.out.println("Error fetching user: " + e.getMessage());
        }
        return null;
    }

    public List<User> getAllUsers() {
        List<User> users = new ArrayList<>();
        String query = "SELECT * FROM Users";
        try (Connection con = DatabaseConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(query)) {

            ResultSet rs = ps.executeQuery();
            while (rs.next()) {
                String fullName = rs.getString("FullName");
                String email = rs.getString("Email");
                String phone = rs.getString("Phone");
                String password = rs.getString("Password");
                String role = rs.getString("UserRole");

                User user;
                if ("Admin".equals(role)) {
                    user = new Admin(fullName, email, phone, password);
                } else {
                    user = new Student(fullName, email, phone, password);
                }
                user.setUserId(rs.getInt("UserID"));
                users.add(user);
            }
        } catch (SQLException e) {
            System.out.println("Error fetching users: " + e.getMessage());
        }
        return users;
    }
}
