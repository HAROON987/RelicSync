import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

public class ClaimDAO {
    public boolean fileClaim(Claim claim) {
        String query = "INSERT INTO Claims (ItemID, ClaimantID, ProofDetails, ClaimStatus) VALUES (?,?,?,?)";
        try (Connection con = DatabaseConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(query)) {
            ps.setInt(1, claim.getItemId());
            ps.setInt(2, claim.getClaimantId());
            ps.setString(3, claim.getProofDetails());
            ps.setString(4, claim.getClaimStatus());

            int result = ps.executeUpdate();
            return result > 0;
        } catch (SQLException e) {
            System.out.println("Error filing claim: " + e.getMessage());
            return false;
        }
    }

    public List<Claim> getAllClaims() {
        List<Claim> claims = new ArrayList<>();
        String query = "SELECT c.*, u.FullName as ClaimantName, u.Email as ClaimantEmail, u.Phone as ClaimantPhone FROM Claims c JOIN Users u ON c.ClaimantID = u.UserID";
        try (Connection con = DatabaseConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(query)) {

            ResultSet rs = ps.executeQuery();
            while (rs.next()) {
                Claim claim = new Claim(
                    rs.getInt("ClaimID"),
                    rs.getInt("ItemID"),
                    rs.getInt("ClaimantID"),
                    rs.getString("ProofDetails"),
                    rs.getString("ClaimStatus"),
                    java.time.LocalDateTime.now().toString()
                );
                claim.setClaimantName(rs.getString("ClaimantName"));
                claim.setClaimantEmail(rs.getString("ClaimantEmail"));
                claim.setClaimantPhone(rs.getString("ClaimantPhone"));
                claims.add(claim);
            }
        } catch (SQLException e) {
            System.out.println("Error fetching claims: " + e.getMessage());
        }
        return claims;
    }

    public List<Claim> getClaimsByUser(int userId) {
        List<Claim> claims = new ArrayList<>();
        String query = "SELECT * FROM Claims WHERE ClaimantID = ?";
        try (Connection con = DatabaseConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(query)) {
            ps.setInt(1, userId);

            ResultSet rs = ps.executeQuery();
            while (rs.next()) {
                Claim claim = new Claim(
                    rs.getInt("ClaimID"),
                    rs.getInt("ItemID"),
                    rs.getInt("ClaimantID"),
                    rs.getString("ProofDetails"),
                    rs.getString("ClaimStatus"),
                    java.time.LocalDateTime.now().toString()
                );
                claims.add(claim);
            }
        } catch (SQLException e) {
            System.out.println("Error fetching user claims: " + e.getMessage());
        }
        return claims;
    }

    public boolean updateClaimStatus(int claimId, String status) {
        String query = "UPDATE Claims SET ClaimStatus = ? WHERE ClaimID = ?";
        try (Connection con = DatabaseConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(query)) {
            ps.setString(1, status);
            ps.setInt(2, claimId);

            int result = ps.executeUpdate();
            return result > 0;
        } catch (SQLException e) {
            System.out.println("Error updating claim status: " + e.getMessage());
            return false;
        }
    }
}
