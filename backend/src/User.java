public abstract class User {
    private int userId;
    private String fullName;
    private String email;
    private String phone;
    private String password;
    private String userRole;
    public User(String fullName, String email, String phone, String password, String userRole) {
        this.fullName = fullName;
        this.email = email;
        this.phone = phone;
        this.password = password;
        this.userRole = userRole;
    }
    public int getUserId() {
        return userId;
    }
    public void setUserId(int userId) {
        this.userId = userId;
    }
    public String getFullName() {
        return fullName;
    }
    public String getEmail() {
        return email;
    }
    public String getPhone() {
        return phone;
    }
    public String getPassword() {
        return password;
    }
    public String getUserRole() {
        return userRole;
    }
}
