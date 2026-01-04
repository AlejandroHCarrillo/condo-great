using Microsoft.EntityFrameworkCore;
using HappyHabitat.Domain.Entities;
using HappyHabitat.Infrastructure.Data;
using HappyHabitat.Infrastructure.Services;

namespace HappyHabitat.Infrastructure.Seeders;

public class DummySeeder : IDataSeeder
{
    private readonly ApplicationDbContext _context;
    private readonly IPasswordHasherService _passwordHasher;

    public DummySeeder(ApplicationDbContext context, IPasswordHasherService passwordHasher)
    {
        _context = context;
        _passwordHasher = passwordHasher;
    }

    public async Task SeedAsync()
    {
        // Get role IDs
        var adminCompanyRoleId = new Guid("22222222-2222-2222-2222-222222222222");
        var comiteeMemberRoleId = new Guid("33333333-3333-3333-3333-333333333333");
        var residentRoleId = new Guid("44444444-4444-4444-4444-444444444444");
        var renterRoleId = new Guid("55555555-5555-5555-5555-555555555555");
        var vigilanceRoleId = new Guid("66666666-6666-6666-6666-666666666666");

        // Create dummy users for testing
        var dummyUsers = new List<User>();

        // Admin Company users
        if (!await _context.Users.AnyAsync(u => u.Username == "admin1"))
        {
            dummyUsers.Add(new User
            {
                Id = Guid.NewGuid(),
                RoleId = adminCompanyRoleId,
                Username = "admin1",
                Password = _passwordHasher.HashPassword("password123"),
                IsActive = true,
                CreatedAt = DateTime.UtcNow.ToString("O")
            });
        }

        // Committee Member users
        if (!await _context.Users.AnyAsync(u => u.Username == "committee1"))
        {
            dummyUsers.Add(new User
            {
                Id = Guid.NewGuid(),
                RoleId = comiteeMemberRoleId,
                Username = "committee1",
                Password = _passwordHasher.HashPassword("password123"),
                IsActive = true,
                CreatedAt = DateTime.UtcNow.ToString("O")
            });
        }

        if (!await _context.Users.AnyAsync(u => u.Username == "committee2"))
        {
            dummyUsers.Add(new User
            {
                Id = Guid.NewGuid(),
                RoleId = comiteeMemberRoleId,
                Username = "committee2",
                Password = _passwordHasher.HashPassword("password123"),
                IsActive = true,
                CreatedAt = DateTime.UtcNow.ToString("O")
            });
        }

        // Resident users
        if (!await _context.Users.AnyAsync(u => u.Username == "resident1"))
        {
            dummyUsers.Add(new User
            {
                Id = Guid.NewGuid(),
                RoleId = residentRoleId,
                Username = "resident1",
                Password = _passwordHasher.HashPassword("password123"),
                IsActive = true,
                CreatedAt = DateTime.UtcNow.ToString("O")
            });
        }

        if (!await _context.Users.AnyAsync(u => u.Username == "resident2"))
        {
            dummyUsers.Add(new User
            {
                Id = Guid.NewGuid(),
                RoleId = residentRoleId,
                Username = "resident2",
                Password = _passwordHasher.HashPassword("password123"),
                IsActive = true,
                CreatedAt = DateTime.UtcNow.ToString("O")
            });
        }

        if (!await _context.Users.AnyAsync(u => u.Username == "resident3"))
        {
            dummyUsers.Add(new User
            {
                Id = Guid.NewGuid(),
                RoleId = residentRoleId,
                Username = "resident3",
                Password = _passwordHasher.HashPassword("password123"),
                IsActive = false, // Inactive user for testing
                CreatedAt = DateTime.UtcNow.ToString("O")
            });
        }

        // Renter users
        if (!await _context.Users.AnyAsync(u => u.Username == "renter1"))
        {
            dummyUsers.Add(new User
            {
                Id = Guid.NewGuid(),
                RoleId = renterRoleId,
                Username = "renter1",
                Password = _passwordHasher.HashPassword("password123"),
                IsActive = true,
                CreatedAt = DateTime.UtcNow.ToString("O")
            });
        }

        if (!await _context.Users.AnyAsync(u => u.Username == "renter2"))
        {
            dummyUsers.Add(new User
            {
                Id = Guid.NewGuid(),
                RoleId = renterRoleId,
                Username = "renter2",
                Password = _passwordHasher.HashPassword("password123"),
                IsActive = true,
                CreatedAt = DateTime.UtcNow.ToString("O")
            });
        }

        // Vigilance users
        if (!await _context.Users.AnyAsync(u => u.Username == "vigilance1"))
        {
            dummyUsers.Add(new User
            {
                Id = Guid.NewGuid(),
                RoleId = vigilanceRoleId,
                Username = "vigilance1",
                Password = _passwordHasher.HashPassword("password123"),
                IsActive = true,
                CreatedAt = DateTime.UtcNow.ToString("O")
            });
        }

        if (!await _context.Users.AnyAsync(u => u.Username == "vigilance2"))
        {
            dummyUsers.Add(new User
            {
                Id = Guid.NewGuid(),
                RoleId = vigilanceRoleId,
                Username = "vigilance2",
                Password = _passwordHasher.HashPassword("password123"),
                IsActive = true,
                CreatedAt = DateTime.UtcNow.ToString("O")
            });
        }

        // Add all dummy users at once
        if (dummyUsers.Any())
        {
            await _context.Users.AddRangeAsync(dummyUsers);
            await _context.SaveChangesAsync();
        }

        // Create 2 communities if they don't exist
        // First community ID - will be used to associate elgrandeahc resident
        var firstCommunityId = new Guid("11111111-1111-1111-1111-111111111111");
        
        if (!await _context.Communities.AnyAsync())
        {
            var communities = new[]
            {
                new Community
                {
                    Id = firstCommunityId,
                    Nombre = "Coto Berlin",
                    Descripcion = "Capital sur - Coto Berlin",
                    Direccion = "Lago de Xochimilco #700 ",
                    Contacto = "Coto Berlin",
                    Email = "elgrande@lospinos.com",
                    Phone = "+1-555-0101",
                    CreatedAt = DateTime.UtcNow.ToString("O")
                },
                new Community
                {
                    Id = new Guid("22222222-2222-2222-2222-222222222222"),
                    Nombre = "Comunidad El Jardín",
                    Descripcion = "Comunidad moderna con amenities y espacios comunes",
                    Direccion = "Avenida Central 456, Sector Sur",
                    Contacto = "Administración El Jardín",
                    Email = "admin@eljardin.com",
                    Phone = "+1-555-0102",
                    CreatedAt = DateTime.UtcNow.ToString("O")
                }
            };

            await _context.Communities.AddRangeAsync(communities);
            await _context.SaveChangesAsync();
        }

        // Create resident for elgrandeahc user with vehicles, pets, and visits
        var elgrandeahcUserId = new Guid("AAAAAAAA-AAAA-AAAA-AAAA-AAAAAAAAAAAA");
        var elgrandeahcUser = await _context.Users.FindAsync(elgrandeahcUserId);

        if (elgrandeahcUser != null)
        {
            // Check if resident already exists for this user
            var existingResident = await _context.Residents
                .FirstOrDefaultAsync(r => r.UserId == elgrandeahcUserId);

            // Verify the first community exists (it should, as it was just created above)
            var firstCommunity = await _context.Communities.FindAsync(firstCommunityId);

            Resident resident;
            if (existingResident == null)
            {
                // Create new resident
                resident = new Resident
                {
                    Id = Guid.NewGuid(),
                    UserId = elgrandeahcUserId,
                    CommunityId = firstCommunityId, // Associated with the first community (Comunidad Los Pinos)
                    FullName = "System Administrator",
                    Email = "elgrandeahc@happyhabitat.com",
                    Phone = "+1-555-0100",
                    Number = "101",
                    Address = "Main Building, Apartment 101",
                    CreatedAt = DateTime.UtcNow.ToString("O")
                };

                await _context.Residents.AddAsync(resident);
                await _context.SaveChangesAsync();
            }
            else
            {
                resident = existingResident;
                // Update CommunityId if not set
                if (resident.CommunityId == null && firstCommunity != null)
                {
                    resident.CommunityId = firstCommunityId; // Associated with the first community (Comunidad Los Pinos)
                    await _context.SaveChangesAsync();
                }
            }

            // Get vehicle type IDs
            var carTypeId = new Guid("77777777-7777-7777-7777-777777777777");
            var suvTypeId = new Guid("AAAAAAAA-BBBB-BBBB-BBBB-BBBBBBBBBBBB");
            var motorcycleTypeId = new Guid("88888888-8888-8888-8888-888888888888");

            // Create 3 vehicles if they don't exist
            var existingVehiclesCount = await _context.Vehicles
                .CountAsync(v => v.ResidentId == resident.Id);

            if (existingVehiclesCount == 0)
            {
                var vehicles = new[]
                {
                    new Vehicle
                    {
                        Id = Guid.NewGuid(),
                        ResidentId = resident.Id,
                        VehicleTypeId = carTypeId,
                        Brand = "Toyota",
                        Model = "Camry",
                        Year = 2020,
                        Color = "Silver",
                        LicensePlate = "ABC-123",
                        CreatedAt = DateTime.UtcNow.ToString("O")
                    },
                    new Vehicle
                    {
                        Id = Guid.NewGuid(),
                        ResidentId = resident.Id,
                        VehicleTypeId = suvTypeId,
                        Brand = "Honda",
                        Model = "CR-V",
                        Year = 2021,
                        Color = "Black",
                        LicensePlate = "XYZ-789",
                        CreatedAt = DateTime.UtcNow.ToString("O")
                    },
                    new Vehicle
                    {
                        Id = Guid.NewGuid(),
                        ResidentId = resident.Id,
                        VehicleTypeId = motorcycleTypeId,
                        Brand = "Yamaha",
                        Model = "MT-07",
                        Year = 2022,
                        Color = "Blue",
                        LicensePlate = "MOT-456",
                        CreatedAt = DateTime.UtcNow.ToString("O")
                    }
                };

                await _context.Vehicles.AddRangeAsync(vehicles);
                await _context.SaveChangesAsync();
            }

            // Create 3 pets if they don't exist
            var existingPetsCount = await _context.Pets
                .CountAsync(p => p.ResidentId == resident.Id);

            if (existingPetsCount == 0)
            {
                var pets = new[]
                {
                    new Pet
                    {
                        Id = Guid.NewGuid(),
                        ResidentId = resident.Id,
                        Name = "Max",
                        Species = "Dog",
                        Breed = "Golden Retriever",
                        Age = 3,
                        Color = "Golden",
                        CreatedAt = DateTime.UtcNow.ToString("O")
                    },
                    new Pet
                    {
                        Id = Guid.NewGuid(),
                        ResidentId = resident.Id,
                        Name = "Luna",
                        Species = "Cat",
                        Breed = "Persian",
                        Age = 2,
                        Color = "White",
                        CreatedAt = DateTime.UtcNow.ToString("O")
                    },
                    new Pet
                    {
                        Id = Guid.NewGuid(),
                        ResidentId = resident.Id,
                        Name = "Charlie",
                        Species = "Dog",
                        Breed = "Labrador",
                        Age = 5,
                        Color = "Black",
                        CreatedAt = DateTime.UtcNow.ToString("O")
                    }
                };

                await _context.Pets.AddRangeAsync(pets);
                await _context.SaveChangesAsync();
            }

            // Create visits: 2 before today and 3 after today
            var existingVisitsCount = await _context.ResidentVisits
                .CountAsync(v => v.ResidentId == resident.Id);

            if (existingVisitsCount == 0)
            {
                var today = DateTime.UtcNow;
                var visits = new List<ResidentVisit>();

                // 2 visits before today
                visits.Add(new ResidentVisit
                {
                    Id = Guid.NewGuid(),
                    ResidentId = resident.Id,
                    VisitorName = "John Doe",
                    TotalPeople = 2,
                    VehicleColor = "Red",
                    LicensePlate = "VIS-001",
                    Subject = "Family Visit",
                    ArrivalDate = today.AddDays(-5).ToString("O"),
                    DepartureDate = today.AddDays(-4).ToString("O"),
                    CreatedAt = today.AddDays(-5).ToString("O")
                });

                visits.Add(new ResidentVisit
                {
                    Id = Guid.NewGuid(),
                    ResidentId = resident.Id,
                    VisitorName = "Jane Smith",
                    TotalPeople = 1,
                    VehicleColor = "White",
                    LicensePlate = "VIS-002",
                    Subject = "Friend Visit",
                    ArrivalDate = today.AddDays(-2).ToString("O"),
                    DepartureDate = today.AddDays(-1).ToString("O"),
                    CreatedAt = today.AddDays(-2).ToString("O")
                });

                // 3 visits after today
                visits.Add(new ResidentVisit
                {
                    Id = Guid.NewGuid(),
                    ResidentId = resident.Id,
                    VisitorName = "Robert Johnson",
                    TotalPeople = 3,
                    VehicleColor = "Blue",
                    LicensePlate = "VIS-003",
                    Subject = "Family Gathering",
                    ArrivalDate = today.AddDays(2).ToString("O"),
                    DepartureDate = today.AddDays(4).ToString("O"),
                    CreatedAt = DateTime.UtcNow.ToString("O")
                });

                visits.Add(new ResidentVisit
                {
                    Id = Guid.NewGuid(),
                    ResidentId = resident.Id,
                    VisitorName = "Maria Garcia",
                    TotalPeople = 2,
                    VehicleColor = "Green",
                    LicensePlate = "VIS-004",
                    Subject = "Weekend Visit",
                    ArrivalDate = today.AddDays(5).ToString("O"),
                    DepartureDate = today.AddDays(7).ToString("O"),
                    CreatedAt = DateTime.UtcNow.ToString("O")
                });

                visits.Add(new ResidentVisit
                {
                    Id = Guid.NewGuid(),
                    ResidentId = resident.Id,
                    VisitorName = "David Wilson",
                    TotalPeople = 1,
                    VehicleColor = null,
                    LicensePlate = null,
                    Subject = "Business Meeting",
                    ArrivalDate = today.AddDays(10).ToString("O"),
                    DepartureDate = null, // Ongoing visit
                    CreatedAt = DateTime.UtcNow.ToString("O")
                });

                await _context.ResidentVisits.AddRangeAsync(visits);
                await _context.SaveChangesAsync();
            }
        }
    }
}

