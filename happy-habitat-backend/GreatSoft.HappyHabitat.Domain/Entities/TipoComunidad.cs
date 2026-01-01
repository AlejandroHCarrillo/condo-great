namespace GreatSoft.HappyHabitat.Domain.Entities;

public class TipoComunidad
{
    public string Id { get; private set; } = Guid.NewGuid().ToString();
    public string Code { get; private set; }
    public string Description { get; private set; }

    // Protected parameterless constructor for EF Core
    protected TipoComunidad() { }

    public TipoComunidad(string code, string description)
    {
        if (string.IsNullOrWhiteSpace(code))
            throw new ArgumentException("TipoComunidad code cannot be null or empty", nameof(code));

        if (code.Length > 20)
            throw new ArgumentException("TipoComunidad code cannot exceed 20 characters", nameof(code));

        if (string.IsNullOrWhiteSpace(description))
            throw new ArgumentException("TipoComunidad description cannot be null or empty", nameof(description));

        if (description.Length > 50)
            throw new ArgumentException("TipoComunidad description cannot exceed 50 characters", nameof(description));

        Code = code;
        Description = description;
    }

    public void UpdateCode(string code)
    {
        if (string.IsNullOrWhiteSpace(code))
            throw new ArgumentException("TipoComunidad code cannot be null or empty", nameof(code));

        if (code.Length > 20)
            throw new ArgumentException("TipoComunidad code cannot exceed 20 characters", nameof(code));

        Code = code;
    }

    public void UpdateDescription(string description)
    {
        if (string.IsNullOrWhiteSpace(description))
            throw new ArgumentException("TipoComunidad description cannot be null or empty", nameof(description));

        if (description.Length > 50)
            throw new ArgumentException("TipoComunidad description cannot exceed 50 characters", nameof(description));

        Description = description;
    }
}


