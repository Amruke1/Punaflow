namespace Punaflow.Models
{
    public class User
    {
        private int id;
        private string name;
        private string email;
        private string role;

        public User(int id, string name, string email, string role)
        {
            this.id = id;
            this.name = name;
            this.email = email;
            this.role = role;
        }

        public int GetId() => id;
        public string GetName() => name;
        public string GetEmail() => email;
        public string GetRole() => role;
    }
}