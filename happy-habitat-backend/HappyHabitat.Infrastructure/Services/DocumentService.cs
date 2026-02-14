using Microsoft.EntityFrameworkCore;
using HappyHabitat.Application.DTOs;
using HappyHabitat.Application.Interfaces;
using HappyHabitat.Domain.Entities;
using HappyHabitat.Infrastructure.Data;

namespace HappyHabitat.Infrastructure.Services;

public class DocumentService : IDocumentService
{
    private readonly ApplicationDbContext _context;

    public DocumentService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<DocumentDto>> GetAllDocumentsAsync()
    {
        var documents = await _context.Documents
            .Include(d => d.Community)
            .OrderByDescending(d => d.Fecha)
            .ToListAsync();

        return documents.Select(MapToDto);
    }

    public async Task<IEnumerable<DocumentDto>> GetDocumentsByCommunityIdAsync(Guid? communityId)
    {
        var query = _context.Documents
            .Include(d => d.Community)
            .AsQueryable();

        if (communityId.HasValue)
            query = query.Where(d => d.CommunityId == communityId);
        else
            query = query.Where(d => d.CommunityId == null);

        var documents = await query.OrderByDescending(d => d.Fecha).ToListAsync();
        return documents.Select(MapToDto);
    }

    public async Task<DocumentDto?> GetDocumentByIdAsync(Guid id)
    {
        var document = await _context.Documents
            .Include(d => d.Community)
            .FirstOrDefaultAsync(d => d.Id == id);

        return document == null ? null : MapToDto(document);
    }

    public async Task<DocumentDto> CreateDocumentAsync(CreateDocumentDto dto)
    {
        if (dto.CommunityId.HasValue)
        {
            var community = await _context.Communities.FindAsync(dto.CommunityId.Value);
            if (community == null)
                throw new InvalidOperationException("Community not found");
        }

        var document = new Document
        {
            Id = Guid.NewGuid(),
            CommunityId = dto.CommunityId,
            UserId = dto.UserId,
            Titulo = dto.Titulo,
            Descripcion = dto.Descripcion,
            Fecha = dto.Fecha,
            UserCreated = dto.UserCreated,
            NombreDocumento = dto.NombreDocumento,
            UrlDoc = dto.UrlDoc,
            CreatedAt = DateTime.UtcNow.ToString("O")
        };

        _context.Documents.Add(document);
        await _context.SaveChangesAsync();
        await _context.Entry(document).Reference(d => d.Community).LoadAsync();

        return MapToDto(document);
    }

    public async Task<DocumentDto?> UpdateDocumentAsync(Guid id, UpdateDocumentDto dto)
    {
        var document = await _context.Documents
            .Include(d => d.Community)
            .FirstOrDefaultAsync(d => d.Id == id);

        if (document == null)
            return null;

        if (dto.CommunityId.HasValue)
        {
            var community = await _context.Communities.FindAsync(dto.CommunityId.Value);
            if (community == null)
                throw new InvalidOperationException("Community not found");
        }

        document.CommunityId = dto.CommunityId;
        document.Titulo = dto.Titulo;
        document.Descripcion = dto.Descripcion;
        document.Fecha = dto.Fecha;
        document.UserCreated = dto.UserCreated;
        document.NombreDocumento = dto.NombreDocumento;
        document.UrlDoc = dto.UrlDoc;

        await _context.SaveChangesAsync();
        await _context.Entry(document).Reference(d => d.Community).LoadAsync();

        return MapToDto(document);
    }

    public async Task<bool> DeleteDocumentAsync(Guid id)
    {
        var document = await _context.Documents.FindAsync(id);
        if (document == null)
            return false;

        _context.Documents.Remove(document);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> CanUserDownloadDocumentAsync(Guid userId, string? roleCode, Guid documentId)
    {
        var document = await _context.Documents.AsNoTracking().FirstOrDefaultAsync(d => d.Id == documentId);
        if (document == null)
            return false;

        if (document.UserId == userId)
            return true;

        if (string.Equals(roleCode, "ADMIN_COMPANY", StringComparison.OrdinalIgnoreCase) && document.CommunityId.HasValue)
        {
            var hasAccess = await _context.UserCommunities
                .AnyAsync(uc => uc.UserId == userId && uc.CommunityId == document.CommunityId.Value);
            if (hasAccess)
                return true;
        }

        return false;
    }

    private static DocumentDto MapToDto(Document d)
    {
        return new DocumentDto
        {
            Id = d.Id,
            CommunityId = d.CommunityId,
            CommunityName = d.Community?.Nombre,
            UserId = d.UserId,
            Titulo = d.Titulo,
            Descripcion = d.Descripcion,
            Fecha = d.Fecha,
            UserCreated = d.UserCreated,
            NombreDocumento = d.NombreDocumento,
            UrlDoc = d.UrlDoc,
            CreatedAt = d.CreatedAt
        };
    }
}
