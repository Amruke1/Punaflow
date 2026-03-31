using Punaflow.Data;
using Punaflow.Models;
using System;
using System.Collections.Generic;
using System.Linq;

namespace Punaflow.Services
{
    public class UserServices
    {
        private readonly IRepository<User> repository;

        public UserServices(IRepository<User> repository)
        {
            this.repository = repository;
        }

        public List<User> Listo(string filter = null)
        {
            var users = repository.GetAll();

            if (!string.IsNullOrWhiteSpace(filter))
            {
                filter = filter.ToLower();

                users = users
                    .Where(x => x.Name.ToLower().Contains(filter) ||
                                x.Role.ToLower().Contains(filter))
                    .ToList();
            }

            return users;
        }

        public void Shto(User user)
        {
            if (string.IsNullOrWhiteSpace(user.Name))
                throw new ArgumentException("Emri nuk mund të jetë bosh.");

            if (user.Price <= 0)
                throw new ArgumentException("Çmimi duhet të jetë më i madh se 0.");

            var all = repository.GetAll();
            user.Id = all.Count == 0 ? 1 : all.Max(x => x.Id) + 1;

            repository.Add(user);
            repository.Save();
        }

        public User GjejSipasId(int id)
        {
            return repository.GetById(id);
        }

        public void Perditeso(User user)
        {
            if (string.IsNullOrWhiteSpace(user.Name))
                throw new ArgumentException("Emri nuk mund të jetë bosh.");

            if (user.Price <= 0)
                throw new ArgumentException("Çmimi duhet të jetë më i madh se 0.");

            repository.Update(user);
            repository.Save();
        }

        public void Fshi(int id)
        {
            repository.Delete(id);
            repository.Save();
        }
    }
}