/**
 * Represents a Location where items are found/lost
 */
public class Location {
    private int locationId;
    private String locationName;

    public Location(int locationId, String locationName) {
        this.locationId = locationId;
        this.locationName = locationName;
    }

    public int getLocationId() { return locationId; }
    public String getLocationName() { return locationName; }

    @Override
    public String toString() {
        return locationName;
    }
}
