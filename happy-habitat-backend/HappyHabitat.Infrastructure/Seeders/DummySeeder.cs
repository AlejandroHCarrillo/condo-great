using System.Reflection;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using HappyHabitat.Domain.Entities;
using HappyHabitat.Infrastructure.Data;
using HappyHabitat.Infrastructure.Services;
using System.Linq;

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
                CreatedAt = DateTime.UtcNow
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
                CreatedAt = DateTime.UtcNow
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
                CreatedAt = DateTime.UtcNow
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
                CreatedAt = DateTime.UtcNow
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
                CreatedAt = DateTime.UtcNow
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
                CreatedAt = DateTime.UtcNow
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
                CreatedAt = DateTime.UtcNow
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
                CreatedAt = DateTime.UtcNow
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
                CreatedAt = DateTime.UtcNow
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
                CreatedAt = DateTime.UtcNow
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

        // Seed default community configurations from CommunityConfigurationBase.json for all communities
        await SeedCommunityConfigurationsFromBaseAsync();

        // Seed 10 residents per community (for all communities in the database)
        var firstNames = new[] { "María", "José", "Ana", "Carlos", "Laura", "Pedro", "Isabel", "Miguel", "Carmen", "Francisco", "Elena", "Roberto", "Patricia", "Jorge", "Sofía", "Luis", "Gabriela", "Ricardo", "Daniela", "Alejandro" };
        var lastNames = new[] { "González", "Martínez", "López", "Hernández", "García", "Rodríguez", "Pérez", "Sánchez", "Ramírez", "Torres", "Flores", "Rivera", "Gómez", "Díaz", "Morales", "Reyes", "Jiménez", "Ruiz", "Mendoza", "Vázquez" };

        var allCommunitiesForResidents = await _context.Communities.ToListAsync();
        foreach (var community in allCommunitiesForResidents)
        {
            var currentCount = await _context.Residents.CountAsync(r => r.CommunityId == community.Id);
            var toCreate = 10 - currentCount;
            if (toCreate <= 0) continue;

            var communityPrefix = community.Id.ToString("N")[..8];
            var created = 0;
            for (int i = 1; created < toCreate; i++)
            {
                var suffix = currentCount + i;
                var username = $"res_{communityPrefix}_{suffix}";
                if (await _context.Users.AnyAsync(u => u.Username == username))
                    continue;

                var nameIndex = (currentCount + created) % (firstNames.Length * lastNames.Length);
                var firstName = firstNames[nameIndex % firstNames.Length];
                var lastName = lastNames[nameIndex % lastNames.Length];
                var email = $"{username}@example.com";

                var user = new User
                {
                    Id = Guid.NewGuid(),
                    RoleId = residentRoleId,
                    FirstName = firstName,
                    LastName = lastName,
                    Username = username,
                    Email = email,
                    Password = _passwordHasher.HashPassword("password123"),
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                };
                await _context.Users.AddAsync(user);
                await _context.SaveChangesAsync();

                var userRole = new UserRole
                {
                    Id = Guid.NewGuid(),
                    UserId = user.Id,
                    RoleId = residentRoleId,
                    CreatedAt = DateTime.UtcNow
                };
                await _context.UserRoles.AddAsync(userRole);

                var resident = new Resident
                {
                    Id = Guid.NewGuid(),
                    UserId = user.Id,
                    CommunityId = community.Id,
                    FullName = $"{firstName} {lastName}",
                    Email = email,
                    Phone = "4420000000",
                    Number = $"{suffix:D3}",
                    Address = community.Direccion,
                    CreatedAt = DateTime.UtcNow
                };
                await _context.Residents.AddAsync(resident);
                await _context.SaveChangesAsync();
                created++;
            }
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
                CreatedAt = DateTime.UtcNow
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
                    CreatedAt = DateTime.UtcNow
                },
                new UserCommunity
                {
                    Id = Guid.NewGuid(),
                    UserId = admin1Id,
                    CommunityId = new Guid("ff7bc6fb-0f13-4e37-beb4-7d428520c227"), // Colonia Las Palmas
                    CreatedAt = DateTime.UtcNow
                },
                new UserCommunity
                {
                    Id = Guid.NewGuid(),
                    UserId = admin1Id,
                    CommunityId = new Guid("c4a28c40-a2c7-4190-961c-f3f52ad19c1d"), // Coto San Miguel
                    CreatedAt = DateTime.UtcNow
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
                CreatedAt = DateTime.UtcNow
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
                    CreatedAt = DateTime.UtcNow
                },
                new UserCommunity
                {
                    Id = Guid.NewGuid(),
                    UserId = admin2Id,
                    CommunityId = new Guid("9f3cfa42-d4cd-41b3-95d4-e8f6ffdb204c"), // Capital Sur - Coto Berlin
                    CreatedAt = DateTime.UtcNow
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
                CreatedAt = DateTime.UtcNow
            };
            await _context.Users.AddAsync(admin3);
            await _context.SaveChangesAsync();

            // Associate with 1 community
            var admin3Community = new UserCommunity
            {
                Id = Guid.NewGuid(),
                UserId = admin3Id,
                CommunityId = new Guid("11111111-1111-1111-1111-111111111111"), // Residencial Los Pinos
                CreatedAt = DateTime.UtcNow
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
                    CreatedAt = DateTime.UtcNow
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
                    CreatedAt = DateTime.UtcNow
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
                        CreatedAt = DateTime.UtcNow
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
                    // Username has max length of 15, so we use "res_" (4 chars) + up to 11 chars from name
                    var sanitizedName = community.Nombre
                        .Replace(" ", "_")
                        .Replace("-", "_")
                        .Replace(".", "")
                        .Replace(",", "")
                        .ToLower();
                    // Generate username with max 15 characters: "res_" (4) + name (max 11)
                    var usernameSuffix = sanitizedName.Substring(0, Math.Min(11, sanitizedName.Length));
                    var username = $"res_{usernameSuffix}";
                    var emailName = community.Nombre
                        .Replace(" ", ".")
                        .Replace("-", ".")
                        .Replace(",", "")
                        .ToLower();
                    var email = $"residente.{emailName.Substring(0, Math.Min(25, emailName.Length))}@example.com";
                    var residentFirstNames = new[] { "María", "José", "Ana", "Carlos", "Laura" };
                    var residentLastNames = new[] { "González", "Martínez", "López", "Hernández", "García" };
                    var idx = Array.IndexOf(communitiesToAssociate, communityId);
                    var residentFirstName = residentFirstNames[idx % residentFirstNames.Length];
                    var residentLastName = residentLastNames[idx % residentLastNames.Length];

                    var residentUser = new User
                    {
                        Id = Guid.NewGuid(),
                        RoleId = localResidentRoleId,
                        FirstName = residentFirstName,
                        LastName = residentLastName,
                        Username = username,
                        Email = email,
                        Password = _passwordHasher.HashPassword("password123"),
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow
                    };
                    await _context.Users.AddAsync(residentUser);
                    await _context.SaveChangesAsync();

                    // Add UserRole for the resident
                    var residentUserRole = new UserRole
                    {
                        Id = Guid.NewGuid(),
                        UserId = residentUser.Id,
                        RoleId = localResidentRoleId,
                        CreatedAt = DateTime.UtcNow
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
                        CreatedAt = DateTime.UtcNow
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
                    CreatedAt = DateTime.UtcNow
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
                        CreatedAt = DateTime.UtcNow
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
                        CreatedAt = DateTime.UtcNow
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
                        CreatedAt = DateTime.UtcNow
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
                        CreatedAt = DateTime.UtcNow
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
                        CreatedAt = DateTime.UtcNow
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
                        CreatedAt = DateTime.UtcNow
                    }
                };

                await _context.Pets.AddRangeAsync(pets);
                await _context.SaveChangesAsync();
            }

            // Create 3 visits if they don't exist
            var existingVisitsCount = await _context.ResidentVisits
                .CountAsync(v => v.ResidentId == resident.Id);

            if (existingVisitsCount == 0)
            {
                var today = DateTime.UtcNow;
                var visits = new[]
                {
                    new ResidentVisit
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
                        CreatedAt = today.AddDays(-5)
                    },
                    new ResidentVisit
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
                        CreatedAt = today.AddDays(-2)
                    },
                    new ResidentVisit
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
                        CreatedAt = DateTime.UtcNow
                    }
                };

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
                CreatedAt = DateTime.UtcNow
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
                CreatedAt = DateTime.UtcNow
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
                CreatedAt = DateTime.UtcNow
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
                CreatedAt = DateTime.UtcNow
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
                CreatedAt = DateTime.UtcNow
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
                CreatedAt = DateTime.UtcNow
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
                CreatedAt = DateTime.UtcNow
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
                CreatedAt = DateTime.UtcNow
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
                CreatedAt = DateTime.UtcNow
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
                CreatedAt = DateTime.UtcNow
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
                CreatedAt = DateTime.UtcNow
            });

            await _context.Banners.AddRangeAsync(banners.ToArray());
            await _context.SaveChangesAsync();
        }

        // Create 10 comunicados por cada comunidad de prueba (mismo contenido puede repetirse entre comunidades)
        var allCommunitiesForComunicados = await _context.Communities.ToListAsync();
        var comunicadosTemplates = new[]
        {
            new { Titulo = "Propuesta de reglamento revisión", Subtitulo = "Participación vecinal", Descripcion = "Estimados condóminos: Durante el taller de revisión del reglamento no fue posible concluir con todas las preguntas. La administración compartirá el reglamento con el texto resaltado. Envíen sus dudas o sugerencias por Whatsapp. Fecha límite: 12 de Septiembre.", Fecha = new DateTime(2025, 9, 8), Imagen = (string?)null },
            new { Titulo = "Mantenimiento de la alberca", Subtitulo = "Cierre temporal por limpieza", Descripcion = "La alberca estará cerrada el 2025-09-12 para realizar limpieza profunda y revisión del sistema de filtrado.", Fecha = new DateTime(2025, 9, 12), Imagen = "images/anuncios/manenimiento_alberca.png" },
            new { Titulo = "Jornada de reciclaje", Subtitulo = "Trae tus residuos separados", Descripcion = "Este sábado 2025-09-14 se instalará un punto de acopio en el parque central para reciclaje de papel, plástico y electrónicos.", Fecha = new DateTime(2025, 9, 14), Imagen = "images/anuncios/jornada-reciclaje.png" },
            new { Titulo = "Fumigación preventiva", Subtitulo = "Control de plagas en áreas comunes", Descripcion = "El lunes 2025-09-16 se realizará fumigación en jardines y pasillos. Evita transitar por zonas tratadas durante ese día.", Fecha = new DateTime(2025, 9, 16), Imagen = "images/anuncios/fumigacion.png" },
            new { Titulo = "Reunión vecinal mensual", Subtitulo = "Temas de seguridad y mantenimiento", Descripcion = "La reunión se llevará a cabo el 2025-09-20 a las 18:00 hrs en el salón común. Participa y haz escuchar tu voz.", Fecha = new DateTime(2025, 9, 20), Imagen = "images/anuncios/reunion-mensual.png" },
            new { Titulo = "Instalación de cámaras", Subtitulo = "Mejora de seguridad perimetral", Descripcion = "El 2025-09-22 se instalarán nuevas cámaras en los accesos principales. Habrá personal técnico en el área.", Fecha = new DateTime(2025, 9, 22), Imagen = "images/anuncios/instalacion-camaras.png" },
            new { Titulo = "Decoración de otoño", Subtitulo = "Convocatoria para voluntarios", Descripcion = "El comité invita a decorar áreas comunes con temática otoñal el 2025-09-25. Puedes donar adornos o ayudar en el montaje.", Fecha = new DateTime(2025, 9, 25), Imagen = "images/anuncios/decoracion-otono.png" },
            new { Titulo = "Poda de árboles", Subtitulo = "Mantenimiento de áreas verdes", Descripcion = "El 2025-09-28 se realizará poda en los jardines del lado norte. Favor de retirar objetos personales cercanos.", Fecha = new DateTime(2025, 9, 28), Imagen = "images/anuncios/poda-arboles.png" },
            new { Titulo = "Taller de compostaje", Subtitulo = "Aprende a reducir residuos orgánicos", Descripcion = "El 2025-10-01 se impartirá un taller gratuito sobre compostaje en el salón común. Cupo limitado, regístrate con anticipación.", Fecha = new DateTime(2025, 10, 1), Imagen = "images/anuncios/taller-compostaje.png" },
            new { Titulo = "Festival comunitario", Subtitulo = "Música, comida y juegos", Descripcion = "El 2025-10-06 se celebrará el festival anual en el parque central. ¡Trae a tu familia y disfruta!", Fecha = new DateTime(2025, 10, 6), Imagen = "images/anuncios/festival-comunitario.png" }
        };

        if (allCommunitiesForComunicados.Count > 0)
        {
            var existingComunicadosCount = await _context.Comunicados.CountAsync();
            if (existingComunicadosCount == 0)
            {
                var comunicados = new List<Comunicado>();
                foreach (var community in allCommunitiesForComunicados)
                {
                    foreach (var template in comunicadosTemplates)
                    {
                        comunicados.Add(new Comunicado
                        {
                            Id = Guid.NewGuid(),
                            CommunityId = community.Id,
                            Titulo = template.Titulo,
                            Subtitulo = template.Subtitulo,
                            Descripcion = template.Descripcion,
                            Fecha = template.Fecha,
                            Imagen = template.Imagen,
                            CreatedAt = DateTime.UtcNow
                        });
                    }
                }
                await _context.Comunicados.AddRangeAsync(comunicados);
                await _context.SaveChangesAsync();
            }
        }

        // Seed entre 2 y 5 amenidades por cada comunidad (contenido basado en amenidades.data.ts)
        var allCommunitiesForAmenities = await _context.Communities.ToListAsync();
        var amenityTemplates = new[]
        {
            new { Nombre = "Casa club eventos", Descripcion = "Casa club para eventos", Reglas = "Fines de semana y días festivos reservar por cuatro horas con un costo de 1500 pesos. Uso de asador con costo de 500 pesos extra.", Costo = 1500m, FechaAlta = new DateTime(2025, 11, 8), Imagen = "images/amenidades/coto-berlin-casa-club.png", CapacidadMaxima = (int?)35, NumeroReservacionesSimultaneas = (int?)1 },
            new { Nombre = "Alberca", Descripcion = "Alberca de la comunidad.", Reglas = "Capacidad máxima 35 personas. 5 personas por casa. Máximo 3 horas por reservación por día. No se permiten bebidas embriagantes.", Costo = 0m, FechaAlta = new DateTime(2025, 11, 8), Imagen = "images/amenidades/coto-berlin-alberca.jpg", CapacidadMaxima = (int?)35, NumeroReservacionesSimultaneas = (int?)7 },
            new { Nombre = "Casa club residentes", Descripcion = "Casa club para residentes", Reglas = "Lunes a viernes se puede reservar sin costo durante 2 horas.", Costo = 0m, FechaAlta = new DateTime(2025, 11, 8), Imagen = "images/amenidades/coto-berlin-casa-club.png", CapacidadMaxima = (int?)null, NumeroReservacionesSimultaneas = (int?)1 },
            new { Nombre = "Escalera", Descripcion = "Escalera de aluminio", Reglas = "Todo residente puede usarla registrándose en el sistema por 48 horas.", Costo = 0m, FechaAlta = new DateTime(2025, 11, 8), Imagen = "images/amenidades/coto-berlin-escalera.png", CapacidadMaxima = (int?)null, NumeroReservacionesSimultaneas = (int?)1 },
            new { Nombre = "Cancha de pádel", Descripcion = "Cancha de pádel", Reglas = "Debe registrarse en el sistema o al teléfono.", Costo = 0m, FechaAlta = new DateTime(2025, 11, 8), Imagen = "images/amenidades/", CapacidadMaxima = (int?)null, NumeroReservacionesSimultaneas = (int?)null },
            new { Nombre = "Cancha de fútbol rápido", Descripcion = "Cancha de fútbol rápido", Reglas = "Debe registrarse en el sistema o al teléfono.", Costo = 0m, FechaAlta = new DateTime(2025, 11, 8), Imagen = "images/amenidades/", CapacidadMaxima = (int?)null, NumeroReservacionesSimultaneas = (int?)null },
            new { Nombre = "Cancha de basquetbol", Descripcion = "Cancha de basquetbol", Reglas = "Debe registrarse en el sistema o al teléfono.", Costo = 0m, FechaAlta = new DateTime(2025, 11, 8), Imagen = "images/amenidades/", CapacidadMaxima = (int?)null, NumeroReservacionesSimultaneas = (int?)null },
            new { Nombre = "Gimnasio", Descripcion = "Gimnasio de la comunidad", Reglas = "Próximamente.", Costo = 0m, FechaAlta = new DateTime(2025, 11, 8), Imagen = "images/amenidades/", CapacidadMaxima = (int?)null, NumeroReservacionesSimultaneas = (int?)null }
        };

        if (allCommunitiesForAmenities.Count > 0)
        {
            var existingAmenitiesCount = await _context.Amenities.CountAsync();
            if (existingAmenitiesCount == 0)
            {
                var rnd = new Random();
                var amenityList = new List<Amenity>();
                foreach (var community in allCommunitiesForAmenities)
                {
                    var count = rnd.Next(2, 6); // 2 a 5 inclusive
                    for (var i = 0; i < count; i++)
                    {
                        var t = amenityTemplates[rnd.Next(amenityTemplates.Length)];
                        amenityList.Add(new Amenity
                        {
                            Id = Guid.NewGuid(),
                            Community = community,
                            Nombre = t.Nombre,
                            Descripcion = t.Descripcion,
                            Reglas = t.Reglas,
                            Costo = t.Costo,
                            FechaAlta = t.FechaAlta,
                            Imagen = t.Imagen,
                            CapacidadMaxima = t.CapacidadMaxima,
                            NumeroReservacionesSimultaneas = t.NumeroReservacionesSimultaneas,
                            CreatedAt = DateTime.UtcNow
                        });
                    }
                }
                await _context.Amenities.AddRangeAsync(amenityList);
                await _context.SaveChangesAsync();
            }
        }

        // Seed CommunityProviders: entre 3 y 7 proveedores por comunidad
        if (!await _context.CommunityProviders.AnyAsync())
        {
            var providerTemplates = new[]
            {
                new { BusinessName = "Plomería y Gas El Tubo", TaxId = "PTG850101ABC", Category = "Plomería y gas", Products = "Instalación y reparación de tuberías, calentadores, fugas. Emergencias 24h.", PaymentMethods = "Contado, transferencia, tarjeta a 3 MSI", Rating = (decimal?)4.6m },
                new { BusinessName = "Electricidad Querétaro", TaxId = "EQT920315XYZ", Category = "Electricidad", Products = "Instalaciones eléctricas, mantenimiento, reparación de cortos.", PaymentMethods = "Contado, crédito a 15 días", Rating = (decimal?)4.8m },
                new { BusinessName = "Super Abarrotes La Esquina", TaxId = "SAE881201MNO", Category = "Alimentos y abarrotes", Products = "Despensa, abarrotes, productos de limpieza. Entregas a domicilio.", PaymentMethods = "Contado, tarjeta, crédito a quincena", Rating = (decimal?)4.4m },
                new { BusinessName = "Transportes y Mudanzas del Bajío", TaxId = "TMB780512PQR", Category = "Transporte y mudanzas", Products = "Mudanzas locales, fletes, transporte de muebles y electrodomésticos.", PaymentMethods = "Contado, transferencia", Rating = (decimal?)4.5m },
                new { BusinessName = "Limpieza Profesional Querétaro", TaxId = "LPQ901008STU", Category = "Limpieza", Products = "Limpieza residencial y de áreas comunes, ventanas, pisos.", PaymentMethods = "Contado, mensualidad", Rating = (decimal?)4.7m },
                new { BusinessName = "Jardinería y Paisajismo Verde", TaxId = "JPV860620VWX", Category = "Jardinería", Products = "Diseño de jardines, poda, riego, mantenimiento de áreas verdes.", PaymentMethods = "Contado, contratos mensuales", Rating = (decimal?)4.6m },
                new { BusinessName = "Seguridad Privada Sentinela", TaxId = "SPS950415YZA", Category = "Seguridad", Products = "Vigilancia, rondines, control de acceso, cámaras.", PaymentMethods = "Contrato mensual, transferencia", Rating = (decimal?)4.3m },
                new { BusinessName = "Farmacia del Ahorro - Suc. Centro", TaxId = "FDA751203BCD", Category = "Farmacia", Products = "Medicamentos, productos de cuidado personal, despensa básica.", PaymentMethods = "Contado, tarjeta, meses sin intereses", Rating = (decimal?)4.5m },
                new { BusinessName = "Materiales para Construcción El Mármol", TaxId = "MCE820910EFG", Category = "Construcción y materiales", Products = "Cemento, varilla, block, acabados, herrería.", PaymentMethods = "Contado, crédito a 30 días", Rating = (decimal?)4.4m },
                new { BusinessName = "Aire y Clima del Bajío", TaxId = "ACB930715HIJ", Category = "Tecnología y climatización", Products = "Instalación y mantenimiento de aire acondicionado, minisplits.", PaymentMethods = "Contado, tarjeta 6 MSI", Rating = (decimal?)4.7m },
                new { BusinessName = "Cerrajería Express", TaxId = "CEX880320KLM", Category = "Servicios del hogar", Products = "Cambio de chapas, cerraduras, abrir autos y casas.", PaymentMethods = "Solo contado", Rating = (decimal?)4.2m },
                new { BusinessName = "Pinturas y Recubrimientos Pro", TaxId = "PRP900115NOP", Category = "Pintura y acabados", Products = "Pintura interior y exterior, texturizados, impermeabilizantes.", PaymentMethods = "Contado, crédito a 15 días", Rating = (decimal?)4.6m },
                new { BusinessName = "Papelería y Copias La Oficina", TaxId = "PCO871225QRS", Category = "Papelería", Products = "Copias, impresión, encuadernación, papelería y útiles.", PaymentMethods = "Contado, tarjeta", Rating = (decimal?)4.5m },
                new { BusinessName = "Panadería y Cafetería La Hogaza", TaxId = "PHL940520TUV", Category = "Alimentos", Products = "Pan fresco, repostería, café, desayunos. Pedidos para eventos.", PaymentMethods = "Contado, transferencia", Rating = (decimal?)4.8m },
                new { BusinessName = "Veterinaria Mascotas Felices", TaxId = "VMF910818WXY", Category = "Veterinaria", Products = "Consulta, vacunas, esterilización, peluquería canina.", PaymentMethods = "Contado, tarjeta", Rating = (decimal?)4.7m },
                new { BusinessName = "Lavandería y Tintorería Limpia", TaxId = "LTL860412ZAB", Category = "Lavandería", Products = "Lavado, planchado, tintorería, servicio a domicilio.", PaymentMethods = "Contado, tarjeta", Rating = (decimal?)4.4m },
                new { BusinessName = "Fumigación y Control de Plagas", TaxId = "FCP920630CDE", Category = "Fumigación", Products = "Fumigación residencial, control de plagas, desratización.", PaymentMethods = "Contado, paquetes semestrales", Rating = (decimal?)4.5m },
                new { BusinessName = "Mantenimiento de Albercas Azul", TaxId = "MAA881015FGH", Category = "Mantenimiento", Products = "Limpieza de albercas, análisis de agua, reparación de filtros.", PaymentMethods = "Contrato mensual, contado", Rating = (decimal?)4.6m },
                new { BusinessName = "Tienda de Conveniencia Oxxo", TaxId = "OXX123456789", Category = "Alimentos y conveniencia", Products = "Abarrotes, bebidas, recargas, pagos de servicios.", PaymentMethods = "Contado, tarjeta", Rating = (decimal?)4.3m },
                new { BusinessName = "Tortillería y Molino La Guadalupana", TaxId = "TMG890722IJK", Category = "Alimentos", Products = "Tortillas de maíz y harina, masa, nixtamal.", PaymentMethods = "Contado", Rating = (decimal?)4.7m }
            };

            var rndProvider = new Random();
            var allCommunitiesForProviders = await _context.Communities.ToListAsync();
            var providerList = new List<CommunityProvider>();

            foreach (var community in allCommunitiesForProviders)
            {
                var count = rndProvider.Next(3, 8); // 3 a 7
                var used = new HashSet<int>();
                for (int i = 0; i < count; i++)
                {
                    int idx;
                    do { idx = rndProvider.Next(providerTemplates.Length); } while (!used.Add(idx));
                    var t = providerTemplates[idx];
                    var createdAt = DateTime.UtcNow.AddDays(-rndProvider.Next(30, 400));
                    var slugRaw = new string(t.BusinessName.Where(char.IsLetterOrDigit).ToArray()).ToLowerInvariant();
                    var slug = string.IsNullOrEmpty(slugRaw) ? "proveedor" + idx : slugRaw[..Math.Min(12, slugRaw.Length)];
                    providerList.Add(new CommunityProvider
                    {
                        Id = Guid.NewGuid(),
                        Community = community,
                        BusinessName = t.BusinessName,
                        TaxId = t.TaxId,
                        FullAddress = "Av. Ejemplo 100, Col. Centro, Querétaro, Qro.",
                        ContactPhones = "442 " + rndProvider.Next(100, 999) + " " + rndProvider.Next(1000, 9999),
                        PrimaryEmail = "contacto@" + slug + ".mx",
                        WebsiteOrSocialMedia = "https://www.ejemplo.mx",
                        PrimaryContactName = "Contacto principal",
                        DirectPhone = "442" + rndProvider.Next(1000000, 9999999),
                        MobilePhone = "442" + rndProvider.Next(1000000, 9999999),
                        ContactEmail = "ventas@" + slug + ".mx",
                        ProductsOrServices = t.Products,
                        CategoryOrIndustry = t.Category,
                        PaymentMethods = t.PaymentMethods,
                        Rating = t.Rating,
                        OrderHistory = "Pedidos realizados por la comunidad en el último año. Sin incidencias.",
                        PastIncidentsOrClaims = null,
                        InternalNotes = "Proveedor recomendado por administración.",
                        IsActive = true,
                        CreatedAt = createdAt
                    });
                }
            }

            await _context.CommunityProviders.AddRangeAsync(providerList);
            await _context.SaveChangesAsync();
        }

        // Seed Encuestas: 1 encuesta por comunidad con todos los tipos de pregunta (Texto, Sí/No, Opción única, Opción múltiple)
        if (!await _context.Encuestas.AnyAsync())
        {
            var allCommunitiesForEncuestas = await _context.Communities.ToListAsync();
            var encuestaList = new List<Encuesta>();
            var preguntaList = new List<PreguntaEncuesta>();
            var opcionList = new List<OpcionRespuesta>();

            foreach (var community in allCommunitiesForEncuestas)
            {
                var encuestaId = Guid.NewGuid();
                var fechaInicio = DateTime.UtcNow.AddDays(-7);
                var fechaFin = DateTime.UtcNow.AddDays(30);

                encuestaList.Add(new Encuesta
                {
                    Id = encuestaId,
                    CommunityId = community.Id,
                    Titulo = "Satisfacción y opinión - " + community.Nombre,
                    Descripcion = "Encuesta de opinión para mejorar los servicios y áreas comunes de la comunidad.",
                    FechaInicio = fechaInicio,
                    FechaFin = fechaFin,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow.AddDays(-10)
                });

                // Pregunta 1: Texto libre (TipoPregunta = 0)
                var p1Id = Guid.NewGuid();
                preguntaList.Add(new PreguntaEncuesta
                {
                    Id = p1Id,
                    EncuestaId = encuestaId,
                    TipoPregunta = TipoPreguntaEncuesta.Texto,
                    Pregunta = "¿Qué mejorarías en las áreas comunes? (comentario libre)",
                    CreatedAt = DateTime.UtcNow.AddDays(-10)
                });

                // Pregunta 2: Sí/No (TipoPregunta = 1)
                var p2Id = Guid.NewGuid();
                preguntaList.Add(new PreguntaEncuesta
                {
                    Id = p2Id,
                    EncuestaId = encuestaId,
                    TipoPregunta = TipoPreguntaEncuesta.SiNo,
                    Pregunta = "¿Estás satisfecho con el mantenimiento de las áreas comunes?",
                    CreatedAt = DateTime.UtcNow.AddDays(-10)
                });

                // Pregunta 3: Opción única (TipoPregunta = 2)
                var p3Id = Guid.NewGuid();
                preguntaList.Add(new PreguntaEncuesta
                {
                    Id = p3Id,
                    EncuestaId = encuestaId,
                    TipoPregunta = TipoPreguntaEncuesta.OpcionUnica,
                    Pregunta = "¿Con qué frecuencia usas las áreas comunes?",
                    CreatedAt = DateTime.UtcNow.AddDays(-10)
                });
                var opcionesP3 = new[] { "Varias veces por semana", "Una vez por semana", "Una vez al mes", "Casi nunca" };
                foreach (var resp in opcionesP3)
                {
                    opcionList.Add(new OpcionRespuesta
                    {
                        Id = Guid.NewGuid(),
                        PreguntaEncuestaId = p3Id,
                        Respuesta = resp,
                        CreatedAt = DateTime.UtcNow.AddDays(-10)
                    });
                }

                // Pregunta 4: Opción múltiple (TipoPregunta = 3)
                var p4Id = Guid.NewGuid();
                preguntaList.Add(new PreguntaEncuesta
                {
                    Id = p4Id,
                    EncuestaId = encuestaId,
                    TipoPregunta = TipoPreguntaEncuesta.OpcionMultiple,
                    Pregunta = "¿Qué servicios o mejoras te gustaría que se agregaran? (puedes elegir varios)",
                    CreatedAt = DateTime.UtcNow.AddDays(-10)
                });
                var opcionesP4 = new[] { "Gimnasio", "Área de juegos infantil", "Salón de eventos", "Alberca", "Cancha deportiva", "Cafetería o zona de coworking" };
                foreach (var resp in opcionesP4)
                {
                    opcionList.Add(new OpcionRespuesta
                    {
                        Id = Guid.NewGuid(),
                        PreguntaEncuestaId = p4Id,
                        Respuesta = resp,
                        CreatedAt = DateTime.UtcNow.AddDays(-10)
                    });
                }
            }

            await _context.Encuestas.AddRangeAsync(encuestaList);
            await _context.SaveChangesAsync();
            await _context.PreguntasEncuesta.AddRangeAsync(preguntaList);
            await _context.SaveChangesAsync();
            await _context.OpcionesRespuesta.AddRangeAsync(opcionList);
            await _context.SaveChangesAsync();
        }

        // Seed Documents: entre 3 y 6 documentos por comunidad
        if (!await _context.Documents.AnyAsync())
        {
            var documentTemplates = new[]
            {
                new { Titulo = "Reglamento interno", Descripcion = "Normas de convivencia y uso de áreas comunes.", NombreDocumento = "reglamento.pdf", UrlDoc = "/docs/reglamento.pdf" },
                new { Titulo = "Informe mensual de administración", Descripcion = "Resumen financiero y de actividades del mes.", NombreDocumento = "informe_mensual.pdf", UrlDoc = "/docs/informe_mensual.pdf" },
                new { Titulo = "Lista de proveedores autorizados", Descripcion = "Proveedores activos y datos de contacto.", NombreDocumento = "proveedores.xlsx", UrlDoc = "/docs/proveedores.xlsx" },
                new { Titulo = "Bitácora de mantenimiento", Descripcion = "Registro de intervenciones técnicas y reparaciones.", NombreDocumento = "bitacora_mantenimiento.pdf", UrlDoc = "/docs/bitacora_mantenimiento.pdf" },
                new { Titulo = "Acta de asamblea", Descripcion = "Resumen de la última asamblea de vecinos.", NombreDocumento = "acta_asamblea.pdf", UrlDoc = "/docs/acta_asamblea.pdf" },
                new { Titulo = "Política de mascotas", Descripcion = "Normas para tenencia de mascotas en la comunidad.", NombreDocumento = "politica_mascotas.pdf", UrlDoc = "/docs/politica_mascotas.pdf" },
                new { Titulo = "Manual de emergencias", Descripcion = "Procedimientos ante siniestros y contactos de emergencia.", NombreDocumento = "manual_emergencias.pdf", UrlDoc = "/docs/manual_emergencias.pdf" },
                new { Titulo = "Calendario de mantenimiento", Descripcion = "Programa anual de mantenimiento de áreas comunes.", NombreDocumento = "calendario_mantenimiento.pdf", UrlDoc = "/docs/calendario_mantenimiento.pdf" }
            };

            var userCreatedNames = new[] { "Alejandro Hernández", "Carla Méndez", "Luis Ortega", "María López", "Roberto Díaz", "Patricia Gómez", "Admin Comunidad" };
            var rndDoc = new Random();
            var allCommunitiesForDocs = await _context.Communities.ToListAsync();
            var documentList = new List<Document>();

            foreach (var community in allCommunitiesForDocs)
            {
                var count = rndDoc.Next(3, 7); // 3 a 6 documentos
                var used = new HashSet<int>();
                for (int i = 0; i < count; i++)
                {
                    int idx;
                    do { idx = rndDoc.Next(documentTemplates.Length); } while (!used.Add(idx));
                    var t = documentTemplates[idx];
                    var createdAt = DateTime.UtcNow.AddDays(-rndDoc.Next(10, 180));
                    var fecha = DateTime.UtcNow.AddDays(-rndDoc.Next(5, 120));
                    documentList.Add(new Document
                    {
                        Id = Guid.NewGuid(),
                        CommunityId = community.Id,
                        Titulo = t.Titulo,
                        Descripcion = t.Descripcion,
                        Fecha = fecha,
                        UserCreated = userCreatedNames[rndDoc.Next(userCreatedNames.Length)],
                        NombreDocumento = t.NombreDocumento,
                        UrlDoc = t.UrlDoc,
                        CreatedAt = createdAt
                    });
                }
            }

            await _context.Documents.AddRangeAsync(documentList);
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
                    CreatedAt = today.AddMonths(-6)
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
                    CreatedAt = today.AddMonths(-3)
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
                    CreatedAt = today.AddMonths(-12)
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
                    CreatedAt = today.AddMonths(-8)
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
                    CreatedAt = today.AddMonths(-1)
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
                CreatedAt = today.AddDays(-5),
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
                CreatedAt = today.AddDays(-10),
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
                CreatedAt = today.AddDays(-3),
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
                CreatedAt = today,
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
                CreatedAt = today.AddDays(-7),
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
                CreatedAt = today.AddDays(-2),
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

        // Add vehicles, pets, and visits for all residents
        Console.WriteLine("=== Starting AddVehiclesPetsAndVisitsToAllResidents ===");
        await AddVehiclesPetsAndVisitsToAllResidents();
        Console.WriteLine("=== Finished AddVehiclesPetsAndVisitsToAllResidents ===");
    }

    private async Task AddVehiclesPetsAndVisitsToAllResidents()
    {
        try
        {
            Console.WriteLine("=== AddVehiclesPetsAndVisitsToAllResidents: Starting ===");
            var random = new Random();
            
            // Verificar que hay residentes antes de continuar
            var residentCount = await _context.Residents.CountAsync();
            Console.WriteLine($"AddVehiclesPetsAndVisitsToAllResidents: Total residents in database: {residentCount}");
            
            if (residentCount == 0)
            {
                Console.WriteLine("WARNING: No residents found in database! Skipping vehicles, pets, and visits seeding.");
                return;
            }
            
            var allResidents = await _context.Residents.ToListAsync();
            Console.WriteLine($"AddVehiclesPetsAndVisitsToAllResidents: Loaded {allResidents.Count} residents from database");

        // Get vehicle type IDs
        var carTypeId = new Guid("77777777-7777-7777-7777-777777777777");
        var suvTypeId = new Guid("AAAAAAAA-BBBB-BBBB-BBBB-BBBBBBBBBBBB");
        var motorcycleTypeId = new Guid("88888888-8888-8888-8888-888888888888");
        var truckTypeId = new Guid("99999999-9999-9999-9999-999999999999");
        var vanTypeId = new Guid("BBBBBBBB-CCCC-CCCC-CCCC-CCCCCCCCCCCC");
        var vehicleTypes = new[] { carTypeId, suvTypeId, motorcycleTypeId, truckTypeId, vanTypeId };

        var brands = new[] { "Toyota", "Honda", "Ford", "Chevrolet", "Nissan", "Volkswagen", "BMW", "Mercedes-Benz" };
        var models = new[] { "Camry", "Civic", "F-150", "Silverado", "Altima", "Jetta", "3 Series", "C-Class" };
        var colors = new[] { "Black", "White", "Silver", "Gray", "Red", "Blue", "Green", "Brown" };
        var petNames = new[] { "Max", "Luna", "Charlie", "Bella", "Rocky", "Daisy", "Milo", "Lucy", "Cooper", "Sadie" };
        var petSpecies = new[] { "Dog", "Cat", "Bird", "Rabbit" };
        var dogBreeds = new[] { "Golden Retriever", "Labrador", "German Shepherd", "Bulldog", "Beagle" };
        var catBreeds = new[] { "Persian", "Siamese", "Maine Coon", "British Shorthair", "Ragdoll" };
        var petColors = new[] { "Golden", "Black", "White", "Brown", "Gray", "Orange", "Calico" };
        var visitorNames = new[] { "John Doe", "Jane Smith", "Robert Johnson", "Maria Garcia", "David Wilson", 
            "Sarah Martinez", "Michael Brown", "Emily Davis", "James Wilson", "Lisa Anderson" };
        var visitSubjects = new[] { "Family Visit", "Friend Visit", "Business Meeting", "Weekend Visit", 
            "Family Gathering", "Social Event", "Maintenance", "Delivery" };

            foreach (var resident in allResidents)
            {
                try
                {
                    // Skip if resident already has data (elgrandeahc)
                    var hasVehicles = await _context.Vehicles.AnyAsync(v => v.ResidentId == resident.Id);
                    var hasPets = await _context.Pets.AnyAsync(p => p.ResidentId == resident.Id);
                    var hasVisits = await _context.ResidentVisits.AnyAsync(v => v.ResidentId == resident.Id);
                    
                    Console.WriteLine($"Processing resident {resident.Id} ({resident.FullName}): hasVehicles={hasVehicles}, hasPets={hasPets}, hasVisits={hasVisits}");

                    // Add 0-3 vehicles (but ensure at least some residents have vehicles)
                    if (!hasVehicles)
                    {
                        // Ensure at least 50% of residents have at least 1 vehicle
                        var vehicleCount = random.Next(0, 4); // 0 to 3
                        // If this is one of the first residents and no vehicles yet, ensure at least 1
                        if (vehicleCount == 0 && allResidents.IndexOf(resident) < allResidents.Count / 2)
                        {
                            vehicleCount = random.Next(1, 4); // 1 to 3
                        }
                        var vehicles = new List<Vehicle>();

                        for (int i = 0; i < vehicleCount; i++)
                        {
                            var vehicleTypeId = vehicleTypes[random.Next(vehicleTypes.Length)];
                            var brand = brands[random.Next(brands.Length)];
                            var model = models[random.Next(models.Length)];
                            var color = colors[random.Next(colors.Length)];
                            var year = random.Next(2015, 2024);
                            var licensePlate = $"{brand.Substring(0, 3).ToUpper()}-{random.Next(100, 999)}";

                            vehicles.Add(new Vehicle
                            {
                                Id = Guid.NewGuid(),
                                ResidentId = resident.Id,
                                VehicleTypeId = vehicleTypeId,
                                Brand = brand,
                                Model = model,
                                Year = year,
                                Color = color,
                                LicensePlate = licensePlate,
                                CreatedAt = DateTime.UtcNow
                            });
                        }

                        if (vehicles.Any())
                        {
                            await _context.Vehicles.AddRangeAsync(vehicles);
                            await _context.SaveChangesAsync();
                            Console.WriteLine($"✓ Added {vehicles.Count} vehicles for resident {resident.Id}");
                        }
                        else
                        {
                            Console.WriteLine($"  No vehicles added for resident {resident.Id} (random count was 0)");
                        }
                    }

                    // Add 0-3 pets (but ensure at least some residents have pets)
                    if (!hasPets)
                    {
                        // Ensure at least 50% of residents have at least 1 pet
                        var petCount = random.Next(0, 4); // 0 to 3
                        // If this is one of the first residents and no pets yet, ensure at least 1
                        if (petCount == 0 && allResidents.IndexOf(resident) < allResidents.Count / 2)
                        {
                            petCount = random.Next(1, 4); // 1 to 3
                        }
                        var pets = new List<Pet>();

                        for (int i = 0; i < petCount; i++)
                        {
                            var species = petSpecies[random.Next(petSpecies.Length)];
                            string breed;
                            if (species == "Dog")
                            {
                                breed = dogBreeds[random.Next(dogBreeds.Length)];
                            }
                            else if (species == "Cat")
                            {
                                breed = catBreeds[random.Next(catBreeds.Length)];
                            }
                            else
                            {
                                breed = species;
                            }

                            pets.Add(new Pet
                            {
                                Id = Guid.NewGuid(),
                                ResidentId = resident.Id,
                                Name = petNames[random.Next(petNames.Length)],
                                Species = species,
                                Breed = breed,
                                Age = random.Next(1, 10),
                                Color = petColors[random.Next(petColors.Length)],
                                CreatedAt = DateTime.UtcNow
                            });
                        }

                        if (pets.Any())
                        {
                            await _context.Pets.AddRangeAsync(pets);
                            await _context.SaveChangesAsync();
                            Console.WriteLine($"✓ Added {pets.Count} pets for resident {resident.Id}");
                        }
                        else
                        {
                            Console.WriteLine($"  No pets added for resident {resident.Id} (random count was 0)");
                        }
                    }

                    // Add 1-5 visits
                    if (!hasVisits)
                    {
                        var visitCount = random.Next(1, 6); // 1 to 5
                        var visits = new List<ResidentVisit>();
                        var today = DateTime.UtcNow;

                        for (int i = 0; i < visitCount; i++)
                        {
                            var daysOffset = random.Next(-30, 30); // Visits in the past 30 days or next 30 days
                            var arrivalDate = today.AddDays(daysOffset);
                            var departureDate = arrivalDate.AddDays(random.Next(1, 5)); // 1-4 days stay
                            
                            // Some visits might be ongoing (no departure date)
                            var hasDeparture = random.Next(0, 10) < 8; // 80% chance of having departure date

                            var vehicleColor = random.Next(0, 10) < 7 ? colors[random.Next(colors.Length)] : null; // 70% chance
                            var licensePlate = vehicleColor != null ? $"VIS-{random.Next(100, 999)}" : null;

                            visits.Add(new ResidentVisit
                            {
                                Id = Guid.NewGuid(),
                                ResidentId = resident.Id,
                                VisitorName = visitorNames[random.Next(visitorNames.Length)],
                                TotalPeople = random.Next(1, 5),
                                VehicleColor = vehicleColor,
                                LicensePlate = licensePlate,
                                Subject = visitSubjects[random.Next(visitSubjects.Length)],
                                ArrivalDate = arrivalDate.ToString("O"),
                                DepartureDate = hasDeparture ? departureDate.ToString("O") : null,
                                CreatedAt = arrivalDate
                            });
                        }

                        if (visits.Any())
                        {
                            await _context.ResidentVisits.AddRangeAsync(visits);
                            await _context.SaveChangesAsync();
                            Console.WriteLine($"✓ Added {visits.Count} visits for resident {resident.Id}");
                        }
                        else
                        {
                            Console.WriteLine($"  No visits added for resident {resident.Id} (should not happen, min is 1)");
                        }
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"ERROR processing resident {resident.Id}: {ex.Message}");
                    Console.WriteLine($"Stack trace: {ex.StackTrace}");
                }
            }
            
            // Verificar datos finales
            var finalVehicleCount = await _context.Vehicles.CountAsync();
            var finalPetCount = await _context.Pets.CountAsync();
            var finalVisitCount = await _context.ResidentVisits.CountAsync();
            
            // Verificar cuántos residentes tienen cada tipo de dato
            var residentsWithVehicles = await _context.Residents
                .Where(r => _context.Vehicles.Any(v => v.ResidentId == r.Id))
                .CountAsync();
            var residentsWithPets = await _context.Residents
                .Where(r => _context.Pets.Any(p => p.ResidentId == r.Id))
                .CountAsync();
            var residentsWithVisits = await _context.Residents
                .Where(r => _context.ResidentVisits.Any(v => v.ResidentId == r.Id))
                .CountAsync();
            
            Console.WriteLine($"=== AddVehiclesPetsAndVisitsToAllResidents: Completed successfully ===");
            Console.WriteLine($"Final counts - Vehicles: {finalVehicleCount}, Pets: {finalPetCount}, Visits: {finalVisitCount}");
            Console.WriteLine($"Residents with data - Vehicles: {residentsWithVehicles}/{allResidents.Count}, Pets: {residentsWithPets}/{allResidents.Count}, Visits: {residentsWithVisits}/{allResidents.Count}");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"=== FATAL ERROR in AddVehiclesPetsAndVisitsToAllResidents ===");
            Console.WriteLine($"Error message: {ex.Message}");
            Console.WriteLine($"Stack trace: {ex.StackTrace}");
            if (ex.InnerException != null)
            {
                Console.WriteLine($"Inner exception: {ex.InnerException.Message}");
            }
            throw; // Re-throw to let the caller know there was an error
        }
    }

    /// <summary>
    /// Loads CommunityConfigurationBase.json (embedded resource) and creates one CommunityConfiguration per template for each community that does not have any config yet.
    /// </summary>
    private async Task SeedCommunityConfigurationsFromBaseAsync()
    {
        var assembly = Assembly.GetExecutingAssembly();
        var resourceName = assembly.GetManifestResourceNames()
            .FirstOrDefault(n => n.EndsWith("CommunityConfigurationBase.json", StringComparison.OrdinalIgnoreCase));
        if (string.IsNullOrEmpty(resourceName))
            return;

        await using var stream = assembly.GetManifestResourceStream(resourceName);
        if (stream == null)
            return;

        var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
        var templates = await JsonSerializer.DeserializeAsync<List<CommunityConfigurationBaseItem>>(stream, options);
        if (templates == null || templates.Count == 0)
            return;

        var communityIds = await _context.Communities.Select(c => c.Id).ToListAsync();
        var configsToAdd = new List<CommunityConfiguration>();

        foreach (var communityId in communityIds)
        {
            var existingCount = await _context.CommunityConfigurations.CountAsync(cc => cc.CommunityId == communityId);
            if (existingCount > 0)
                continue;

            foreach (var t in templates)
            {
                configsToAdd.Add(new CommunityConfiguration
                {
                    Id = Guid.NewGuid(),
                    CommunityId = communityId,
                    Titulo = t.Titulo ?? string.Empty,
                    Descripcion = t.Descripcion ?? string.Empty,
                    Valor = t.Valor ?? string.Empty,
                    TipoDato = t.TipoDato ?? "string",
                    CreatedAt = DateTime.UtcNow
                });
            }
        }

        if (configsToAdd.Count > 0)
        {
            await _context.CommunityConfigurations.AddRangeAsync(configsToAdd);
            await _context.SaveChangesAsync();
        }
    }

    private sealed class CommunityConfigurationBaseItem
    {
        public string? Titulo { get; set; }
        public string? Descripcion { get; set; }
        public string? Valor { get; set; }
        public string? TipoDato { get; set; }
    }
}

