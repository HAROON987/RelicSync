/**
 * Represents a Category for items (Electronics, Keys, Documents, etc.)
 */
public class Category {
    private int categoryId;
    private String categoryName;

    public Category(int categoryId, String categoryName) {
        this.categoryId = categoryId;
        this.categoryName = categoryName;
    }

    public int getCategoryId() { return categoryId; }
    public String getCategoryName() { return categoryName; }

    @Override
    public String toString() {
        return categoryName;
    }
}