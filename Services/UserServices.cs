using Punaflow.Models;
using Punaflow.Data;
using System.Collections.Generic;

namespace Punaflow.Services
{
    public class UserService
    {
        private IRepository<User> repository;

        public UserService(IRepository<User> repository)
        {
            this.repository = repository;
        }

        public List<User> GetAllUsers()
        {
            return repository.GetAll();
        }

        public void AddUser(User user)
        {
            repository.Add(user);
            repository.Save();
        }
    }
}