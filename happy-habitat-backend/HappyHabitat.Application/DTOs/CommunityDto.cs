namespace HappyHabitat.Application.DTOs;

public class CommunityDto
{
    public string Id { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public string Descripcion { get; set; } = string.Empty;
    public string Direccion { get; set; } = string.Empty;
    public string Contacto { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string TipoComunidad { get; set; } = string.Empty;
    public double? Latitud { get; set; }
    public double? Longitud { get; set; }
    public int CantidadViviendas { get; set; }
}

public class CreateCommunityDto
{
    public string Nombre { get; set; } = string.Empty;
    public string Descripcion { get; set; } = string.Empty;
    public string Direccion { get; set; } = string.Empty;
    public string Contacto { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string TipoComunidad { get; set; } = string.Empty;
    public double? Latitud { get; set; }
    public double? Longitud { get; set; }
    public int CantidadViviendas { get; set; }
}

public class UpdateCommunityDto
{
    public string Nombre { get; set; } = string.Empty;
    public string Descripcion { get; set; } = string.Empty;
    public string Direccion { get; set; } = string.Empty;
    public string Contacto { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string TipoComunidad { get; set; } = string.Empty;
    public double? Latitud { get; set; }
    public double? Longitud { get; set; }
    public int CantidadViviendas { get; set; }
}

