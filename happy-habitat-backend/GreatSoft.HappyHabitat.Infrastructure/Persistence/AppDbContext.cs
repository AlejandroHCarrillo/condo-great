using GreatSoft.HappyHabitat.Domain.Entities;
using Microsoft.EntityFrameworkCore;


namespace GreatSoft.HappyHabitat.Infrastructure.Persistence
{
    public class AppDbContext : DbContext
    {
        public DbSet<User> Users => Set<User>();
        public DbSet<Group> Groups => Set<Group>();
        public DbSet<Role> Roles => Set<Role>();
        public DbSet<TipoComunidad> TipoComunidades => Set<TipoComunidad>();
        public DbSet<Comunidad> Comunidades => Set<Comunidad>();

        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure User entity
            modelBuilder.Entity<User>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Username).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Email).IsRequired().HasMaxLength(255);
                entity.HasIndex(e => e.Email).IsUnique();
            });

            // Configure Group entity
            modelBuilder.Entity<Group>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
                entity.Property(e => e.Description).HasMaxLength(1000);
            });

            // Configure Role entity
            modelBuilder.Entity<Role>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).IsRequired().HasMaxLength(36); // GUID as string
                entity.Property(e => e.Code).IsRequired().HasMaxLength(50);
                entity.Property(e => e.Description).IsRequired().HasMaxLength(50);
                entity.Property(e => e.IsActive).IsRequired().HasDefaultValue(true);
                entity.HasIndex(e => e.Code).IsUnique();
            });

            // Configure TipoComunidad entity
            modelBuilder.Entity<TipoComunidad>(entity =>
            {
                entity.ToTable("TipoComunidad");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).IsRequired().HasMaxLength(36); // GUID as string
                entity.Property(e => e.Code).IsRequired().HasMaxLength(20);
                entity.Property(e => e.Description).IsRequired().HasMaxLength(50);
                entity.HasIndex(e => e.Code).IsUnique();
            });

            // Configure Comunidad entity
            modelBuilder.Entity<Comunidad>(entity =>
            {
                entity.ToTable("Comunidad");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).IsRequired().HasMaxLength(36); // GUID as string
                entity.Property(e => e.TipoComunidadId).IsRequired().HasMaxLength(36);
                entity.Property(e => e.Nombre).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Ubicacion);
                entity.Property(e => e.Lat).HasColumnType("decimal(18,6)");
                entity.Property(e => e.Lng).HasColumnType("decimal(18,6)");
                entity.Property(e => e.CantidadViviendas).IsRequired();
                entity.Property(e => e.Contacto).HasMaxLength(100);
                entity.Property(e => e.ContactoTelefono).HasMaxLength(50);
                entity.Property(e => e.ContactoEmail).HasMaxLength(100);

                // Foreign Key relationship with TipoComunidad
                entity.HasOne(e => e.TipoComunidad)
                    .WithMany()
                    .HasForeignKey(e => e.TipoComunidadId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // Configure many-to-many relationship between User and Group
            modelBuilder.Entity<User>()
                .HasMany(u => u.Groups)
                .WithMany(g => g.Members)
                .UsingEntity<Dictionary<string, object>>(
                    "UserGroup",
                    j => j.HasOne<Group>().WithMany().HasForeignKey("GroupId"),
                    j => j.HasOne<User>().WithMany().HasForeignKey("UserId"),
                    j =>
                    {
                        j.HasKey("UserId", "GroupId");
                        j.ToTable("UserGroups");
                    });
        }
    }
}
