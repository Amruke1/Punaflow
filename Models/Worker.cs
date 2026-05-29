namespace Punaflow.Models;

public class Worker
{
    public int Id { get; set; }
    public string FullName { get; set; } = "";
    public string Email { get; set; } = "";
    public string Skill { get; set; } = "";
    public string Location { get; set; } = "";
    public decimal HourlyRate { get; set; }
}