using System.Text.RegularExpressions;

namespace GreatSoft.HappyHabitat.Domain.Entities;
public class User
{
    public Guid Id { get; private set; } = Guid.NewGuid();
    public string Username { get; private set; }
    public string Email { get; private set; }

    public ICollection<Group> Groups { get; private set; } = new List<Group>();

    public User(string username, string email)
    {
        Username = username;
        Email = email;
    }
}
