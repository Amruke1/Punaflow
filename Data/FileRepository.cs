using Punaflow.Models;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;

namespace Punaflow.Data
{
    public class FileRepository : IRepository<User>
    {
        private readonly string filePath;
        private List<User> items;

        public FileRepository(string filePath)
        {
            this.filePath = filePath;
            items = LoadFromFile();
        }

        private List<User> LoadFromFile()
        {
            var users = new List<User>();

            if (!File.Exists(filePath))
                return users;

            var lines = File.ReadAllLines(filePath).Skip(1);

            foreach (var line in lines)
            {
                if (string.IsNullOrWhiteSpace(line))
                    continue;

                var parts = line.Split(',');

                if (parts.Length < 5)
                    continue;

                if (!int.TryParse(parts[0], out int id))
                    continue;

                if (!decimal.TryParse(parts[3], NumberStyles.Any, CultureInfo.InvariantCulture, out decimal price))
                    continue;

                users.Add(new User(
                    id,
                    parts[1],
                    parts[2],
                    price,
                    parts[4]
                ));
            }

            return users;
        }

        public List<User> GetAll()
        {
            return items;
        }

        public User GetById(int id)
        {
            return items.FirstOrDefault(x => x.Id == id);
        }

        public void Add(User item)
        {
            items.Add(item);
        }

        public void Update(User item)
        {
            var existing = items.FirstOrDefault(x => x.Id == item.Id);

            if (existing != null)
            {
                existing.Name = item.Name;
                existing.Email = item.Email;
                existing.Price = item.Price;
                existing.Role = item.Role;
            }
        }

        public void Delete(int id)
        {
            var existing = items.FirstOrDefault(x => x.Id == id);

            if (existing != null)
            {
                items.Remove(existing);
            }
        }

        public void Save()
        {
            var lines = new List<string>
            {
                "Id,Name,Email,Price,Role"
            };

            lines.AddRange(items.Select(x =>
                string.Format("{0},{1},{2},{3},{4}",
                    x.Id,
                    x.Name,
                    x.Email,
                    x.Price.ToString(CultureInfo.InvariantCulture),
                    x.Role)));

            File.WriteAllLines(filePath, lines);
        }
    }
}