/**
 * Represents a Lost & Found item in the system
 */
public class Item {
    private int itemId;
    private String title;
    private String description;
    private String itemStatus; // "Lost", "Found", "Handed over"
    private String dateReported;
    private int userId;
    private int categoryId;
    private int locationId;

    public Item(String title, String description, String itemStatus, int userId, int categoryId, int locationId) {
        this.title = title;
        this.description = description;
        this.itemStatus = itemStatus;
        this.userId = userId;
        this.categoryId = categoryId;
        this.locationId = locationId;
        this.dateReported = java.time.LocalDateTime.now().toString();
    }

    public Item(int itemId, String title, String description, String itemStatus, String dateReported, 
                int userId, int categoryId, int locationId) {
        this.itemId = itemId;
        this.title = title;
        this.description = description;
        this.itemStatus = itemStatus;
        this.dateReported = dateReported;
        this.userId = userId;
        this.categoryId = categoryId;
        this.locationId = locationId;
    }

    public int getItemId() { return itemId; }
    public void setItemId(int itemId) { this.itemId = itemId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getItemStatus() { return itemStatus; }
    public void setItemStatus(String itemStatus) { this.itemStatus = itemStatus; }

    public String getDateReported() { return dateReported; }
    public void setDateReported(String dateReported) { this.dateReported = dateReported; }

    public int getUserId() { return userId; }
    public void setUserId(int userId) { this.userId = userId; }

    public int getCategoryId() { return categoryId; }
    public void setCategoryId(int categoryId) { this.categoryId = categoryId; }

    public int getLocationId() { return locationId; }
    public void setLocationId(int locationId) { this.locationId = locationId; }
}
