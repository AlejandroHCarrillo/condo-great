using HappyHabitat.Application.DTOs;

namespace HappyHabitat.Application.Interfaces;

public interface IDocumentService
{
    Task<IEnumerable<DocumentDto>> GetAllDocumentsAsync();
    Task<IEnumerable<DocumentDto>> GetDocumentsByCommunityIdAsync(Guid? communityId);
    Task<DocumentDto?> GetDocumentByIdAsync(Guid id);
    Task<DocumentDto> CreateDocumentAsync(CreateDocumentDto createDocumentDto);
    Task<DocumentDto?> UpdateDocumentAsync(Guid id, UpdateDocumentDto updateDocumentDto);
    Task<bool> DeleteDocumentAsync(Guid id);
    /// <summary>True if the user can download the document (admin of document's community or uploader).</summary>
    Task<bool> CanUserDownloadDocumentAsync(Guid userId, string? roleCode, Guid documentId);
}
