using Xunit;
using Microsoft.EntityFrameworkCore;
using HappyHabitat.Infrastructure.Data;
using HappyHabitat.Infrastructure.Services;
using HappyHabitat.Application.DTOs;
using HappyHabitat.Domain.Entities;

namespace HappyHabitat.Infrastructure.Tests.Services;

public class TicketServiceTests
{
    private static ApplicationDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        return new ApplicationDbContext(options);
    }

    [Fact]
    public async Task GetByIdAsync_WhenTicketExists_ReturnsDto()
    {
        await using var context = CreateContext();
        var community = new Community { Id = Guid.NewGuid(), Nombre = "Test", Descripcion = "", Direccion = "", Contacto = "", Email = "", Phone = "", TipoComunidad = "", CantidadViviendas = 0 };
        var resident = new Resident { Id = Guid.NewGuid(), UserId = Guid.NewGuid(), CommunityId = community.Id, FullName = "Resident", Address = "", CreatedAt = DateTime.UtcNow };
        var categoria = new CategoriaTicket { Id = 1, Categoria = "Mantenimiento" };
        var status = new StatusTicket { Id = 1, Code = "Nuevo", Descripcion = "Nuevo", Color = "#gray" };
        context.Communities.Add(community);
        context.Residents.Add(resident);
        context.CategoriasTicket.Add(categoria);
        context.StatusTickets.Add(status);
        var ticket = new Ticket
        {
            CommunityId = community.Id,
            ResidentId = resident.Id,
            CategoriaTicketId = 1,
            StatusId = 1,
            FechaReporte = DateTime.UtcNow,
            Contenido = "Test content",
            CreatedAt = DateTime.UtcNow
        };
        context.Tickets.Add(ticket);
        await context.SaveChangesAsync();

        var service = new TicketService(context);
        var result = await service.GetByIdAsync(ticket.Id);

        Assert.NotNull(result);
        Assert.Equal(ticket.Id, result.Id);
        Assert.Equal("Test content", result.Contenido);
        Assert.Equal(community.Id, result.CommunityId);
    }

    [Fact]
    public async Task GetByIdAsync_WhenTicketNotExists_ReturnsNull()
    {
        await using var context = CreateContext();
        var service = new TicketService(context);
        var result = await service.GetByIdAsync(99999);
        Assert.Null(result);
    }

    [Fact]
    public async Task CreateAsync_WithValidData_ReturnsCreatedTicket()
    {
        await using var context = CreateContext();
        var community = new Community { Id = Guid.NewGuid(), Nombre = "Test", Descripcion = "", Direccion = "", Contacto = "", Email = "", Phone = "", TipoComunidad = "", CantidadViviendas = 0 };
        var resident = new Resident { Id = Guid.NewGuid(), UserId = Guid.NewGuid(), CommunityId = community.Id, FullName = "Resident", Address = "", CreatedAt = DateTime.UtcNow };
        var categoria = new CategoriaTicket { Id = 1, Categoria = "Mantenimiento" };
        var status = new StatusTicket { Id = 1, Code = "Nuevo", Descripcion = "Nuevo", Color = "#gray" };
        context.Communities.Add(community);
        context.Residents.Add(resident);
        context.CategoriasTicket.Add(categoria);
        context.StatusTickets.Add(status);
        await context.SaveChangesAsync();

        var service = new TicketService(context);
        var dto = new CreateTicketDto { CategoriaTicketId = 1, Contenido = "New ticket" };
        var result = await service.CreateAsync(resident.Id, dto);

        Assert.NotNull(result);
        Assert.True(result.Id > 0);
        Assert.Equal("New ticket", result.Contenido);
        Assert.Equal(resident.Id, result.ResidentId);
    }

    [Fact]
    public async Task CreateAsync_WhenResidentNotFound_ThrowsInvalidOperationException()
    {
        await using var context = CreateContext();
        var service = new TicketService(context);
        var dto = new CreateTicketDto { CategoriaTicketId = 1, Contenido = "New" };
        await Assert.ThrowsAsync<InvalidOperationException>(() =>
            service.CreateAsync(Guid.NewGuid(), dto));
    }

    [Fact]
    public async Task UpdateAsync_WhenTicketExists_ReturnsUpdatedDto()
    {
        await using var context = CreateContext();
        var community = new Community { Id = Guid.NewGuid(), Nombre = "Test", Descripcion = "", Direccion = "", Contacto = "", Email = "", Phone = "", TipoComunidad = "", CantidadViviendas = 0 };
        var resident = new Resident { Id = Guid.NewGuid(), UserId = Guid.NewGuid(), CommunityId = community.Id, FullName = "Resident", Address = "", CreatedAt = DateTime.UtcNow };
        var categoria = new CategoriaTicket { Id = 1, Categoria = "Mantenimiento" };
        var status = new StatusTicket { Id = 1, Code = "Nuevo", Descripcion = "Nuevo", Color = "#gray" };
        context.Communities.Add(community);
        context.Residents.Add(resident);
        context.CategoriasTicket.Add(categoria);
        context.StatusTickets.Add(status);
        var ticket = new Ticket
        {
            CommunityId = community.Id,
            ResidentId = resident.Id,
            CategoriaTicketId = 1,
            StatusId = 1,
            FechaReporte = DateTime.UtcNow,
            Contenido = "Original",
            CreatedAt = DateTime.UtcNow
        };
        context.Tickets.Add(ticket);
        await context.SaveChangesAsync();

        var service = new TicketService(context);
        var result = await service.UpdateAsync(ticket.Id, new UpdateTicketDto { Contenido = "Updated" });

        Assert.NotNull(result);
        Assert.Equal("Updated", result.Contenido);
    }

    [Fact]
    public async Task DeleteAsync_WhenTicketExists_ReturnsTrue()
    {
        await using var context = CreateContext();
        var community = new Community { Id = Guid.NewGuid(), Nombre = "Test", Descripcion = "", Direccion = "", Contacto = "", Email = "", Phone = "", TipoComunidad = "", CantidadViviendas = 0 };
        var resident = new Resident { Id = Guid.NewGuid(), UserId = Guid.NewGuid(), CommunityId = community.Id, FullName = "Resident", Address = "", CreatedAt = DateTime.UtcNow };
        context.Communities.Add(community);
        context.Residents.Add(resident);
        var ticket = new Ticket
        {
            CommunityId = community.Id,
            ResidentId = resident.Id,
            CategoriaTicketId = 1,
            StatusId = 1,
            FechaReporte = DateTime.UtcNow,
            CreatedAt = DateTime.UtcNow
        };
        context.Tickets.Add(ticket);
        await context.SaveChangesAsync();

        var service = new TicketService(context);
        var result = await service.DeleteAsync(ticket.Id);

        Assert.True(result);
        var deleted = await context.Tickets.FindAsync(ticket.Id);
        Assert.Null(deleted);
    }
}
