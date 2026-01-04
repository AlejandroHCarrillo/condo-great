using Microsoft.EntityFrameworkCore;
using HappyHabitat.Application.DTOs;
using HappyHabitat.Application.Interfaces;
using HappyHabitat.Domain.Entities;
using HappyHabitat.Infrastructure.Data;

namespace HappyHabitat.Infrastructure.Services;

public class PetService : IPetService
{
    private readonly ApplicationDbContext _context;

    public PetService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<PetDto>> GetAllPetsAsync()
    {
        var pets = await _context.Pets
            .Include(p => p.Resident)
            .ToListAsync();

        return pets.Select(p => new PetDto
        {
            Id = p.Id,
            ResidentId = p.ResidentId,
            ResidentName = p.Resident.FullName,
            Name = p.Name,
            Species = p.Species,
            Breed = p.Breed,
            Age = p.Age,
            Color = p.Color,
            CreatedAt = p.CreatedAt
        });
    }

    public async Task<PetDto?> GetPetByIdAsync(Guid id)
    {
        var pet = await _context.Pets
            .Include(p => p.Resident)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (pet == null)
            return null;

        return new PetDto
        {
            Id = pet.Id,
            ResidentId = pet.ResidentId,
            ResidentName = pet.Resident.FullName,
            Name = pet.Name,
            Species = pet.Species,
            Breed = pet.Breed,
            Age = pet.Age,
            Color = pet.Color,
            CreatedAt = pet.CreatedAt
        };
    }

    public async Task<IEnumerable<PetDto>> GetPetsByResidentIdAsync(Guid residentId)
    {
        var pets = await _context.Pets
            .Include(p => p.Resident)
            .Where(p => p.ResidentId == residentId)
            .ToListAsync();

        return pets.Select(p => new PetDto
        {
            Id = p.Id,
            ResidentId = p.ResidentId,
            ResidentName = p.Resident.FullName,
            Name = p.Name,
            Species = p.Species,
            Breed = p.Breed,
            Age = p.Age,
            Color = p.Color,
            CreatedAt = p.CreatedAt
        });
    }

    public async Task<PetDto> CreatePetAsync(CreatePetDto createPetDto)
    {
        // Verify resident exists
        var resident = await _context.Residents.FindAsync(createPetDto.ResidentId);
        if (resident == null)
            throw new InvalidOperationException("Resident not found");

        var pet = new Pet
        {
            Id = Guid.NewGuid(),
            ResidentId = createPetDto.ResidentId,
            Name = createPetDto.Name,
            Species = createPetDto.Species,
            Breed = createPetDto.Breed,
            Age = createPetDto.Age,
            Color = createPetDto.Color,
            CreatedAt = DateTime.UtcNow.ToString("O")
        };

        _context.Pets.Add(pet);
        await _context.SaveChangesAsync();

        return new PetDto
        {
            Id = pet.Id,
            ResidentId = pet.ResidentId,
            ResidentName = resident.FullName,
            Name = pet.Name,
            Species = pet.Species,
            Breed = pet.Breed,
            Age = pet.Age,
            Color = pet.Color,
            CreatedAt = pet.CreatedAt
        };
    }

    public async Task<PetDto?> UpdatePetAsync(Guid id, UpdatePetDto updatePetDto)
    {
        var pet = await _context.Pets
            .Include(p => p.Resident)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (pet == null)
            return null;

        // Verify resident exists
        var resident = await _context.Residents.FindAsync(updatePetDto.ResidentId);
        if (resident == null)
            throw new InvalidOperationException("Resident not found");

        pet.ResidentId = updatePetDto.ResidentId;
        pet.Name = updatePetDto.Name;
        pet.Species = updatePetDto.Species;
        pet.Breed = updatePetDto.Breed;
        pet.Age = updatePetDto.Age;
        pet.Color = updatePetDto.Color;

        await _context.SaveChangesAsync();

        return new PetDto
        {
            Id = pet.Id,
            ResidentId = pet.ResidentId,
            ResidentName = resident.FullName,
            Name = pet.Name,
            Species = pet.Species,
            Breed = pet.Breed,
            Age = pet.Age,
            Color = pet.Color,
            CreatedAt = pet.CreatedAt
        };
    }

    public async Task<bool> DeletePetAsync(Guid id)
    {
        var pet = await _context.Pets.FindAsync(id);
        if (pet == null)
            return false;

        _context.Pets.Remove(pet);
        await _context.SaveChangesAsync();
        return true;
    }
}

