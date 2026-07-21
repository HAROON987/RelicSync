/**
 * Represents a Claim filed by a student for a found item
 */
public class Claim {
    private int claimId;
    private int itemId;
    private int claimantId;
    private String proofDetails;
    private String claimStatus; // "Pending", "Approved", "Rejected"
    private String createdAt;
    private String claimantName;
    private String claimantEmail;
    private String claimantPhone;

    public Claim(int itemId, int claimantId, String proofDetails) {
        this.itemId = itemId;
        this.claimantId = claimantId;
        this.proofDetails = proofDetails;
        this.claimStatus = "Pending";
        this.createdAt = java.time.LocalDateTime.now().toString();
    }

    public Claim(int claimId, int itemId, int claimantId, String proofDetails, String claimStatus, String createdAt) {
        this.claimId = claimId;
        this.itemId = itemId;
        this.claimantId = claimantId;
        this.proofDetails = proofDetails;
        this.claimStatus = claimStatus;
        this.createdAt = createdAt;
    }

    public String getClaimantName() { return claimantName; }
    public void setClaimantName(String claimantName) { this.claimantName = claimantName; }
    public String getClaimantEmail() { return claimantEmail; }
    public void setClaimantEmail(String claimantEmail) { this.claimantEmail = claimantEmail; }
    public String getClaimantPhone() { return claimantPhone; }
    public void setClaimantPhone(String claimantPhone) { this.claimantPhone = claimantPhone; }

    public int getClaimId() { return claimId; }
    public int getItemId() { return itemId; }
    public int getClaimantId() { return claimantId; }
    public String getProofDetails() { return proofDetails; }
    public String getClaimStatus() { return claimStatus; }
    public void setClaimStatus(String claimStatus) { this.claimStatus = claimStatus; }
    public String getCreatedAt() { return createdAt; }
}
