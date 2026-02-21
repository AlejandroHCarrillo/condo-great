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
using HappyHabitat.API.Middleware;
using HappyHabitat.API.Models;
using Microsoft.AspNetCore.Mvc;

var builder = WebApplication.CreateBuilder(args);

// Global request body size limit (10 MB) to mitigate large-payload attacks. Controllers can set lower [RequestSizeLimit] per endpoint.
builder.WebHost.ConfigureKestrel(options =>
{
    options.Limits.MaxRequestBodySize = 10 * 1024 * 1024; // 10 MB
});

// Add services to the container.
builder.Services.AddControllers()
    .ConfigureApiBehaviorOptions(options =>
    {
        // Return unified ApiErrorResponse format for model validation errors (400).
        options.InvalidModelStateResponseFactory = context =>
        {
            var errors = context.ModelState
                .Where(e => e.Value?.Errors.Count > 0)
                .ToDictionary(
                    kvp => kvp.Key,
                    kvp => kvp.Value!.Errors.Select(e => e.ErrorMessage).ToArray());
            var response = new ApiErrorResponse
            {
                Code = "VALIDATION_ERROR",
                Message = "Uno o más campos tienen errores de validación.",
                Errors = errors,
                TraceId = context.HttpContext.TraceIdentifier
            };
            return new BadRequestObjectResult(response);
        };
    });

// Configure CORS: in production use Cors:Origins from config (semicolon-separated); in development allow localhost
var isProduction = builder.Environment.IsProduction();
var originsStr = builder.Configuration["Cors:Origins"];
var corsOrigins = string.IsNullOrWhiteSpace(originsStr)
    ? Array.Empty<string>()
    : originsStr.Split(';', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
if (corsOrigins.Length == 0)
{
    if (isProduction)
        throw new InvalidOperationException("En producción debe configurarse Cors:Origins con los orígenes permitidos del frontend (ej. Cors:Origins=https://app.ejemplo.com).");
    corsOrigins = new[] { "http://localhost:4200", "https://localhost:4200", "http://localhost:5080", "https://localhost:7177" };
}
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(corsOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// Configure Entity Framework with SQL Server and Windows Authentication
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(connectionString));

// Configure JWT Authentication (in production, key must be set explicitly)
const string defaultInsecureJwtKey = "YourSuperSecretKeyThatShouldBeAtLeast32CharactersLong!";
var jwtKeyConfig = builder.Configuration["Jwt:Key"];
// var isProduction = builder.Environment.IsProduction();

if (string.IsNullOrWhiteSpace(jwtKeyConfig))
{
    if (isProduction)
        throw new InvalidOperationException("Jwt:Key es obligatorio en producción. Configure el valor en appsettings o variables de entorno.");
    jwtKeyConfig = defaultInsecureJwtKey;
}
else if (isProduction && string.Equals(jwtKeyConfig.Trim(), defaultInsecureJwtKey, StringComparison.Ordinal))
{
    throw new InvalidOperationException("No use la clave JWT por defecto en producción. Configure Jwt:Key con un valor seguro.");
}

var jwtKey = jwtKeyConfig;
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

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("AdminCompanyOrSystemAdmin", policy =>
        policy.RequireRole("ADMIN_COMPANY", "SYSTEM_ADMIN"));
    options.AddPolicy("SystemAdminOnly", policy =>
        policy.RequireRole("SYSTEM_ADMIN"));
});

// Register application services
builder.Services.AddScoped<IPasswordHasherService, PasswordHasherService>();
builder.Services.AddScoped<IJwtService, JwtService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IVehicleService, VehicleService>();
builder.Services.AddScoped<IPetService, PetService>();
builder.Services.AddScoped<IResidentVisitService, ResidentVisitService>();
builder.Services.AddScoped<IBannerService, BannerService>();
builder.Services.AddScoped<IComunicadoService, ComunicadoService>();
builder.Services.AddScoped<IAmenityService, AmenityService>();
builder.Services.AddScoped<ICommunityProviderService, CommunityProviderService>();
builder.Services.AddScoped<ICommunityConfigurationService, CommunityConfigurationService>();
builder.Services.AddScoped<IEncuestaService, EncuestaService>();
builder.Services.AddScoped<ICategoriaTicketService, CategoriaTicketService>();
builder.Services.AddScoped<IStatusTicketService, StatusTicketService>();
builder.Services.AddScoped<ITicketService, TicketService>();
builder.Services.AddScoped<IComentarioService, ComentarioService>();
builder.Services.AddScoped<ICommunityService, CommunityService>();
builder.Services.AddScoped<IContratoService, ContratoService>();
builder.Services.AddScoped<IPaymentHistoryService, PaymentHistoryService>();
builder.Services.AddScoped<IChargesService, ChargesService>();
builder.Services.AddScoped<IResidentService, ResidentService>();
builder.Services.AddScoped<IDocumentService, DocumentService>();

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

// Global exception handling (first so it wraps the whole pipeline)
app.UseMiddleware<ExceptionHandlingMiddleware>();

// CORS must be before UseHttpsRedirection and Authentication
app.UseCors("AllowFrontend");

// Only redirect to HTTPS in production (not in development to avoid CORS issues)
if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

// Serve uploaded documents from ContentRoot/uploads (path: communityId/categoria/residentId/file.ext)
var uploadsPath = Path.Combine(app.Environment.ContentRootPath, "uploads");
if (!Directory.Exists(uploadsPath))
    Directory.CreateDirectory(uploadsPath);
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new Microsoft.Extensions.FileProviders.PhysicalFileProvider(uploadsPath),
    RequestPath = "/uploads"
});

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Ensure database is created and seed initial data (fail startup if this fails)
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var context = services.GetRequiredService<ApplicationDbContext>();
    var logger = services.GetRequiredService<ILogger<Program>>();
    var configuration = services.GetRequiredService<IConfiguration>();

    // Database:RecreateOnStartup — ONLY for development. In production must be false to avoid data loss.
    var recreateDatabase = configuration.GetValue<bool>("Database:RecreateOnStartup", false);
    logger.LogInformation("Database:RecreateOnStartup = {RecreateOnStartup}", recreateDatabase);
    if (isProduction && recreateDatabase)
        throw new InvalidOperationException("Database:RecreateOnStartup no puede estar activado en producción. Configure Database:RecreateOnStartup=false.");

    if (recreateDatabase)
    {
        logger.LogWarning("RecreateOnStartup is enabled. Dropping and recreating database...");
        await context.Database.EnsureDeletedAsync();
        logger.LogInformation("Database dropped successfully.");
    }

    // Apply pending migrations (creates/updates schema)
    await context.Database.MigrateAsync();
    logger.LogInformation("Database migrations applied successfully.");

    // Seed initial data (roles and admin user)
    var initialSeeder = services.GetRequiredService<InitialSeeder>();
    await initialSeeder.SeedAsync();
    logger.LogInformation("Initial data seeded successfully.");

    if (app.Environment.IsDevelopment())
    {
        var dummySeeder = services.GetRequiredService<DummySeeder>();
        await dummySeeder.SeedAsync();
        logger.LogInformation("Dummy data seeded successfully.");
    }
}

// Si se ejecuta con --seed-only, solo aplica migraciones y seed y termina (útil para ejecutar el seed sin reiniciar el backend).
if (Environment.GetCommandLineArgs().Any(a => string.Equals(a, "--seed-only", StringComparison.OrdinalIgnoreCase)))
{
    return;
}

app.Run();
