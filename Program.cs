using Punaflow.Data;
using Punaflow.Models;
using Punaflow.Services;
using Punaflow.UI;

namespace Punaflow
{
    class Program
    {
        static void Main(string[] args)
        {
            IRepository<User> repository = new FileRepository("Data/users.csv");
            UserServices service = new UserServices(repository);
            Menu menu = new Menu(service);

            menu.Start();
        }
    }
}