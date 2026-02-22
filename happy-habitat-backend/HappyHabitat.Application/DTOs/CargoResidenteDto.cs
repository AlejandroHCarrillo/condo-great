namespace HappyHabitat.Application.DTOs;

public class CargoResidenteDto
{
    public Guid Id { get; set; }
    public Guid ResidentId { get; set; }
    public string? ResidentName { get; set; }
    public string? ResidentNumber { get; set; }
    public DateTime Fecha { get; set; }
    public string Descripcion { get; set; } = string.Empty;
    public decimal Monto { get; set; }
    public string Estatus { get; set; } = string.Empty; // Activo, Cancelado, Pagado, Pago Parcial
    public string CreatedAt { get; set; } = string.Empty;
    public string? UpdatedAt { get; set; }
    public Guid? CreatedByUserId { get; set; }
    public Guid? UpdatedByUserId { get; set; }
}

public class CreateCargoResidenteDto
{
    public Guid ResidentId { get; set; }
    public DateTime Fecha { get; set; }
    public string Descripcion { get; set; } = string.Empty;
    public decimal Monto { get; set; }
    public string Estatus { get; set; } = "Activo";
    public Guid? CreatedByUserId { get; set; }
}

public class UpdateCargoResidenteDto
{
    public Guid ResidentId { get; set; }
    public DateTime Fecha { get; set; }
    public string Descripcion { get; set; } = string.Empty;
    public decimal Monto { get; set; }
    public string Estatus { get; set; } = string.Empty;
    public Guid? UpdatedByUserId { get; set; }
}
