using Punaflow.Models;
using Punaflow.Services;
using System;

namespace Punaflow.UI
{
    public class Menu
    {
        private readonly UserServices service;

        public Menu(UserServices service)
        {
            this.service = service;
        }

        public void Start()
        {
            while (true)
            {
                Console.WriteLine("\n--- Punaflow Menu ---");
                Console.WriteLine("1. Listo përdoruesit");
                Console.WriteLine("2. Gjej përdorues sipas ID");
                Console.WriteLine("3. Shto përdorues");
                Console.WriteLine("4. Përditëso përdorues");
                Console.WriteLine("5. Fshi përdorues");
                Console.WriteLine("0. Dil");
                Console.Write("Zgjedhja: ");

                var choice = Console.ReadLine();

                switch (choice)
                {
                    case "1":
                        ListUsers();
                        break;
                    case "2":
                        FindById();
                        break;
                    case "3":
                        AddUser();
                        break;
                    case "4":
                        UpdateUser();
                        break;
                    case "5":
                        DeleteUser();
                        break;
                    case "0":
                        return;
                    default:
                        Console.WriteLine("Zgjedhje e pavlefshme.");
                        break;
                }
            }
        }

        private void ListUsers()
        {
            Console.Write("Filter (ose Enter për të gjithë): ");
            var filter = Console.ReadLine();

            var users = service.Listo(filter);

            foreach (var user in users)
            {
                Console.WriteLine(user.Id + " | " + user.Name + " | " + user.Email + " | " + user.Price + "€ | " + user.Role);
            }
        }

        private void FindById()
        {
            Console.Write("ID: ");
            int id;

            if (int.TryParse(Console.ReadLine(), out id))
            {
                var user = service.GjejSipasId(id);

                if (user == null)
                    Console.WriteLine("Përdoruesi nuk u gjet.");
                else
                    Console.WriteLine(user.Id + " | " + user.Name + " | " + user.Email + " | " + user.Price + "€ | " + user.Role);
            }
            else
            {
                Console.WriteLine("ID jo valide.");
            }
        }

        private void AddUser()
        {
            try
            {
                var user = new User();

                Console.Write("Emri: ");
                user.Name = Console.ReadLine();

                Console.Write("Email: ");
                user.Email = Console.ReadLine();

                Console.Write("Çmimi: ");
                user.Price = decimal.Parse(Console.ReadLine() ?? "0");

                Console.Write("Roli: ");
                user.Role = Console.ReadLine();

                service.Shto(user);
                Console.WriteLine("Përdoruesi u shtua me sukses.");
            }
            catch (Exception ex)
            {
                Console.WriteLine("Gabim: " + ex.Message);
            }
        }

        private void UpdateUser()
        {
            try
            {
                Console.Write("ID e përdoruesit për përditësim: ");
                int id = int.Parse(Console.ReadLine() ?? "0");

                var existing = service.GjejSipasId(id);

                if (existing == null)
                {
                    Console.WriteLine("Përdoruesi nuk u gjet.");
                    return;
                }

                Console.Write("Emri i ri: ");
                existing.Name = Console.ReadLine();

                Console.Write("Email i ri: ");
                existing.Email = Console.ReadLine();

                Console.Write("Çmimi i ri: ");
                existing.Price = decimal.Parse(Console.ReadLine() ?? "0");

                Console.Write("Roli i ri: ");
                existing.Role = Console.ReadLine();

                service.Perditeso(existing);
                Console.WriteLine("Përdoruesi u përditësua me sukses.");
            }
            catch (Exception ex)
            {
                Console.WriteLine("Gabim: " + ex.Message);
            }
        }

        private void DeleteUser()
        {
            Console.Write("ID e përdoruesit për fshirje: ");
            int id;

            if (int.TryParse(Console.ReadLine(), out id))
            {
                service.Fshi(id);
                Console.WriteLine("Përdoruesi u fshi me sukses.");
            }
            else
            {
                Console.WriteLine("ID jo valide.");
            }
        }
    }
}