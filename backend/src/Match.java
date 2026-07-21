/**
 * Represents an AI Match between a Lost and Found item
 */
public class Match {
    private int matchId;
    private int lostItem;
    private int foundItem;
    private String matchDate;
    private boolean isVerified;
    private double score; // Similarity score (0-1)

    public Match(int lostItem, int foundItem, double score) {
        this.lostItem = lostItem;
        this.foundItem = foundItem;
        this.score = score;
        this.matchDate = java.time.LocalDateTime.now().toString();
        this.isVerified = false;
    }

    public Match(int matchId, int lostItem, int foundItem, String matchDate, boolean isVerified, double score) {
        this.matchId = matchId;
        this.lostItem = lostItem;
        this.foundItem = foundItem;
        this.matchDate = matchDate;
        this.isVerified = isVerified;
        this.score = score;
    }

    public int getMatchId() { return matchId; }
    public int getLostItem() { return lostItem; }
    public int getFoundItem() { return foundItem; }
    public String getMatchDate() { return matchDate; }
    public boolean isVerified() { return isVerified; }
    public void setVerified(boolean verified) { isVerified = verified; }
    public double getScore() { return score; }
}
