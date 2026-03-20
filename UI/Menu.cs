using Punaflow.Models;
using Punaflow.Services;
using Punaflow.Data;
using System;

namespace Punaflow.UI
{
    public class Menu
    {
        public void Start()
        {
            var repo = new FileRepository<User>();
            var service = new UserService(repo);

            service.AddUser(new User(1, "Amra", "amra@test.com", "Worker"));

            var users = service.GetAllUsers();

            foreach (var user in users)
            {
                Console.WriteLine(user.GetName());
            }
        }
    }
}