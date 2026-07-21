import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class ItemDAO {
    public int reportItem(Item item) {
        String query = "INSERT INTO items (Title, Description, ItemStatus, UserId, CategoryID, LocationID) values (?,?,?,?,?,?)";
        try (Connection con = DatabaseConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(query, Statement.RETURN_GENERATED_KEYS)) {
            ps.setString(1, item.getTitle());
            ps.setString(2, item.getDescription());
            ps.setString(3, item.getItemStatus());
            ps.setInt(4, item.getUserId());
            ps.setInt(5, item.getCategoryId());
            ps.setInt(6, item.getLocationId());
            
            int result = ps.executeUpdate();
            if (result > 0) {
                ResultSet rs = ps.getGeneratedKeys();
                if (rs.next()) {
                    int id = rs.getInt(1);
                    item.setItemId(id);
                    return id;
                }
            }
            return -1;
        } catch (SQLException e) {
            System.out.println("Error reporting item: " + e.getMessage());
            return -1;
        }
    }

    public List<Item> getAllItems() {
        List<Item> items = new ArrayList<>();
        String query = "SELECT * FROM items";
        try (Connection con = DatabaseConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(query)) {
            ResultSet rs = ps.executeQuery();
            while (rs.next()) {
                Item item = new Item(
                    rs.getString("Title"),
                    rs.getString("Description"),
                    rs.getString("ItemStatus"),
                    rs.getInt("UserId"),
                    rs.getInt("CategoryID"),
                    rs.getInt("LocationID")
                );
                item.setItemId(rs.getInt("ItemID"));
                items.add(item);
            }
        } catch (SQLException e) {
            System.out.println("Error fetching items: " + e.getMessage());
        }
        return items;
    }

    public List<Item> getItemsByUser(int userId) {
        List<Item> items = new ArrayList<>();
        String query = "SELECT * FROM items WHERE UserId = ?";
        try (Connection con = DatabaseConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(query)) {
            ps.setInt(1, userId);
            ResultSet rs = ps.executeQuery();
            while (rs.next()) {
                Item item = new Item(
                    rs.getString("Title"),
                    rs.getString("Description"),
                    rs.getString("ItemStatus"),
                    rs.getInt("UserId"),
                    rs.getInt("CategoryID"),
                    rs.getInt("LocationID")
                );
                item.setItemId(rs.getInt("ItemID"));
                items.add(item);
            }
        } catch (SQLException e) {
            System.out.println("Error fetching user items: " + e.getMessage());
        }
        return items;
    }

    public Item getItemById(int itemId) {
        String query = "SELECT * FROM items WHERE ItemID = ?";
        try (Connection con = DatabaseConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(query)) {
            ps.setInt(1, itemId);
            ResultSet rs = ps.executeQuery();
            if (rs.next()) {
                Item item = new Item(
                    rs.getString("Title"),
                    rs.getString("Description"),
                    rs.getString("ItemStatus"),
                    rs.getInt("UserId"),
                    rs.getInt("CategoryID"),
                    rs.getInt("LocationID")
                );
                item.setItemId(rs.getInt("ItemID"));
                return item;
            }
        } catch (SQLException e) {
            System.out.println("Error fetching item by id: " + e.getMessage());
        }
        return null;
    }

    public boolean updateItemStatus(int itemId, String status) {
        String query = "UPDATE items SET ItemStatus = ? WHERE ItemID = ?";
        try (Connection con = DatabaseConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(query)) {
            ps.setString(1, status);
            ps.setInt(2, itemId);
            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            System.out.println("Error updating item status: " + e.getMessage());
            return false;
        }
    }
}
