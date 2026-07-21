import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

public class MatchDAO {
    public boolean createMatch(Match match) {
        String query = "INSERT INTO Matches (LostItem, FoundItem, IsVarified, MatchDate, Score) VALUES (?,?,?,?,?)";
        try (Connection con = DatabaseConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(query)) {
            ps.setInt(1, match.getLostItem());
            ps.setInt(2, match.getFoundItem());
            ps.setBoolean(3, match.isVerified());
            ps.setString(4, match.getMatchDate());
            ps.setDouble(5, match.getScore());

            int result = ps.executeUpdate();
            return result > 0;
        } catch (SQLException e) {
            // Fallback for missing Score column
            if (e.getMessage().contains("Score")) {
                String fallbackQuery = "INSERT INTO Matches (LostItem, FoundItem, IsVarified, MatchDate) VALUES (?,?,?,?)";
                try (Connection con = DatabaseConnection.getConnection();
                     PreparedStatement ps = con.prepareStatement(fallbackQuery)) {
                    ps.setInt(1, match.getLostItem());
                    ps.setInt(2, match.getFoundItem());
                    ps.setBoolean(3, match.isVerified());
                    ps.setString(4, match.getMatchDate());
                    return ps.executeUpdate() > 0;
                } catch (SQLException e2) { System.out.println(e2.getMessage()); }
            }
            System.out.println("Error creating match: " + e.getMessage());
            return false;
        }
    }

    public List<Match> getAllMatches() {
        List<Match> matches = new ArrayList<>();
        String query = "SELECT * FROM Matches";
        try (Connection con = DatabaseConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(query)) {

            ResultSet rs = ps.executeQuery();
            while (rs.next()) {
                double score = 0.0;
                try { score = rs.getDouble("Score"); } catch (Exception e) {}
                
                Match match = new Match(
                    rs.getInt("MatchID"),
                    rs.getInt("LostItem"),
                    rs.getInt("FoundItem"),
                    rs.getString("MatchDate"),
                    rs.getBoolean("IsVarified"),
                    score
                );
                matches.add(match);
            }
        } catch (SQLException e) {
            System.out.println("Error fetching matches: " + e.getMessage());
        }
        return matches;
    }

    public boolean updateMatchStatus(int matchId, boolean isVarified) {
        String query = "UPDATE Matches SET IsVarified = ? WHERE MatchID = ?";
        try (Connection con = DatabaseConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(query)) {
            ps.setBoolean(1, isVarified);
            ps.setInt(2, matchId);

            int result = ps.executeUpdate();
            return result > 0;
        } catch (SQLException e) {
            System.out.println("Error updating match: " + e.getMessage());
            return false;
        }
    }

    public boolean deleteMatch(int matchId) {
        String query = "DELETE FROM Matches WHERE MatchID = ?";
        try (Connection con = DatabaseConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(query)) {
            ps.setInt(1, matchId);
            int result = ps.executeUpdate();
            return result > 0;
        } catch (SQLException e) {
            System.out.println("Error deleting match: " + e.getMessage());
            return false;
        }
    }
}
