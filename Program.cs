using Microsoft.EntityFrameworkCore;
using Punaflow.Data;
using Punaflow.Models;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite("Data Source=punaflow.db"));

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod());
});

var app = builder.Build();

app.UseCors("AllowAll");

app.UseDefaultFiles();
app.UseStaticFiles();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.EnsureCreated();

    if (!db.Workers.Any())
    {
        db.Workers.AddRange(
            new Worker { FullName = "Amra Neziri", Email = "amra@email.com", Skill = "Marketing", Location = "Prishtina", HourlyRate = 20 },
            new Worker { FullName = "Arben Krasniqi", Email = "arben@email.com", Skill = "Electrician", Location = "Prizren", HourlyRate = 15 },
            new Worker { FullName = "Elira Gashi", Email = "elira@email.com", Skill = "Designer", Location = "Peja", HourlyRate = 25 }
        );

        db.SaveChanges();
    }
}

app.MapGet("/api/workers", async (AppDbContext db) =>
    await db.Workers.ToListAsync());

app.MapGet("/api/workers/{id}", async (int id, AppDbContext db) =>
{
    var worker = await db.Workers.FindAsync(id);
    return worker is null ? Results.NotFound() : Results.Ok(worker);
});

app.MapPost("/api/workers", async (Worker worker, AppDbContext db) =>
{
    db.Workers.Add(worker);
    await db.SaveChangesAsync();
    return Results.Created($"/api/workers/{worker.Id}", worker);
});

app.MapPut("/api/workers/{id}", async (int id, Worker updatedWorker, AppDbContext db) =>
{
    var worker = await db.Workers.FindAsync(id);

    if (worker is null)
        return Results.NotFound();

    worker.FullName = updatedWorker.FullName;
    worker.Email = updatedWorker.Email;
    worker.Skill = updatedWorker.Skill;
    worker.Location = updatedWorker.Location;
    worker.HourlyRate = updatedWorker.HourlyRate;

    await db.SaveChangesAsync();

    return Results.Ok(worker);
});

app.MapDelete("/api/workers/{id}", async (int id, AppDbContext db) =>
{
    var worker = await db.Workers.FindAsync(id);

    if (worker is null)
        return Results.NotFound();

    db.Workers.Remove(worker);
    await db.SaveChangesAsync();

    return Results.Ok();
});

app.Run();