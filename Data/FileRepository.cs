using System.Collections.Generic;
using System.Linq;

namespace Punaflow.Data
{
    public class FileRepository<T> : IRepository<T>
    {
        private List<T> items;

        public FileRepository()
        {
            items = new List<T>();
        }

        public List<T> GetAll()
        {
            return items;
        }

        public T GetById(int id)
        {
            return items.FirstOrDefault();
        }

        public void Add(T item)
        {
            items.Add(item);
        }

        public void Save()
        {
            // optional
        }
    }
}