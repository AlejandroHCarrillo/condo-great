using Microsoft.EntityFrameworkCore;
using HappyHabitat.Domain.Entities;

namespace HappyHabitat.Infrastructure.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<Role> Roles { get; set; }
    public DbSet<User> Users { get; set; }
    public DbSet<Resident> Residents { get; set; }
    public DbSet<VehicleType> VehicleTypes { get; set; }
    public DbSet<Vehicle> Vehicles { get; set; }
    public DbSet<Pet> Pets { get; set; }
    public DbSet<ResidentVisit> ResidentVisits { get; set; }
    public DbSet<Community> Communities { get; set; }
    public DbSet<Banner> Banners { get; set; }
    public DbSet<Comunicado> Comunicados { get; set; }
    public DbSet<UserCommunity> UserCommunities { get; set; }
    public DbSet<Contrato> Contratos { get; set; }
    public DbSet<PaymentHistory> PaymentHistories { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure Role entity
        modelBuilder.Entity<Role>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Code)
                .IsRequired()
                .HasMaxLength(15);
            entity.Property(e => e.Description)
                .IsRequired()
                .HasMaxLength(50);
        });

        // Configure User entity
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.FirstName)
                .IsRequired()
                .HasMaxLength(50);
            entity.Property(e => e.LastName)
                .IsRequired()
                .HasMaxLength(50);
            entity.Property(e => e.Username)
                .IsRequired()
                .HasMaxLength(15);
            entity.Property(e => e.Email)
                .IsRequired()
                .HasMaxLength(100);
            entity.Property(e => e.Password)
                .IsRequired()
                .HasMaxLength(255); // Increased to accommodate BCrypt hash (60+ characters)
            entity.Property(e => e.CreatedAt)
                .IsRequired();
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true);

            // Configure relationship with Role
            entity.HasOne(e => e.Role)
                .WithMany(r => r.Users)
                .HasForeignKey(e => e.RoleId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // Configure Resident entity
        modelBuilder.Entity<Resident>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.FullName)
                .IsRequired()
                .HasMaxLength(100);
            entity.Property(e => e.Email)
                .HasMaxLength(100);
            entity.Property(e => e.Phone)
                .HasMaxLength(20);
            entity.Property(e => e.Number)
                .HasMaxLength(20);
            entity.Property(e => e.Address)
                .IsRequired()
                .HasMaxLength(200);
            entity.Property(e => e.CreatedAt)
                .IsRequired();

            // Configure relationship with User
            entity.HasOne(e => e.User)
                .WithOne(u => u.Resident)
                .HasForeignKey<Resident>(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // Configure relationship with Community
            entity.HasOne(e => e.Community)
                .WithMany(c => c.Residents)
                .HasForeignKey(e => e.CommunityId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        // Configure VehicleType entity
        modelBuilder.Entity<VehicleType>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name)
                .IsRequired()
                .HasMaxLength(50);
            entity.Property(e => e.Description)
                .HasMaxLength(200);
        });

        // Configure Vehicle entity
        modelBuilder.Entity<Vehicle>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Brand)
                .IsRequired()
                .HasMaxLength(50);
            entity.Property(e => e.Model)
                .IsRequired()
                .HasMaxLength(50);
            entity.Property(e => e.Color)
                .IsRequired()
                .HasMaxLength(30);
            entity.Property(e => e.LicensePlate)
                .IsRequired()
                .HasMaxLength(20);
            entity.Property(e => e.CreatedAt)
                .IsRequired();

            // Configure relationships
            entity.HasOne(e => e.Resident)
                .WithMany(r => r.Vehicles)
                .HasForeignKey(e => e.ResidentId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.VehicleType)
                .WithMany(vt => vt.Vehicles)
                .HasForeignKey(e => e.VehicleTypeId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // Configure Pet entity
        modelBuilder.Entity<Pet>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name)
                .IsRequired()
                .HasMaxLength(50);
            entity.Property(e => e.Species)
                .IsRequired()
                .HasMaxLength(50);
            entity.Property(e => e.Breed)
                .IsRequired()
                .HasMaxLength(50);
            entity.Property(e => e.Color)
                .IsRequired()
                .HasMaxLength(30);
            entity.Property(e => e.CreatedAt)
                .IsRequired();

            // Configure relationship
            entity.HasOne(e => e.Resident)
                .WithMany(r => r.Pets)
                .HasForeignKey(e => e.ResidentId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Configure ResidentVisit entity
        modelBuilder.Entity<ResidentVisit>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.VisitorName)
                .IsRequired()
                .HasMaxLength(100);
            entity.Property(e => e.VehicleColor)
                .HasMaxLength(30);
            entity.Property(e => e.LicensePlate)
                .HasMaxLength(20);
            entity.Property(e => e.Subject)
                .IsRequired()
                .HasMaxLength(200);
            entity.Property(e => e.ArrivalDate)
                .IsRequired();
            entity.Property(e => e.CreatedAt)
                .IsRequired();

            // Configure relationship
            entity.HasOne(e => e.Resident)
                .WithMany(r => r.Visits)
                .HasForeignKey(e => e.ResidentId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Configure Community entity
        modelBuilder.Entity<Community>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Nombre)
                .IsRequired()
                .HasMaxLength(100);
            entity.Property(e => e.Descripcion)
                .HasMaxLength(500);
            entity.Property(e => e.Direccion)
                .IsRequired()
                .HasMaxLength(200);
            entity.Property(e => e.Contacto)
                .IsRequired()
                .HasMaxLength(100);
            entity.Property(e => e.Email)
                .IsRequired()
                .HasMaxLength(100);
            entity.Property(e => e.Phone)
                .IsRequired()
                .HasMaxLength(20);
            entity.Property(e => e.TipoComunidad)
                .HasMaxLength(50);
            entity.Property(e => e.Latitud)
                .HasColumnType("float");
            entity.Property(e => e.Longitud)
                .HasColumnType("float");
            entity.Property(e => e.CantidadViviendas)
                .HasDefaultValue(0);
            entity.Property(e => e.CreatedAt)
                .IsRequired();
        });

        // Configure Banner entity
        modelBuilder.Entity<Banner>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.PathImagen)
                .IsRequired()
                .HasMaxLength(500);
            entity.Property(e => e.Title)
                .IsRequired()
                .HasMaxLength(200);
            entity.Property(e => e.Text)
                .HasMaxLength(1000);
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true);
            entity.Property(e => e.StartDate)
                .HasMaxLength(50);
            entity.Property(e => e.EndDate)
                .HasMaxLength(50);
            entity.Property(e => e.CreatedAt)
                .IsRequired();

            // Configure relationship with Community
            entity.HasOne(e => e.Community)
                .WithMany(c => c.Banners)
                .HasForeignKey(e => e.CommunityId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        // Configure Comunicado entity
        modelBuilder.Entity<Comunicado>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Titulo)
                .IsRequired()
                .HasMaxLength(200);
            entity.Property(e => e.Subtitulo)
                .HasMaxLength(200);
            entity.Property(e => e.Descripcion)
                .HasMaxLength(2000);
            entity.Property(e => e.Fecha)
                .IsRequired()
                .HasColumnType("datetime2");
            entity.Property(e => e.Imagen)
                .HasMaxLength(500);
            entity.Property(e => e.CreatedAt)
                .IsRequired();

            // Configure relationship with Community
            entity.HasOne(e => e.Community)
                .WithMany(c => c.Comunicados)
                .HasForeignKey(e => e.CommunityId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        // Configure UserCommunity entity
        modelBuilder.Entity<UserCommunity>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.CreatedAt)
                .IsRequired();

            // Configure relationship with User
            entity.HasOne(e => e.User)
                .WithMany(u => u.UserCommunities)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // Configure relationship with Community
            entity.HasOne(e => e.Community)
                .WithMany(c => c.UserCommunities)
                .HasForeignKey(e => e.CommunityId)
                .OnDelete(DeleteBehavior.Cascade);

            // Create unique index to prevent duplicate associations
            entity.HasIndex(e => new { e.UserId, e.CommunityId })
                .IsUnique();
        });

        // Configure Contrato entity
        modelBuilder.Entity<Contrato>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.TipoContrato)
                .IsRequired()
                .HasMaxLength(50); // estandar, prueba, promocion, cliente
            entity.Property(e => e.FolioContrato)
                .IsRequired()
                .HasMaxLength(100);
            entity.Property(e => e.RepresentanteComunidad)
                .IsRequired()
                .HasMaxLength(200);
            entity.Property(e => e.CostoTotal)
                .IsRequired()
                .HasColumnType("decimal(18,2)");
            entity.Property(e => e.MontoPagoParcial)
                .IsRequired()
                .HasColumnType("decimal(18,2)");
            entity.Property(e => e.NumeroPagosParciales)
                .IsRequired();
            entity.Property(e => e.DiaPago)
                .IsRequired();
            entity.Property(e => e.PeriodicidadPago)
                .IsRequired()
                .HasMaxLength(50); // mensual, trimestral, anual
            entity.Property(e => e.MetodoPago)
                .IsRequired()
                .HasMaxLength(50); // transferencia, tarjeta, efectivo, etc.
            entity.Property(e => e.FechaFirma)
                .IsRequired();
            entity.Property(e => e.FechaInicio)
                .IsRequired();
            entity.Property(e => e.FechaFin)
                .HasMaxLength(50);
            entity.Property(e => e.EstadoContrato)
                .IsRequired()
                .HasMaxLength(50); // activo, vencido, cancelado, en renovación
            entity.Property(e => e.AsesorVentas)
                .HasMaxLength(200);
            entity.Property(e => e.Notas)
                .HasMaxLength(2000);
            entity.Property(e => e.DocumentosAdjuntos)
                .HasMaxLength(500);
            entity.Property(e => e.CreatedAt)
                .IsRequired();
            entity.Property(e => e.UpdatedAt)
                .HasMaxLength(50);
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true);

            // Configure relationship with Community
            entity.HasOne(e => e.Community)
                .WithMany(c => c.Contratos)
                .HasForeignKey(e => e.CommunityId)
                .OnDelete(DeleteBehavior.Restrict);

            // Configure relationship with User (UpdatedByUser)
            entity.HasOne(e => e.UpdatedByUser)
                .WithMany(u => u.UpdatedContratos)
                .HasForeignKey(e => e.UpdatedByUserId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        // Configure PaymentHistory entity
        modelBuilder.Entity<PaymentHistory>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Monto)
                .IsRequired()
                .HasColumnType("decimal(18,2)");
            entity.Property(e => e.FechaPago)
                .IsRequired();
            entity.Property(e => e.MetodoPago)
                .IsRequired()
                .HasMaxLength(50);
            entity.Property(e => e.ReferenciaPago)
                .HasMaxLength(200);
            entity.Property(e => e.EstadoPago)
                .IsRequired()
                .HasMaxLength(50); // pendiente, pagado, cancelado, reembolsado
            entity.Property(e => e.Notas)
                .HasMaxLength(1000);
            entity.Property(e => e.CreatedAt)
                .IsRequired();
            entity.Property(e => e.UpdatedAt)
                .HasMaxLength(50);
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true);

            // Configure relationship with Contrato
            entity.HasOne(e => e.Contrato)
                .WithMany(c => c.PaymentHistories)
                .HasForeignKey(e => e.ContratoId)
                .OnDelete(DeleteBehavior.Cascade);

            // Configure relationship with User (UpdatedByUser)
            entity.HasOne(e => e.UpdatedByUser)
                .WithMany(u => u.UpdatedPaymentHistories)
                .HasForeignKey(e => e.UpdatedByUserId)
                .OnDelete(DeleteBehavior.SetNull);
        });
    }
}
