namespace GreatSoft.HappyHabitat.Domain.Entities;

public class Role
{
    public string Id { get; private set; } = Guid.NewGuid().ToString();
    public string Code { get; private set; }
    public string Description { get; private set; }
    public bool IsActive { get; private set; } = true;

    // Protected parameterless constructor for EF Core
    protected Role() { }

    public Role(string code, string description, bool isActive = true)
    {
        if (string.IsNullOrWhiteSpace(code))
            throw new ArgumentException("Role code cannot be null or empty", nameof(code));

        if (code.Length > 50)
            throw new ArgumentException("Role code cannot exceed 50 characters", nameof(code));

        if (string.IsNullOrWhiteSpace(description))
            throw new ArgumentException("Role description cannot be null or empty", nameof(description));

        if (description.Length > 50)
            throw new ArgumentException("Role description cannot exceed 50 characters", nameof(description));

        Code = code;
        Description = description;
        IsActive = isActive;
    }

    public void UpdateCode(string code)
    {
        if (string.IsNullOrWhiteSpace(code))
            throw new ArgumentException("Role code cannot be null or empty", nameof(code));

        if (code.Length > 50)
            throw new ArgumentException("Role code cannot exceed 50 characters", nameof(code));

        Code = code;
    }

    public void UpdateDescription(string description)
    {
        if (string.IsNullOrWhiteSpace(description))
            throw new ArgumentException("Role description cannot be null or empty", nameof(description));

        if (description.Length > 50)
            throw new ArgumentException("Role description cannot exceed 50 characters", nameof(description));

        Description = description;
    }

    public void Activate()
    {
        IsActive = true;
    }

    public void Deactivate()
    {
        IsActive = false;
    }
}


