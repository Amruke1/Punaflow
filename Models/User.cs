namespace Punaflow.Models
{
    public class User
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Email { get; set; }
        public decimal Price { get; set; }
        public string Role { get; set; }

        public User()
        {
            Name = "";
            Email = "";
            Role = "";
        }

        public User(int id, string name, string email, decimal price, string role)
        {
            Id = id;
            Name = name;
            Email = email;
            Price = price;
            Role = role;
        }
    }
}