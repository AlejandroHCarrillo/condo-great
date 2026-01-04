using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using HappyHabitat.Infrastructure.Data;
using HappyHabitat.Infrastructure.Services;
using HappyHabitat.Infrastructure.Seeders;
using HappyHabitat.Application.Interfaces;
using System.Reflection;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();

// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:4200", "https://localhost:4200", 
                          "http://localhost:5080", "https://localhost:7177")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// Configure Entity Framework with SQL Server and Windows Authentication
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(connectionString));

// Configure JWT Authentication
var jwtKey = builder.Configuration["Jwt:Key"] ?? "YourSuperSecretKeyThatShouldBeAtLeast32CharactersLong!";
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "HappyHabitat";
var jwtAudience = builder.Configuration["Jwt:Audience"] ?? "HappyHabitatUsers";

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtIssuer,
        ValidAudience = jwtAudience,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
    };
});

builder.Services.AddAuthorization();

// Register application services
builder.Services.AddScoped<IPasswordHasherService, PasswordHasherService>();
builder.Services.AddScoped<IJwtService, JwtService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IVehicleService, VehicleService>();
builder.Services.AddScoped<IPetService, PetService>();
builder.Services.AddScoped<IResidentVisitService, ResidentVisitService>();

// Register seeders
builder.Services.AddScoped<InitialSeeder>();
builder.Services.AddScoped<DummySeeder>();

// Configure Swagger/OpenAPI with authorization
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Happy Habitat API",
        Version = "v1",
        Description = "API for Happy Habitat Management System"
    });

    // Add JWT Bearer authentication to Swagger
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Enter 'Bearer' [space] and then your token in the text input below.",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });

    // Include XML comments if available
    var xmlFile = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
    if (File.Exists(xmlPath))
    {
        c.IncludeXmlComments(xmlPath);
    }
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Happy Habitat API v1");
        c.RoutePrefix = string.Empty; // Set Swagger UI at the app's root
    });
}

// CORS must be before UseHttpsRedirection and Authentication
app.UseCors("AllowFrontend");

// Only redirect to HTTPS in production (not in development to avoid CORS issues)
if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Ensure database is created and seed initial data
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<ApplicationDbContext>();
        var logger = services.GetRequiredService<ILogger<Program>>();
        var configuration = services.GetRequiredService<IConfiguration>();
        
        // Check if database should be recreated
        var recreateDatabase = configuration.GetValue<bool>("Database:RecreateOnStartup", false);
        
        if (recreateDatabase)
        {
            logger.LogWarning("RecreateOnStartup is enabled. Dropping and recreating database...");
            await context.Database.EnsureDeletedAsync();
            logger.LogInformation("Database dropped successfully.");
        }
        
        // Ensure database is created
        await context.Database.EnsureCreatedAsync();
        logger.LogInformation("Database ensured/created successfully.");

        // Seed initial data (roles and admin user)
        var initialSeeder = services.GetRequiredService<InitialSeeder>();
        await initialSeeder.SeedAsync();
        logger.LogInformation("Initial data seeded successfully.");

        // Seed dummy data only in development environment
        if (app.Environment.IsDevelopment())
        {
            var dummySeeder = services.GetRequiredService<DummySeeder>();
            await dummySeeder.SeedAsync();
            logger.LogInformation("Dummy data seeded successfully.");
        }
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred while creating the database or seeding data.");
    }
}

app.Run();
