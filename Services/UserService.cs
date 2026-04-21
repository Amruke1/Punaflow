using Punaflow.Data;
using Punaflow.Models;
using System;
using System.Collections.Generic;
using System.Linq;

namespace Punaflow.Services
{
    public class UserService
    {
        private readonly IRepository<User> repository;

        public UserService(IRepository<User> repository)
        {
            this.repository = repository;
        }

        public List<User> Listo(string filter = null)
        {
            var users = repository.GetAll();

            if (!string.IsNullOrWhiteSpace(filter))
            {
                filter = filter.Trim().ToLower();

                users = users
                    .Where(x =>
                        (!string.IsNullOrWhiteSpace(x.Name) && x.Name.ToLower().Contains(filter)) ||
                        (!string.IsNullOrWhiteSpace(x.Role) && x.Role.ToLower().Contains(filter)))
                    .ToList();
            }

            return users;
        }

        public void Shto(User user)
        {
            ValidateUser(user);

            var all = repository.GetAll();
            user.Id = all.Count == 0 ? 1 : all.Max(x => x.Id) + 1;

            user.Name = user.Name.Trim();
            user.Email = user.Email.Trim();
            user.Role = user.Role.Trim();

            repository.Add(user);
            repository.Save();
        }

        public User GjejSipasId(int id)
        {
            return repository.GetById(id);
        }

        public void Perditeso(User user)
        {
            var existing = repository.GetById(user.Id);

            if (existing == null)
                throw new ArgumentException("Përdoruesi me këtë ID nuk ekziston.");

            ValidateUser(user);

            user.Name = user.Name.Trim();
            user.Email = user.Email.Trim();
            user.Role = user.Role.Trim();

            repository.Update(user);
            repository.Save();
        }

        public void Fshi(int id)
        {
            var existing = repository.GetById(id);

            if (existing == null)
                throw new ArgumentException("Përdoruesi me këtë ID nuk ekziston.");

            repository.Delete(id);
            repository.Save();
        }

        private void ValidateUser(User user)
        {
            if (user == null)
                throw new ArgumentException("Përdoruesi nuk mund të jetë null.");

            if (string.IsNullOrWhiteSpace(user.Name))
                throw new ArgumentException("Emri nuk mund të jetë bosh.");

            if (string.IsNullOrWhiteSpace(user.Email) || !user.Email.Contains("@"))
                throw new ArgumentException("Email jo valid.");

            if (user.Price <= 0)
                throw new ArgumentException("Çmimi duhet të jetë më i madh se 0.");

            if (string.IsNullOrWhiteSpace(user.Role))
                throw new ArgumentException("Roli nuk mund të jetë bosh.");
        }
    }
}