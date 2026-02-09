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

        // Seed Communities if they don't exist
        // First community ID - will be used to associate elgrandeahc resident and banners
        var firstCommunityId = new Guid("11111111-1111-1111-1111-111111111111");
        
        if (!await _context.Communities.AnyAsync())
        {
            var communities = new[]
            {
                new Community
                {
                    Id = new Guid("fcdc9a85-88b7-4109-84b3-a75107392d87"),
                    Nombre = "Residencial El Pueblito",
                    Descripcion = "Fraccionamiento residencial con amplias áreas verdes",
                    Direccion = "Av. Paseo del Pueblito 123, El Pueblito, QRO",
                    Contacto = "admin@elpueblito.mx",
                    Email = "admin@elpueblito.mx",
                    Phone = "4421234567",
                    TipoComunidad = "FRACCIONAMIENTO",
                    Latitud = 20.5821,
                    Longitud = -100.3897,
                    CantidadViviendas = 120,
                    CreatedAt = DateTime.UtcNow.ToString("O")
                },
                new Community
                {
                    Id = new Guid("ff7bc6fb-0f13-4e37-beb4-7d428520c227"),
                    Nombre = "Colonia Las Palmas",
                    Descripcion = "Colonia residencial con servicios completos",
                    Direccion = "Calle Palma Real 45, Querétaro, QRO",
                    Contacto = "contacto@laspalmas.org",
                    Email = "contacto@laspalmas.org",
                    Phone = "4422345678",
                    TipoComunidad = "COLONIA",
                    Latitud = 20.5932,
                    Longitud = -100.3921,
                    CantidadViviendas = 85,
                    CreatedAt = DateTime.UtcNow.ToString("O")
                },
                new Community
                {
                    Id = new Guid("c4a28c40-a2c7-4190-961c-f3f52ad19c1d"),
                    Nombre = "Coto San Miguel",
                    Descripcion = "Coto privado con seguridad 24/7",
                    Direccion = "Privada San Miguel 8, Corregidora, QRO",
                    Contacto = "info@cotosanmiguel.com",
                    Email = "info@cotosanmiguel.com",
                    Phone = "4423456789",
                    TipoComunidad = "COTO",
                    Latitud = 20.5798,
                    Longitud = -100.3865,
                    CantidadViviendas = 60,
                    CreatedAt = DateTime.UtcNow.ToString("O")
                },
                new Community
                {
                    Id = new Guid("aa2f0511-bedd-413c-8681-34f3eee11ac9"),
                    Nombre = "Villa del Sol",
                    Descripcion = "Fraccionamiento premium con clubhouse",
                    Direccion = "Av. del Sol 200, Querétaro, QRO",
                    Contacto = "villa@delsol.mx",
                    Email = "villa@delsol.mx",
                    Phone = "4424567890",
                    TipoComunidad = "FRACCIONAMIENTO",
                    Latitud = 20.6001,
                    Longitud = -100.395,
                    CantidadViviendas = 150,
                    CreatedAt = DateTime.UtcNow.ToString("O")
                },
                new Community
                {
                    Id = new Guid("9f3cfa42-d4cd-41b3-95d4-e8f6ffdb204c"),
                    Nombre = "Capital Sur - Coto Berlin",
                    Descripcion = "Coto residencial con amplias áreas comunes",
                    Direccion = "El Marqués, QRO",
                    Contacto = "capitalsur-cotoberlin@comunidad.org",
                    Email = "capitalsur-cotoberlin@comunidad.org",
                    Phone = "4425678901",
                    TipoComunidad = "COTO",
                    Latitud = 20.6105,
                    Longitud = -100.3802,
                    CantidadViviendas = 240,
                    CreatedAt = DateTime.UtcNow.ToString("O")
                },
                new Community
                {
                    Id = firstCommunityId,
                    Nombre = "Residencial Los Pinos",
                    Descripcion = "Fraccionamiento con alberca y áreas deportivas",
                    Direccion = "Blvd. Los Pinos 500, Querétaro, QRO",
                    Contacto = "info@lospinos.mx",
                    Email = "info@lospinos.mx",
                    Phone = "4426789012",
                    TipoComunidad = "FRACCIONAMIENTO",
                    Latitud = 20.5950,
                    Longitud = -100.4000,
                    CantidadViviendas = 180,
                    CreatedAt = DateTime.UtcNow.ToString("O")
                },
                new Community
                {
                    Id = new Guid("22222222-2222-2222-2222-222222222222"),
                    Nombre = "Coto Las Fuentes",
                    Descripcion = "Coto privado con jardines y fuentes",
                    Direccion = "Av. Las Fuentes 300, Querétaro, QRO",
                    Contacto = "contacto@lasfuentes.com",
                    Email = "contacto@lasfuentes.com",
                    Phone = "4427890123",
                    TipoComunidad = "COTO",
                    Latitud = 20.5850,
                    Longitud = -100.3750,
                    CantidadViviendas = 95,
                    CreatedAt = DateTime.UtcNow.ToString("O")
                },
                new Community
                {
                    Id = new Guid("33333333-3333-3333-3333-333333333333"),
                    Nombre = "Colonia Jardines del Valle",
                    Descripcion = "Colonia residencial con parques y áreas verdes",
                    Direccion = "Calle Valle Verde 150, Querétaro, QRO",
                    Contacto = "jardines@valle.org",
                    Email = "jardines@valle.org",
                    Phone = "4428901234",
                    TipoComunidad = "COLONIA",
                    Latitud = 20.6050,
                    Longitud = -100.3900,
                    CantidadViviendas = 110,
                    CreatedAt = DateTime.UtcNow.ToString("O")
                },
                new Community
                {
                    Id = new Guid("44444444-4444-4444-4444-444444444444"),
                    Nombre = "Mexico",
                    Descripcion = "Coto privado con seguridad y áreas comunes",
                    Direccion = "Av. México 250, Querétaro, QRO",
                    Contacto = "contacto@mexico.com",
                    Email = "contacto@mexico.com",
                    Phone = "4429012345",
                    TipoComunidad = "COTO",
                    Latitud = 20.5900,
                    Longitud = -100.3850,
                    CantidadViviendas = 75,
                    CreatedAt = DateTime.UtcNow.ToString("O")
                },
                new Community
                {
                    Id = new Guid("55555555-5555-5555-5555-555555555555"),
                    Nombre = "Monaco",
                    Descripcion = "Coto exclusivo con servicios premium",
                    Direccion = "Blvd. Monaco 400, Querétaro, QRO",
                    Contacto = "info@monaco.com",
                    Email = "info@monaco.com",
                    Phone = "4420123456",
                    TipoComunidad = "COTO",
                    Latitud = 20.5750,
                    Longitud = -100.3950,
                    CantidadViviendas = 50,
                    CreatedAt = DateTime.UtcNow.ToString("O")
                },
                new Community
                {
                    Id = new Guid("66666666-6666-6666-6666-666666666666"),
                    Nombre = "Bruselas",
                    Descripcion = "Coto residencial con jardines y áreas recreativas",
                    Direccion = "Calle Bruselas 180, Querétaro, QRO",
                    Contacto = "bruselas@comunidad.com",
                    Email = "bruselas@comunidad.com",
                    Phone = "4421234567",
                    TipoComunidad = "COTO",
                    Latitud = 20.6000,
                    Longitud = -100.3750,
                    CantidadViviendas = 90,
                    CreatedAt = DateTime.UtcNow.ToString("O")
                },
                new Community
                {
                    Id = new Guid("77777777-7777-7777-7777-777777777777"),
                    Nombre = "Jardines de Morelos",
                    Descripcion = "Fraccionamiento con amplias áreas verdes y alberca",
                    Direccion = "Av. Morelos 350, Querétaro, QRO",
                    Contacto = "jardines@morelos.mx",
                    Email = "jardines@morelos.mx",
                    Phone = "4422345678",
                    TipoComunidad = "FRACCIONAMIENTO",
                    Latitud = 20.5850,
                    Longitud = -100.4000,
                    CantidadViviendas = 200,
                    CreatedAt = DateTime.UtcNow.ToString("O")
                },
                new Community
                {
                    Id = new Guid("88888888-8888-8888-8888-888888888888"),
                    Nombre = "Fuentes de valle",
                    Descripcion = "Fraccionamiento con fuentes y áreas deportivas",
                    Direccion = "Blvd. Fuentes del Valle 500, Querétaro, QRO",
                    Contacto = "fuentes@valle.mx",
                    Email = "fuentes@valle.mx",
                    Phone = "4423456789",
                    TipoComunidad = "FRACCIONAMIENTO",
                    Latitud = 20.5950,
                    Longitud = -100.3850,
                    CantidadViviendas = 175,
                    CreatedAt = DateTime.UtcNow.ToString("O")
                }
            };

            await _context.Communities.AddRangeAsync(communities);
            await _context.SaveChangesAsync();
        }

        // Seed 3 Company Administrators with unique communities
        // Company Administrator 1 - 3 communities
        var admin1Id = new Guid("BBBBBBBB-BBBB-BBBB-BBBB-BBBBBBBBBBBB");
        var admin1 = await _context.Users.FirstOrDefaultAsync(u => u.Id == admin1Id || u.Username == "admincom01");
        if (admin1 == null)
        {
            admin1 = new User
            {
                Id = admin1Id,
                RoleId = adminCompanyRoleId,
                FirstName = "María",
                LastName = "González",
                Username = "admincom01",
                Email = "maria.gonzalez@admincom1.com",
                Password = _passwordHasher.HashPassword("admin123"),
                IsActive = true,
                CreatedAt = DateTime.UtcNow.ToString("O")
            };
            await _context.Users.AddAsync(admin1);
            await _context.SaveChangesAsync();

            // Associate with 3 communities
            var admin1Communities = new[]
            {
                new UserCommunity
                {
                    Id = Guid.NewGuid(),
                    UserId = admin1Id,
                    CommunityId = new Guid("fcdc9a85-88b7-4109-84b3-a75107392d87"), // Residencial El Pueblito
                    CreatedAt = DateTime.UtcNow.ToString("O")
                },
                new UserCommunity
                {
                    Id = Guid.NewGuid(),
                    UserId = admin1Id,
                    CommunityId = new Guid("ff7bc6fb-0f13-4e37-beb4-7d428520c227"), // Colonia Las Palmas
                    CreatedAt = DateTime.UtcNow.ToString("O")
                },
                new UserCommunity
                {
                    Id = Guid.NewGuid(),
                    UserId = admin1Id,
                    CommunityId = new Guid("c4a28c40-a2c7-4190-961c-f3f52ad19c1d"), // Coto San Miguel
                    CreatedAt = DateTime.UtcNow.ToString("O")
                }
            };
            await _context.UserCommunities.AddRangeAsync(admin1Communities);
            await _context.SaveChangesAsync();
        }

        // Company Administrator 2 - 2 communities
        var admin2Id = new Guid("CCCCCCCC-CCCC-CCCC-CCCC-CCCCCCCCCCCC");
        var admin2 = await _context.Users.FirstOrDefaultAsync(u => u.Id == admin2Id || u.Username == "admincom02");
        if (admin2 == null)
        {
            admin2 = new User
            {
                Id = admin2Id,
                RoleId = adminCompanyRoleId,
                FirstName = "Carlos",
                LastName = "Rodríguez",
                Username = "admincom02",
                Email = "carlos.rodriguez@admincom2.com",
                Password = _passwordHasher.HashPassword("admin123"),
                IsActive = true,
                CreatedAt = DateTime.UtcNow.ToString("O")
            };
            await _context.Users.AddAsync(admin2);
            await _context.SaveChangesAsync();

            // Associate with 2 communities
            var admin2Communities = new[]
            {
                new UserCommunity
                {
                    Id = Guid.NewGuid(),
                    UserId = admin2Id,
                    CommunityId = new Guid("aa2f0511-bedd-413c-8681-34f3eee11ac9"), // Villa del Sol
                    CreatedAt = DateTime.UtcNow.ToString("O")
                },
                new UserCommunity
                {
                    Id = Guid.NewGuid(),
                    UserId = admin2Id,
                    CommunityId = new Guid("9f3cfa42-d4cd-41b3-95d4-e8f6ffdb204c"), // Capital Sur - Coto Berlin
                    CreatedAt = DateTime.UtcNow.ToString("O")
                }
            };
            await _context.UserCommunities.AddRangeAsync(admin2Communities);
            await _context.SaveChangesAsync();
        }

        // Company Administrator 3 - 1 community
        var admin3Id = new Guid("DDDDDDDD-DDDD-DDDD-DDDD-DDDDDDDDDDDD");
        var admin3 = await _context.Users.FirstOrDefaultAsync(u => u.Id == admin3Id || u.Username == "admincom03");
        if (admin3 == null)
        {
            admin3 = new User
            {
                Id = admin3Id,
                RoleId = adminCompanyRoleId,
                FirstName = "Ana",
                LastName = "Martínez",
                Username = "admincom03",
                Email = "ana.martinez@admincom3.com",
                Password = _passwordHasher.HashPassword("admin123"),
                IsActive = true,
                CreatedAt = DateTime.UtcNow.ToString("O")
            };
            await _context.Users.AddAsync(admin3);
            await _context.SaveChangesAsync();

            // Associate with 1 community
            var admin3Community = new UserCommunity
            {
                Id = Guid.NewGuid(),
                UserId = admin3Id,
                CommunityId = new Guid("11111111-1111-1111-1111-111111111111"), // Residencial Los Pinos
                CreatedAt = DateTime.UtcNow.ToString("O")
            };
            await _context.UserCommunities.AddAsync(admin3Community);
            await _context.SaveChangesAsync();
        }

        // Add ADMIN_COMPANY role to elgrandeahc user and associate with 3 communities
        var elgrandeahcUserId = new Guid("AAAAAAAA-AAAA-AAAA-AAAA-AAAAAAAAAAAA");
        var elgrandeahcUser = await _context.Users
            .Include(u => u.UserRoles)
            .Include(u => u.UserCommunities)
            .FirstOrDefaultAsync(u => u.Id == elgrandeahcUserId || u.Username == "elgrandeahc");

        if (elgrandeahcUser != null)
        {
            // Get SYSTEM_ADMIN role ID
            var systemAdminRoleId = new Guid("11111111-1111-1111-1111-111111111111");
            
            // Add SYSTEM_ADMIN role to UserRoles if not already assigned
            var hasSystemAdminRole = await _context.UserRoles
                .AnyAsync(ur => ur.UserId == elgrandeahcUserId && ur.RoleId == systemAdminRoleId);

            if (!hasSystemAdminRole)
            {
                var systemAdminUserRole = new UserRole
                {
                    Id = Guid.NewGuid(),
                    UserId = elgrandeahcUserId,
                    RoleId = systemAdminRoleId,
                    CreatedAt = DateTime.UtcNow.ToString("O")
                };
                await _context.UserRoles.AddAsync(systemAdminUserRole);
                await _context.SaveChangesAsync();
            }

            // Add ADMIN_COMPANY role if not already assigned
            var hasAdminCompanyRole = await _context.UserRoles
                .AnyAsync(ur => ur.UserId == elgrandeahcUserId && ur.RoleId == adminCompanyRoleId);

            if (!hasAdminCompanyRole)
            {
                var adminCompanyUserRole = new UserRole
                {
                    Id = Guid.NewGuid(),
                    UserId = elgrandeahcUserId,
                    RoleId = adminCompanyRoleId,
                    CreatedAt = DateTime.UtcNow.ToString("O")
                };
                await _context.UserRoles.AddAsync(adminCompanyUserRole);
                await _context.SaveChangesAsync();
            }

            // Associate with 3 communities (selecting first 3 communities that exist)
            var communitiesToAssociate = new[]
            {
                new Guid("fcdc9a85-88b7-4109-84b3-a75107392d87"), // Residencial El Pueblito
                new Guid("ff7bc6fb-0f13-4e37-beb4-7d428520c227"), // Colonia Las Palmas
                new Guid("c4a28c40-a2c7-4190-961c-f3f52ad19c1d")  // Coto San Miguel
            };

            foreach (var communityId in communitiesToAssociate)
            {
                var communityExists = await _context.Communities.AnyAsync(c => c.Id == communityId);
                if (!communityExists) continue;

                var existingUserCommunity = await _context.UserCommunities
                    .AnyAsync(uc => uc.UserId == elgrandeahcUserId && uc.CommunityId == communityId);

                if (!existingUserCommunity)
                {
                    var userCommunity = new UserCommunity
                    {
                        Id = Guid.NewGuid(),
                        UserId = elgrandeahcUserId,
                        CommunityId = communityId,
                        CreatedAt = DateTime.UtcNow.ToString("O")
                    };
                    await _context.UserCommunities.AddAsync(userCommunity);
                }
            }
            await _context.SaveChangesAsync();

            // Ensure these 3 communities have residents
            foreach (var communityId in communitiesToAssociate)
            {
                var community = await _context.Communities.FindAsync(communityId);
                if (community == null) continue;

                // Check if community has residents
                var hasResidents = await _context.Residents
                    .AnyAsync(r => r.CommunityId == communityId);

                if (!hasResidents)
                {
                    // Create a resident user for each community
                    var localResidentRoleId = new Guid("44444444-4444-4444-4444-444444444444");
                    
                    // Sanitize community name for username and email
                    var sanitizedName = community.Nombre
                        .Replace(" ", "_")
                        .Replace("-", "_")
                        .Replace(".", "")
                        .Replace(",", "")
                        .ToLower();
                    var username = $"residente_{sanitizedName.Substring(0, Math.Min(15, sanitizedName.Length))}";
                    var emailName = community.Nombre
                        .Replace(" ", ".")
                        .Replace("-", ".")
                        .Replace(",", "")
                        .ToLower();
                    var email = $"residente.{emailName.Substring(0, Math.Min(25, emailName.Length))}@example.com";
                    var lastName = community.Nombre
                        .Replace(" ", "")
                        .Replace("-", "")
                        .Substring(0, Math.Min(20, community.Nombre.Length));
                    
                    var residentUser = new User
                    {
                        Id = Guid.NewGuid(),
                        RoleId = localResidentRoleId,
                        FirstName = "Residente",
                        LastName = lastName,
                        Username = username,
                        Email = email,
                        Password = _passwordHasher.HashPassword("password123"),
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow.ToString("O")
                    };
                    await _context.Users.AddAsync(residentUser);
                    await _context.SaveChangesAsync();

                    // Add UserRole for the resident
                    var residentUserRole = new UserRole
                    {
                        Id = Guid.NewGuid(),
                        UserId = residentUser.Id,
                        RoleId = localResidentRoleId,
                        CreatedAt = DateTime.UtcNow.ToString("O")
                    };
                    await _context.UserRoles.AddAsync(residentUserRole);

                    // Create resident
                    var resident = new Resident
                    {
                        Id = Guid.NewGuid(),
                        UserId = residentUser.Id,
                        CommunityId = communityId,
                        FullName = $"{residentUser.FirstName} {residentUser.LastName}",
                        Email = residentUser.Email,
                        Phone = "4421234567",
                        Number = "A-101",
                        Address = community.Direccion,
                        CreatedAt = DateTime.UtcNow.ToString("O")
                    };
                    await _context.Residents.AddAsync(resident);
                    await _context.SaveChangesAsync();
                }
            }
        }

        // Create resident for elgrandeahc user with vehicles, pets, and visits
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

        // Create banners if they don't exist
        var existingBannersCount = await _context.Banners.CountAsync();

        if (existingBannersCount == 0)
        {
            var currentYear = DateTime.UtcNow.Year;
            var banners = new List<Banner>();

            // Año Nuevo - 1 de enero
            banners.Add(new Banner
            {
                Id = Guid.NewGuid(),
                CommunityId = firstCommunityId,
                PathImagen = "images/banners/banner_new_year_2025.png",
                Title = "¡Feliz Año Nuevo!",
                Text = "Comienza el año con alegría y nuevas oportunidades. Únete a nuestra celebración de Año Nuevo con actividades especiales, música y festejos para toda la familia.",
                IsActive = true,
                StartDate = new DateTime(currentYear, 1, 1).ToString("yyyy-MM-dd"),
                EndDate = new DateTime(currentYear, 1, 7).ToString("yyyy-MM-dd"),
                CreatedAt = DateTime.UtcNow.ToString("O")
            });

            // Día de la Constitución - 5 de febrero (se celebra el lunes más cercano)
            banners.Add(new Banner
            {
                Id = Guid.NewGuid(),
                CommunityId = firstCommunityId,
                PathImagen = "images/banners/banner-14-febrero.png",
                Title = "Día de la Constitución",
                Text = "Conmemoramos la promulgación de nuestra Constitución. Reflexionemos sobre nuestros derechos y deberes como ciudadanos mexicanos.",
                IsActive = true,
                StartDate = new DateTime(currentYear, 2, 1).ToString("yyyy-MM-dd"),
                EndDate = new DateTime(currentYear, 2, 10).ToString("yyyy-MM-dd"),
                CreatedAt = DateTime.UtcNow.ToString("O")
            });

            // Día de las Madres - 10 de mayo (usar banner genérico disponible)
            banners.Add(new Banner
            {
                Id = Guid.NewGuid(),
                CommunityId = firstCommunityId,
                PathImagen = "images/banners/banner_independencia.png",
                Title = "Día de las Madres",
                Text = "Celebremos a las madres, el pilar de nuestras familias. Únete a nuestro homenaje especial con actividades y reconocimientos para todas las mamás de la comunidad.",
                IsActive = true,
                StartDate = new DateTime(currentYear, 5, 1).ToString("yyyy-MM-dd"),
                EndDate = new DateTime(currentYear, 5, 15).ToString("yyyy-MM-dd"),
                CreatedAt = DateTime.UtcNow.ToString("O")
            });

            // Día del Padre - 3er domingo de junio (aproximado 15-21)
            banners.Add(new Banner
            {
                Id = Guid.NewGuid(),
                CommunityId = firstCommunityId,
                PathImagen = "images/banners/banner_independencia.png",
                Title = "Día del Padre",
                Text = "Honremos a los padres que con su ejemplo y dedicación fortalecen nuestras familias. Participa en las actividades especiales que hemos preparado.",
                IsActive = true,
                StartDate = new DateTime(currentYear, 6, 10).ToString("yyyy-MM-dd"),
                EndDate = new DateTime(currentYear, 6, 25).ToString("yyyy-MM-dd"),
                CreatedAt = DateTime.UtcNow.ToString("O")
            });

            // Día de la Independencia - 16 de septiembre
            banners.Add(new Banner
            {
                Id = Guid.NewGuid(),
                CommunityId = firstCommunityId,
                PathImagen = "images/banners/banner_independencia.png",
                Title = "Día de la Independencia",
                Text = "Celebremos juntos el Día de la Independencia de México. Únete a nuestras actividades comunitarias y festejemos nuestra historia y tradiciones. Habrá música, comida tradicional y actividades para toda la familia.",
                IsActive = true,
                StartDate = new DateTime(currentYear, 9, 10).ToString("yyyy-MM-dd"),
                EndDate = new DateTime(currentYear, 9, 20).ToString("yyyy-MM-dd"),
                CreatedAt = DateTime.UtcNow.ToString("O")
            });

            // Halloween - 31 de octubre
            banners.Add(new Banner
            {
                Id = Guid.NewGuid(),
                CommunityId = firstCommunityId,
                PathImagen = "images/banners/banner_halloween.png",
                Title = "Halloween",
                Text = "¡Trick or Treat! Celebra Halloween con nosotros. Los niños pueden participar en el concurso de disfraces y disfrutar de actividades especiales. La diversión está garantizada para toda la familia.",
                IsActive = true,
                StartDate = new DateTime(currentYear, 10, 25).ToString("yyyy-MM-dd"),
                EndDate = new DateTime(currentYear, 11, 1).ToString("yyyy-MM-dd"),
                CreatedAt = DateTime.UtcNow.ToString("O")
            });

            // Día de Muertos - 1-2 de noviembre
            banners.Add(new Banner
            {
                Id = Guid.NewGuid(),
                CommunityId = firstCommunityId,
                PathImagen = "images/banners/banner_dia_de_muertos.png",
                Title = "Día de Muertos",
                Text = "Honremos a nuestros seres queridos en esta tradicional celebración mexicana. Participa en la decoración del altar comunitario y disfruta de las actividades culturales que hemos preparado para toda la familia.",
                IsActive = true,
                StartDate = new DateTime(currentYear, 10, 28).ToString("yyyy-MM-dd"),
                EndDate = new DateTime(currentYear, 11, 5).ToString("yyyy-MM-dd"),
                CreatedAt = DateTime.UtcNow.ToString("O")
            });

            // Día de la Revolución - 20 de noviembre (se celebra el lunes más cercano)
            banners.Add(new Banner
            {
                Id = Guid.NewGuid(),
                CommunityId = firstCommunityId,
                PathImagen = "images/banners/banner_independencia.png",
                Title = "Día de la Revolución",
                Text = "Conmemoramos el inicio de la Revolución Mexicana. Recordemos nuestra historia y los valores que nos unen como nación.",
                IsActive = true,
                StartDate = new DateTime(currentYear, 11, 15).ToString("yyyy-MM-dd"),
                EndDate = new DateTime(currentYear, 11, 25).ToString("yyyy-MM-dd"),
                CreatedAt = DateTime.UtcNow.ToString("O")
            });

            // Día de la Virgen de Guadalupe - 12 de diciembre
            banners.Add(new Banner
            {
                Id = Guid.NewGuid(),
                CommunityId = firstCommunityId,
                PathImagen = "images/banners/banner_navidad.png",
                Title = "Día de la Virgen de Guadalupe",
                Text = "Celebremos a nuestra patrona, la Virgen de Guadalupe. Únete a nuestras actividades religiosas y culturales en honor a esta importante festividad.",
                IsActive = true,
                StartDate = new DateTime(currentYear, 12, 1).ToString("yyyy-MM-dd"),
                EndDate = new DateTime(currentYear, 12, 15).ToString("yyyy-MM-dd"),
                CreatedAt = DateTime.UtcNow.ToString("O")
            });

            // Navidad - 25 de diciembre
            banners.Add(new Banner
            {
                Id = Guid.NewGuid(),
                CommunityId = firstCommunityId,
                PathImagen = "images/banners/banner_navidad.png",
                Title = "Navidad",
                Text = "¡Feliz Navidad! Disfruta de la temporada navideña con nuestra comunidad. Participa en el intercambio de regalos, la decoración navideña y las actividades especiales que hemos organizado para celebrar juntos esta época del año.",
                IsActive = true,
                StartDate = new DateTime(currentYear, 12, 15).ToString("yyyy-MM-dd"),
                EndDate = new DateTime(currentYear, 12, 31).ToString("yyyy-MM-dd"),
                CreatedAt = DateTime.UtcNow.ToString("O")
            });

            // Año Nuevo (fin de año) - 31 de diciembre
            banners.Add(new Banner
            {
                Id = Guid.NewGuid(),
                CommunityId = firstCommunityId,
                PathImagen = "images/banners/banner_new_year_2025.png",
                Title = "Fin de Año",
                Text = "Despedimos el año con gratitud y esperanza. Únete a nuestra celebración de fin de año con música, comida y actividades para toda la familia.",
                IsActive = true,
                StartDate = new DateTime(currentYear, 12, 28).ToString("yyyy-MM-dd"),
                EndDate = new DateTime(currentYear + 1, 1, 3).ToString("yyyy-MM-dd"),
                CreatedAt = DateTime.UtcNow.ToString("O")
            });

            await _context.Banners.AddRangeAsync(banners.ToArray());
            await _context.SaveChangesAsync();
        }

        // Create comunicados if they don't exist
        var existingComunicadosCount = await _context.Comunicados.CountAsync();

        if (existingComunicadosCount == 0)
        {
            var comunicados = new List<Comunicado>();

            // Propuesta de reglamento revisión
            comunicados.Add(new Comunicado
            {
                Id = Guid.NewGuid(),
                CommunityId = firstCommunityId,
                Titulo = "Propuesta de reglamento revisión",
                Subtitulo = "Cierre temporal por limpieza",
                Descripcion = @"Estimados condóminos:

Durante el taller de revisión del reglamento no fue posible concluir con todas las preguntas y observaciones planteadas por los vecinos. 

Con el fin de que todos puedan participar activamente en este proceso, la administración compartirá el reglamento con el texto resaltado en aquellos partes que están propuestas para modificación.

Le recordamos que ustedes son quienes construyen y deciden estas modificaciones. Por ello, los invitamos a enviarnos sus dudas, comentarios o sugerencias a través de Whatsapp al número de la administración

La fecha límite para poder recibir este tipo de información será el 12 de Septiembre del presente año.

De esta forma podremos integrar todas las opiniones para la siguiente revisión y asegurar que el reglamento refleje las necesidades y acuerdos de nuestra comunidad. 

¡Gracias por su participación y compromiso!

Este es el link en donde encontrarán la propuesta de reglamento con las señalizaciones específicas. 

https://drive.google.com/file/d/1OG95bOMdZKWme-90_dg3VhTuYs1jMlfd/view?usp=sharing",
                Fecha = new DateTime(2025, 9, 8),
                CreatedAt = DateTime.UtcNow.ToString("O")
            });

            // Mantenimiento de la alberca
            comunicados.Add(new Comunicado
            {
                Id = Guid.NewGuid(),
                CommunityId = firstCommunityId,
                Titulo = "Mantenimiento de la alberca",
                Subtitulo = "Cierre temporal por limpieza",
                Descripcion = "La alberca estará cerrada el 2025-09-12 para realizar limpieza profunda y revisión del sistema de filtrado.",
                Fecha = new DateTime(2025, 9, 12),
                Imagen = "images/anuncios/manenimiento_alberca.png",
                CreatedAt = DateTime.UtcNow.ToString("O")
            });

            // Jornada de reciclaje
            comunicados.Add(new Comunicado
            {
                Id = Guid.NewGuid(),
                CommunityId = firstCommunityId,
                Titulo = "Jornada de reciclaje",
                Subtitulo = "Trae tus residuos separados",
                Descripcion = "Este sábado 2025-09-14 se instalará un punto de acopio en el parque central para reciclaje de papel, plástico y electrónicos.",
                Fecha = new DateTime(2025, 9, 14),
                Imagen = "images/anuncios/jornada-reciclaje.png",
                CreatedAt = DateTime.UtcNow.ToString("O")
            });

            // Fumigación preventiva
            comunicados.Add(new Comunicado
            {
                Id = Guid.NewGuid(),
                CommunityId = firstCommunityId,
                Titulo = "Fumigación preventiva",
                Subtitulo = "Control de plagas en áreas comunes",
                Descripcion = "El lunes 2025-09-16 se realizará fumigación en jardines y pasillos. Evita transitar por zonas tratadas durante ese día.",
                Fecha = new DateTime(2025, 9, 16),
                Imagen = "images/anuncios/fumigacion.png",
                CreatedAt = DateTime.UtcNow.ToString("O")
            });

            // Reunión vecinal mensual
            comunicados.Add(new Comunicado
            {
                Id = Guid.NewGuid(),
                CommunityId = firstCommunityId,
                Titulo = "Reunión vecinal mensual",
                Subtitulo = "Temas de seguridad y mantenimiento",
                Descripcion = "La reunión se llevará a cabo el 2025-09-20 a las 18:00 hrs en el salón común. Participa y haz escuchar tu voz.",
                Fecha = new DateTime(2025, 9, 20),
                Imagen = "images/anuncios/reunion-mensual.png",
                CreatedAt = DateTime.UtcNow.ToString("O")
            });

            // Instalación de cámaras
            comunicados.Add(new Comunicado
            {
                Id = Guid.NewGuid(),
                CommunityId = firstCommunityId,
                Titulo = "Instalación de cámaras",
                Subtitulo = "Mejora de seguridad perimetral",
                Descripcion = "El 2025-09-22 se instalarán nuevas cámaras en los accesos principales. Habrá personal técnico en el área.",
                Fecha = new DateTime(2025, 9, 22),
                Imagen = "images/anuncios/instalacion-camaras.png",
                CreatedAt = DateTime.UtcNow.ToString("O")
            });

            // Decoración de otoño
            comunicados.Add(new Comunicado
            {
                Id = Guid.NewGuid(),
                CommunityId = firstCommunityId,
                Titulo = "Decoración de otoño",
                Subtitulo = "Convocatoria para voluntarios",
                Descripcion = "El comité invita a decorar áreas comunes con temática otoñal el 2025-09-25. Puedes donar adornos o ayudar en el montaje.",
                Fecha = new DateTime(2025, 9, 25),
                Imagen = "images/anuncios/decoracion-otono.png",
                CreatedAt = DateTime.UtcNow.ToString("O")
            });

            // Poda de árboles
            comunicados.Add(new Comunicado
            {
                Id = Guid.NewGuid(),
                CommunityId = firstCommunityId,
                Titulo = "Poda de árboles",
                Subtitulo = "Mantenimiento de áreas verdes",
                Descripcion = "El 2025-09-28 se realizará poda en los jardines del lado norte. Favor de retirar objetos personales cercanos.",
                Fecha = new DateTime(2025, 9, 28),
                Imagen = "images/anuncios/poda-arboles.png",
                CreatedAt = DateTime.UtcNow.ToString("O")
            });

            // Taller de compostaje
            comunicados.Add(new Comunicado
            {
                Id = Guid.NewGuid(),
                CommunityId = firstCommunityId,
                Titulo = "Taller de compostaje",
                Subtitulo = "Aprende a reducir residuos orgánicos",
                Descripcion = "El 2025-10-01 se impartirá un taller gratuito sobre compostaje en el salón común. Cupo limitado, regístrate con anticipación.",
                Fecha = new DateTime(2025, 10, 1),
                Imagen = "images/anuncios/taller-compostaje.png",
                CreatedAt = DateTime.UtcNow.ToString("O")
            });

            // Reparación del portón
            comunicados.Add(new Comunicado
            {
                Id = Guid.NewGuid(),
                CommunityId = firstCommunityId,
                Titulo = "Reparación del portón",
                Subtitulo = "Acceso restringido temporalmente",
                Descripcion = "El portón principal estará en mantenimiento el 2025-10-03. Usa el acceso peatonal alternativo durante ese día.",
                Fecha = new DateTime(2025, 10, 3),
                Imagen = "images/anuncios/reparacion-porton.png",
                CreatedAt = DateTime.UtcNow.ToString("O")
            });

            // Festival comunitario
            comunicados.Add(new Comunicado
            {
                Id = Guid.NewGuid(),
                CommunityId = firstCommunityId,
                Titulo = "Festival comunitario",
                Subtitulo = "Música, comida y juegos",
                Descripcion = "El 2025-10-06 se celebrará el festival anual en el parque central. ¡Trae a tu familia y disfruta!",
                Fecha = new DateTime(2025, 10, 6),
                Imagen = "images/anuncios/festival-comunitario.png",
                CreatedAt = DateTime.UtcNow.ToString("O")
            });

            await _context.Comunicados.AddRangeAsync(comunicados.ToArray());
            await _context.SaveChangesAsync();
        }

        // Seed Contratos for Bruselas and Coto Berlin communities
        var bruselasCommunityId = new Guid("66666666-6666-6666-6666-666666666666");
        var cotoBerlinCommunityId = new Guid("9f3cfa42-d4cd-41b3-95d4-e8f6ffdb204c");

        // Check if contratos already exist for these communities
        var existingContratosBruselas = await _context.Contratos
            .AnyAsync(c => c.CommunityId == bruselasCommunityId);
        var existingContratosCotoBerlin = await _context.Contratos
            .AnyAsync(c => c.CommunityId == cotoBerlinCommunityId);

        if (!existingContratosBruselas)
        {
            var today = DateTime.UtcNow;
            var contratosBruselas = new List<Contrato>
            {
                new Contrato
                {
                    Id = Guid.NewGuid(),
                    CommunityId = bruselasCommunityId,
                    TipoContrato = "estandar",
                    FolioContrato = "CT-BRU-2024-001",
                    RepresentanteComunidad = "María González Pérez",
                    CostoTotal = 125000.00m,
                    MontoPagoParcial = 10416.67m, // 125000 / 12 meses
                    NumeroPagosParciales = 12, // 12 pagos mensuales
                    DiaPago = 5, // Día 5 de cada mes
                    PeriodicidadPago = "mensual",
                    MetodoPago = "transferencia",
                    FechaFirma = today.AddMonths(-6).ToString("O"),
                    FechaInicio = today.AddMonths(-6).ToString("O"),
                    FechaFin = today.AddMonths(6).ToString("O"),
                    NumeroCasas = 90,
                    EstadoContrato = "activo",
                    AsesorVentas = "Carlos Rodríguez",
                    Notas = "Contrato estándar para servicios de administración y mantenimiento",
                    DocumentosAdjuntos = "/documentos/contratos/CT-BRU-2024-001.pdf",
                    IsActive = true,
                    CreatedAt = today.AddMonths(-6).ToString("O")
                },
                new Contrato
                {
                    Id = Guid.NewGuid(),
                    CommunityId = bruselasCommunityId,
                    TipoContrato = "promocion",
                    FolioContrato = "CT-BRU-2024-002",
                    RepresentanteComunidad = "María González Pérez",
                    CostoTotal = 45000.00m,
                    MontoPagoParcial = 15000.00m, // 45000 / 3 trimestres
                    NumeroPagosParciales = 3, // 3 pagos trimestrales
                    DiaPago = 15, // Día 15 del mes
                    PeriodicidadPago = "trimestral",
                    MetodoPago = "tarjeta",
                    FechaFirma = today.AddMonths(-3).ToString("O"),
                    FechaInicio = today.AddMonths(-3).ToString("O"),
                    FechaFin = today.AddMonths(9).ToString("O"),
                    NumeroCasas = 90,
                    EstadoContrato = "activo",
                    AsesorVentas = "Ana Martínez",
                    Notas = "Contrato promocional para servicios de seguridad",
                    DocumentosAdjuntos = "/documentos/contratos/CT-BRU-2024-002.pdf",
                    IsActive = true,
                    CreatedAt = today.AddMonths(-3).ToString("O")
                }
            };

            await _context.Contratos.AddRangeAsync(contratosBruselas);
            await _context.SaveChangesAsync();

            // Generar cargos para cada contrato
            foreach (var contrato in contratosBruselas)
            {
                await GenerarCargosParaContrato(contrato);
            }

            // Generar pagos para los cargos de Bruselas
            await GenerarPagosParaCargos(bruselasCommunityId);
        }

        if (!existingContratosCotoBerlin)
        {
            var today = DateTime.UtcNow;
            var contratosCotoBerlin = new List<Contrato>
            {
                new Contrato
                {
                    Id = Guid.NewGuid(),
                    CommunityId = cotoBerlinCommunityId,
                    TipoContrato = "estandar",
                    FolioContrato = "CT-CB-2024-001",
                    RepresentanteComunidad = "Juan Pérez Hernández",
                    CostoTotal = 350000.00m,
                    MontoPagoParcial = 29166.67m, // 350000 / 12 meses
                    NumeroPagosParciales = 12, // 12 pagos mensuales
                    DiaPago = 1, // Día 1 de cada mes
                    PeriodicidadPago = "mensual",
                    MetodoPago = "transferencia",
                    FechaFirma = today.AddMonths(-12).ToString("O"),
                    FechaInicio = today.AddMonths(-12).ToString("O"),
                    FechaFin = today.AddMonths(12).ToString("O"),
                    NumeroCasas = 240,
                    EstadoContrato = "activo",
                    AsesorVentas = "Carlos Rodríguez",
                    Notas = "Contrato estándar anual para servicios completos de administración",
                    DocumentosAdjuntos = "/documentos/contratos/CT-CB-2024-001.pdf",
                    IsActive = true,
                    CreatedAt = today.AddMonths(-12).ToString("O")
                },
                new Contrato
                {
                    Id = Guid.NewGuid(),
                    CommunityId = cotoBerlinCommunityId,
                    TipoContrato = "estandar",
                    FolioContrato = "CT-CB-2024-002",
                    RepresentanteComunidad = "Juan Pérez Hernández",
                    CostoTotal = 85000.00m,
                    MontoPagoParcial = 28333.33m, // 85000 / 3 trimestres
                    NumeroPagosParciales = 3, // 3 pagos trimestrales
                    DiaPago = 10, // Día 10 del mes
                    PeriodicidadPago = "trimestral",
                    MetodoPago = "transferencia",
                    FechaFirma = today.AddMonths(-8).ToString("O"),
                    FechaInicio = today.AddMonths(-8).ToString("O"),
                    FechaFin = today.AddMonths(4).ToString("O"),
                    NumeroCasas = 240,
                    EstadoContrato = "activo",
                    AsesorVentas = "María López",
                    Notas = "Contrato para servicios de mantenimiento de áreas comunes",
                    DocumentosAdjuntos = "/documentos/contratos/CT-CB-2024-002.pdf",
                    IsActive = true,
                    CreatedAt = today.AddMonths(-8).ToString("O")
                },
                new Contrato
                {
                    Id = Guid.NewGuid(),
                    CommunityId = cotoBerlinCommunityId,
                    TipoContrato = "prueba",
                    FolioContrato = "CT-CB-2024-003",
                    RepresentanteComunidad = "Juan Pérez Hernández",
                    CostoTotal = 25000.00m,
                    MontoPagoParcial = 8333.33m, // 25000 / 3 meses (prueba)
                    NumeroPagosParciales = 3, // 3 pagos mensuales (prueba)
                    DiaPago = 20, // Día 20 de cada mes
                    PeriodicidadPago = "mensual",
                    MetodoPago = "efectivo",
                    FechaFirma = today.AddMonths(-1).ToString("O"),
                    FechaInicio = today.AddMonths(-1).ToString("O"),
                    FechaFin = today.AddMonths(2).ToString("O"),
                    NumeroCasas = 50,
                    EstadoContrato = "activo",
                    AsesorVentas = "Ana Martínez",
                    Notas = "Contrato de prueba para nuevo servicio de limpieza",
                    DocumentosAdjuntos = "/documentos/contratos/CT-CB-2024-003.pdf",
                    IsActive = true,
                    CreatedAt = today.AddMonths(-1).ToString("O")
                }
            };

            await _context.Contratos.AddRangeAsync(contratosCotoBerlin);
            await _context.SaveChangesAsync();

            // Generar cargos para cada contrato
            foreach (var contrato in contratosCotoBerlin)
            {
                await GenerarCargosParaContrato(contrato);
            }

            // Generar pagos para los cargos de Coto Berlin
            await GenerarPagosParaCargos(cotoBerlinCommunityId);
        }
    }

    /// <summary>
    /// Genera los cargos de comunidad basándose en el número de pagos parciales del contrato
    /// </summary>
    private async Task GenerarCargosParaContrato(Contrato contrato)
    {
        var cargos = new List<CargosComunidad>();
        var fechaInicio = DateTime.Parse(contrato.FechaInicio);
        var today = DateTime.UtcNow;

        for (int i = 0; i < contrato.NumeroPagosParciales; i++)
        {
            DateTime fechaPago;

            // Calcular la fecha de pago según la periodicidad
            switch (contrato.PeriodicidadPago.ToLower())
            {
                case "mensual":
                    fechaPago = fechaInicio.AddMonths(i);
                    // Ajustar al día de pago especificado
                    fechaPago = new DateTime(fechaPago.Year, fechaPago.Month, Math.Min(contrato.DiaPago, DateTime.DaysInMonth(fechaPago.Year, fechaPago.Month)));
                    break;
                case "trimestral":
                    fechaPago = fechaInicio.AddMonths(i * 3);
                    fechaPago = new DateTime(fechaPago.Year, fechaPago.Month, Math.Min(contrato.DiaPago, DateTime.DaysInMonth(fechaPago.Year, fechaPago.Month)));
                    break;
                case "anual":
                    fechaPago = fechaInicio.AddYears(i);
                    fechaPago = new DateTime(fechaPago.Year, fechaPago.Month, Math.Min(contrato.DiaPago, DateTime.DaysInMonth(fechaPago.Year, fechaPago.Month)));
                    break;
                default:
                    // Por defecto, mensual
                    fechaPago = fechaInicio.AddMonths(i);
                    fechaPago = new DateTime(fechaPago.Year, fechaPago.Month, Math.Min(contrato.DiaPago, DateTime.DaysInMonth(fechaPago.Year, fechaPago.Month)));
                    break;
            }

            // Determinar el estatus del cargo
            string estatus;
            if (fechaPago.Date > today.Date)
            {
                estatus = "No vencido";
            }
            else
            {
                // Si la fecha de pago ya pasó, está vencido
                estatus = "vencido";
            }

            var cargo = new CargosComunidad
            {
                Id = Guid.NewGuid(),
                ContratoId = contrato.Id,
                ComunidadId = contrato.CommunityId,
                MontoCargo = contrato.MontoPagoParcial,
                FechaDePago = fechaPago.ToString("O"),
                MontoRecargos = 0m,
                Estatus = estatus,
                Notas = $"Cargo {i + 1} de {contrato.NumeroPagosParciales} - {contrato.FolioContrato}",
                IsActive = true,
                CreatedAt = contrato.CreatedAt
            };

            cargos.Add(cargo);
        }

        await _context.CargosComunidad.AddRangeAsync(cargos);
        await _context.SaveChangesAsync();
    }

    /// <summary>
    /// Genera diferentes tipos de pagos relacionados con los cargos:
    /// 1. Pagos completos de un cargo
    /// 2. Pagos parciales para un mismo cargo
    /// 3. Pagos que abarcan múltiples cargos
    /// </summary>
    private async Task GenerarPagosParaCargos(Guid comunidadId)
    {
        var today = DateTime.UtcNow;
        
        // Obtener todos los cargos de la comunidad que estén vencidos o próximos a vencer
        var cargos = await _context.CargosComunidad
            .Where(c => c.ComunidadId == comunidadId && c.IsActive)
            .OrderBy(c => c.FechaDePago)
            .ToListAsync();

        if (!cargos.Any())
            return;

        var pagos = new List<PagoComunidad>();
        var pagoCargos = new List<PagoCargoComunidad>();

        // Obtener un usuario para asignar como UpdatedByUserId (usar el primer admin disponible)
        var adminUser = await _context.Users
            .Where(u => u.RoleId == new Guid("22222222-2222-2222-2222-222222222222"))
            .FirstOrDefaultAsync();

        // 1. PAGO COMPLETO DE UN CARGO (primer cargo vencido)
        var cargoCompleto = cargos.FirstOrDefault(c => DateTime.Parse(c.FechaDePago) < today);
        if (cargoCompleto != null)
        {
            var pagoCompleto = new PagoComunidad
            {
                Id = Guid.NewGuid(),
                MontoPago = cargoCompleto.MontoCargo + cargoCompleto.MontoRecargos,
                FormaDePago = "transferencia",
                FechaDePago = today.AddDays(-5).ToString("O"), // Pago realizado hace 5 días
                IsActive = true,
                CreatedAt = today.AddDays(-5).ToString("O"),
                UpdatedByUserId = adminUser?.Id
            };
            pagos.Add(pagoCompleto);

            var pagoCargoCompleto = new PagoCargoComunidad
            {
                Id = Guid.NewGuid(),
                PagoComunidadId = pagoCompleto.Id,
                CargosComunidadId = cargoCompleto.Id,
                MontoAplicado = pagoCompleto.MontoPago,
                CreatedAt = pagoCompleto.CreatedAt
            };
            pagoCargos.Add(pagoCargoCompleto);

            // Actualizar estatus del cargo a "pagado"
            cargoCompleto.Estatus = "pagado";
        }

        // 2. PAGOS PARCIALES PARA UN MISMO CARGO (segundo cargo vencido, si existe)
        var cargoParcial = cargos
            .Where(c => c.Id != cargoCompleto?.Id && DateTime.Parse(c.FechaDePago) < today && c.Estatus != "pagado")
            .FirstOrDefault();
        if (cargoParcial != null)
        {
            var montoTotal = cargoParcial.MontoCargo + cargoParcial.MontoRecargos;
            var montoParcial1 = montoTotal * 0.4m; // Primer pago parcial del 40%
            var montoParcial2 = montoTotal * 0.35m; // Segundo pago parcial del 35%
            var montoParcial3 = montoTotal - montoParcial1 - montoParcial2; // Tercer pago del 25% restante

            // Primer pago parcial
            var pagoParcial1 = new PagoComunidad
            {
                Id = Guid.NewGuid(),
                MontoPago = montoParcial1,
                FormaDePago = "tarjeta",
                FechaDePago = today.AddDays(-10).ToString("O"),
                IsActive = true,
                CreatedAt = today.AddDays(-10).ToString("O"),
                UpdatedByUserId = adminUser?.Id
            };
            pagos.Add(pagoParcial1);

            var pagoCargoParcial1 = new PagoCargoComunidad
            {
                Id = Guid.NewGuid(),
                PagoComunidadId = pagoParcial1.Id,
                CargosComunidadId = cargoParcial.Id,
                MontoAplicado = montoParcial1,
                CreatedAt = pagoParcial1.CreatedAt
            };
            pagoCargos.Add(pagoCargoParcial1);

            // Segundo pago parcial
            var pagoParcial2 = new PagoComunidad
            {
                Id = Guid.NewGuid(),
                MontoPago = montoParcial2,
                FormaDePago = "efectivo",
                FechaDePago = today.AddDays(-3).ToString("O"),
                IsActive = true,
                CreatedAt = today.AddDays(-3).ToString("O"),
                UpdatedByUserId = adminUser?.Id
            };
            pagos.Add(pagoParcial2);

            var pagoCargoParcial2 = new PagoCargoComunidad
            {
                Id = Guid.NewGuid(),
                PagoComunidadId = pagoParcial2.Id,
                CargosComunidadId = cargoParcial.Id,
                MontoAplicado = montoParcial2,
                CreatedAt = pagoParcial2.CreatedAt
            };
            pagoCargos.Add(pagoCargoParcial2);

            // Tercer pago parcial (completa el cargo)
            var pagoParcial3 = new PagoComunidad
            {
                Id = Guid.NewGuid(),
                MontoPago = montoParcial3,
                FormaDePago = "transferencia",
                FechaDePago = today.ToString("O"),
                IsActive = true,
                CreatedAt = today.ToString("O"),
                UpdatedByUserId = adminUser?.Id
            };
            pagos.Add(pagoParcial3);

            var pagoCargoParcial3 = new PagoCargoComunidad
            {
                Id = Guid.NewGuid(),
                PagoComunidadId = pagoParcial3.Id,
                CargosComunidadId = cargoParcial.Id,
                MontoAplicado = montoParcial3,
                CreatedAt = pagoParcial3.CreatedAt
            };
            pagoCargos.Add(pagoCargoParcial3);

            // Actualizar estatus del cargo a "pagado" (ya se completó con los 3 pagos)
            cargoParcial.Estatus = "pagado";
        }

        // 3. PAGO PARCIAL INCOMPLETO (otro cargo - solo se pagó una parte)
        var cargoParcialIncompleto = cargos
            .Where(c => c.Id != cargoCompleto?.Id && 
                       c.Id != cargoParcial?.Id && 
                       DateTime.Parse(c.FechaDePago) < today && 
                       c.Estatus != "pagado")
            .FirstOrDefault();
        
        if (cargoParcialIncompleto != null)
        {
            var montoTotalIncompleto = cargoParcialIncompleto.MontoCargo + cargoParcialIncompleto.MontoRecargos;
            var montoPagoParcialIncompleto = montoTotalIncompleto * 0.6m; // Solo se pagó el 60%

            var pagoIncompleto = new PagoComunidad
            {
                Id = Guid.NewGuid(),
                MontoPago = montoPagoParcialIncompleto,
                FormaDePago = "tarjeta",
                FechaDePago = today.AddDays(-7).ToString("O"),
                IsActive = true,
                CreatedAt = today.AddDays(-7).ToString("O"),
                UpdatedByUserId = adminUser?.Id
            };
            pagos.Add(pagoIncompleto);

            var pagoCargoIncompleto = new PagoCargoComunidad
            {
                Id = Guid.NewGuid(),
                PagoComunidadId = pagoIncompleto.Id,
                CargosComunidadId = cargoParcialIncompleto.Id,
                MontoAplicado = montoPagoParcialIncompleto,
                CreatedAt = pagoIncompleto.CreatedAt
            };
            pagoCargos.Add(pagoCargoIncompleto);

            // Actualizar estatus del cargo a "pago parcial"
            cargoParcialIncompleto.Estatus = "pago parcial";
        }

        // 4. PAGO QUE ABARCA MÚLTIPLES CARGOS (dos cargos diferentes)
        var cargosMultiples = cargos
            .Where(c => c.Id != cargoCompleto?.Id && 
                       c.Id != cargoParcial?.Id && 
                       c.Id != cargoParcialIncompleto?.Id &&
                       DateTime.Parse(c.FechaDePago) < today && 
                       c.Estatus != "pagado")
            .Take(2)
            .ToList();

        if (cargosMultiples.Count == 2)
        {
            var montoTotalMultiples = cargosMultiples.Sum(c => c.MontoCargo + c.MontoRecargos);
            
            var pagoMultiples = new PagoComunidad
            {
                Id = Guid.NewGuid(),
                MontoPago = montoTotalMultiples,
                FormaDePago = "transferencia",
                FechaDePago = today.AddDays(-2).ToString("O"),
                IsActive = true,
                CreatedAt = today.AddDays(-2).ToString("O"),
                UpdatedByUserId = adminUser?.Id
            };
            pagos.Add(pagoMultiples);

            // Distribuir el pago entre los dos cargos
            foreach (var cargo in cargosMultiples)
            {
                var montoAplicado = cargo.MontoCargo + cargo.MontoRecargos;
                var pagoCargoMultiple = new PagoCargoComunidad
                {
                    Id = Guid.NewGuid(),
                    PagoComunidadId = pagoMultiples.Id,
                    CargosComunidadId = cargo.Id,
                    MontoAplicado = montoAplicado,
                    CreatedAt = pagoMultiples.CreatedAt
                };
                pagoCargos.Add(pagoCargoMultiple);

                // Actualizar estatus del cargo a "pagado"
                cargo.Estatus = "pagado";
            }
        }

        // Guardar todos los pagos y relaciones
        if (pagos.Any())
        {
            await _context.PagoComunidad.AddRangeAsync(pagos);
            await _context.SaveChangesAsync();

            if (pagoCargos.Any())
            {
                await _context.PagoCargoComunidad.AddRangeAsync(pagoCargos);
                await _context.SaveChangesAsync();
            }

            // Actualizar los estatus de los cargos
            await _context.SaveChangesAsync();
        }
    }
}

