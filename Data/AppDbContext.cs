using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;
using Punaflow.Models;

namespace Punaflow.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<Worker> Workers => Set<Worker>();
}