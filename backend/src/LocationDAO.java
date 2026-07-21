import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class LocationDAO {
    public List<Location> getAllLocations() {
        List<Location> locations = new ArrayList<>();
        String query = "SELECT * FROM Locations";

        try (Connection conn = DatabaseConnection.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(query)) {

            while (rs.next()) {
                Location loc = new Location(
                    rs.getInt("LocationID"),
                    rs.getString("LocationName")
                );
                locations.add(loc);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return locations;
    }

    public Location getLocationById(int locationId) {
        String query = "SELECT * FROM Locations WHERE LocationID = ?";
        try (Connection con = DatabaseConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(query)) {
            ps.setInt(1, locationId);

            ResultSet rs = ps.executeQuery();
            if (rs.next()) {
                return new Location(locationId, rs.getString("LocationName"));
            }
        } catch (SQLException e) {
            System.out.println("Error fetching location: " + e.getMessage());
        }
        return null;
    }
    public boolean addLocation(Location location) {
        String query = "INSERT INTO Locations (LocationName) VALUES (?)";
        try (Connection con = DatabaseConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(query)) {
            ps.setString(1, location.getLocationName());
            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    public boolean deleteLocation(int id) {
        String query = "DELETE FROM Locations WHERE LocationID = ?";
        try (Connection con = DatabaseConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(query)) {
            ps.setInt(1, id);
            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }
}