namespace GreatSoft.HappyHabitat.Domain.Entities;

public class Comunidad
{
    public string Id { get; private set; } = Guid.NewGuid().ToString();
    public string TipoComunidadId { get; private set; }
    public TipoComunidad TipoComunidad { get; private set; }
    public string Nombre { get; private set; }
    public string Ubicacion { get; private set; }
    public decimal Lat { get; private set; }
    public decimal Lng { get; private set; }
    public int CantidadViviendas { get; private set; }
    public string Contacto { get; private set; }
    public string ContactoTelefono { get; private set; }
    public string ContactoEmail { get; private set; }

    // Protected parameterless constructor for EF Core
    protected Comunidad() { }

    public Comunidad(
        string tipoComunidadId,
        string nombre,
        string ubicacion,
        decimal lat,
        decimal lng,
        int cantidadViviendas,
        string contacto,
        string contactoTelefono,
        string contactoEmail)
    {
        if (string.IsNullOrWhiteSpace(tipoComunidadId))
            throw new ArgumentException("TipoComunidadId cannot be null or empty", nameof(tipoComunidadId));

        if (string.IsNullOrWhiteSpace(nombre))
            throw new ArgumentException("Nombre cannot be null or empty", nameof(nombre));

        if (nombre.Length > 100)
            throw new ArgumentException("Nombre cannot exceed 100 characters", nameof(nombre));

        if (cantidadViviendas < 0 || cantidadViviendas > 10000)
            throw new ArgumentException("CantidadViviendas must be between 0 and 10000", nameof(cantidadViviendas));

        if (contacto != null && contacto.Length > 100)
            throw new ArgumentException("Contacto cannot exceed 100 characters", nameof(contacto));

        if (contactoTelefono != null && contactoTelefono.Length > 50)
            throw new ArgumentException("ContactoTelefono cannot exceed 50 characters", nameof(contactoTelefono));

        if (contactoEmail != null && contactoEmail.Length > 100)
            throw new ArgumentException("ContactoEmail cannot exceed 100 characters", nameof(contactoEmail));

        if (contactoEmail != null && !IsValidEmail(contactoEmail))
            throw new ArgumentException("Invalid email format", nameof(contactoEmail));

        TipoComunidadId = tipoComunidadId;
        Nombre = nombre;
        Ubicacion = ubicacion ?? string.Empty;
        Lat = lat;
        Lng = lng;
        CantidadViviendas = cantidadViviendas;
        Contacto = contacto ?? string.Empty;
        ContactoTelefono = contactoTelefono ?? string.Empty;
        ContactoEmail = contactoEmail ?? string.Empty;
    }

    public void UpdateNombre(string nombre)
    {
        if (string.IsNullOrWhiteSpace(nombre))
            throw new ArgumentException("Nombre cannot be null or empty", nameof(nombre));

        if (nombre.Length > 100)
            throw new ArgumentException("Nombre cannot exceed 100 characters", nameof(nombre));

        Nombre = nombre;
    }

    public void UpdateUbicacion(string ubicacion)
    {
        Ubicacion = ubicacion ?? string.Empty;
    }

    public void UpdateCoordenadas(decimal lat, decimal lng)
    {
        Lat = lat;
        Lng = lng;
    }

    public void UpdateCantidadViviendas(int cantidadViviendas)
    {
        if (cantidadViviendas < 0 || cantidadViviendas > 10000)
            throw new ArgumentException("CantidadViviendas must be between 0 and 10000", nameof(cantidadViviendas));

        CantidadViviendas = cantidadViviendas;
    }

    public void UpdateContacto(string contacto, string contactoTelefono, string contactoEmail)
    {
        if (contacto != null && contacto.Length > 100)
            throw new ArgumentException("Contacto cannot exceed 100 characters", nameof(contacto));

        if (contactoTelefono != null && contactoTelefono.Length > 50)
            throw new ArgumentException("ContactoTelefono cannot exceed 50 characters", nameof(contactoTelefono));

        if (contactoEmail != null && contactoEmail.Length > 100)
            throw new ArgumentException("ContactoEmail cannot exceed 100 characters", nameof(contactoEmail));

        if (contactoEmail != null && !string.IsNullOrWhiteSpace(contactoEmail) && !IsValidEmail(contactoEmail))
            throw new ArgumentException("Invalid email format", nameof(contactoEmail));

        Contacto = contacto ?? string.Empty;
        ContactoTelefono = contactoTelefono ?? string.Empty;
        ContactoEmail = contactoEmail ?? string.Empty;
    }

    public void ChangeTipoComunidad(string tipoComunidadId)
    {
        if (string.IsNullOrWhiteSpace(tipoComunidadId))
            throw new ArgumentException("TipoComunidadId cannot be null or empty", nameof(tipoComunidadId));

        TipoComunidadId = tipoComunidadId;
    }

    private static bool IsValidEmail(string email)
    {
        if (string.IsNullOrWhiteSpace(email))
            return false;

        try
        {
            var emailRegex = new System.Text.RegularExpressions.Regex(@"^[^@\s]+@[^@\s]+\.[^@\s]+$", System.Text.RegularExpressions.RegexOptions.IgnoreCase);
            return emailRegex.IsMatch(email);
        }
        catch
        {
            return false;
        }
    }
}


