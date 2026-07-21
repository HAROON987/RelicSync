public class Admin extends User {
    public Admin(String fullName, String email, String phone, String password) {
        super(fullName, email, phone, password,"Admin");
    }    
}