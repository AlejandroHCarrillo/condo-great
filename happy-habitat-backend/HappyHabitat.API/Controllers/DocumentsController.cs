using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using HappyHabitat.Application.DTOs;
using HappyHabitat.Application.Interfaces;
using HappyHabitat.API.Models;

namespace HappyHabitat.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DocumentsController : ControllerBase
{
    private readonly IDocumentService _documentService;
    private readonly IWebHostEnvironment _env;

    public DocumentsController(IDocumentService documentService, IWebHostEnvironment env)
    {
        _documentService = documentService;
        _env = env;
    }

    /// <summary>
    /// Get all documents
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<DocumentDto>>> GetAllDocuments()
    {
        var documents = await _documentService.GetAllDocumentsAsync();
        return Ok(documents);
    }

    /// <summary>
    /// Get documents by community ID
    /// </summary>
    [HttpGet("community/{communityId?}")]
    public async Task<ActionResult<IEnumerable<DocumentDto>>> GetDocumentsByCommunityId(Guid? communityId)
    {
        var documents = await _documentService.GetDocumentsByCommunityIdAsync(communityId);
        return Ok(documents);
    }

    /// <summary>
    /// Get document by ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<DocumentDto>> GetDocumentById(Guid id)
    {
        var document = await _documentService.GetDocumentByIdAsync(id);
        if (document == null)
            return NotFound();

        return Ok(document);
    }

    /// <summary>
    /// Download the file of a document by ID. Allowed only for company admins of the document's community or the user who uploaded it.
    /// </summary>
    [HttpGet("{id}/download")]
    public async Task<IActionResult> DownloadDocument(Guid id)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            return Unauthorized();

        var roleCode = User.FindFirst(ClaimTypes.Role)?.Value;
        var canDownload = await _documentService.CanUserDownloadDocumentAsync(userId, roleCode, id);
        if (!canDownload)
            return Forbid();

        var document = await _documentService.GetDocumentByIdAsync(id);
        if (document == null)
            return NotFound();

        var relativePath = GetRelativePathFromUrlDoc(document.UrlDoc);
        if (string.IsNullOrEmpty(relativePath))
            return BadRequest("Document has no file path.");

        var fullPath = Path.Combine(_env.ContentRootPath, relativePath.Replace('/', Path.DirectorySeparatorChar));
        if (!System.IO.File.Exists(fullPath))
        {
            // Fallback 1: si el documento tiene URL absoluta, redirigir a ella
            if (!string.IsNullOrEmpty(document.UrlDoc) &&
                (document.UrlDoc.StartsWith("http://", StringComparison.OrdinalIgnoreCase) || document.UrlDoc.StartsWith("https://", StringComparison.OrdinalIgnoreCase)))
                return Redirect(document.UrlDoc);
            // Fallback 2: construir URL estática con el host actual (por si el archivo está servido por UseStaticFiles)
            var staticUrl = $"{Request.Scheme}://{Request.Host}/{relativePath.TrimStart('/')}";
            return Redirect(staticUrl);
        }

        var contentType = GetContentType(document.NombreDocumento);
        var fileName = document.NombreDocumento;
        if (string.IsNullOrEmpty(fileName))
            fileName = Path.GetFileName(fullPath);

        return PhysicalFile(fullPath, contentType, fileName);
    }

    /// <summary>
    /// Extracts the relative path (e.g. uploads/documents/...) from UrlDoc, whether it is stored as full URL or relative path.
    /// </summary>
    private static string? GetRelativePathFromUrlDoc(string urlDoc)
    {
        if (string.IsNullOrWhiteSpace(urlDoc)) return null;
        if (urlDoc.StartsWith("http://", StringComparison.OrdinalIgnoreCase) || urlDoc.StartsWith("https://", StringComparison.OrdinalIgnoreCase))
        {
            if (!Uri.TryCreate(urlDoc, UriKind.Absolute, out var uri)) return null;
            var path = uri.AbsolutePath.TrimStart('/');
            return string.IsNullOrEmpty(path) ? null : path;
        }
        return urlDoc.TrimStart('/', '\\');
    }

    private static readonly Microsoft.AspNetCore.StaticFiles.FileExtensionContentTypeProvider ContentTypeProvider = new();

    private static string GetContentType(string fileName)
    {
        if (string.IsNullOrEmpty(fileName)) return "application/octet-stream";
        return ContentTypeProvider.TryGetContentType(fileName, out var contentType) ? contentType : "application/octet-stream";
    }

    /// <summary>
    /// Create a new document. The current user is set as uploader (UserId) for download authorization.
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<DocumentDto>> CreateDocument(CreateDocumentDto createDocumentDto)
    {
        try
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            createDocumentDto.UserId = Guid.TryParse(userIdClaim, out var userId) ? userId : null;

            var document = await _documentService.CreateDocumentAsync(createDocumentDto);
            return CreatedAtAction(nameof(GetDocumentById), new { id = document.Id }, document);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    /// <summary>
    /// Update an existing document
    /// </summary>
    [HttpPut("{id}")]
    public async Task<ActionResult<DocumentDto>> UpdateDocument(Guid id, UpdateDocumentDto updateDocumentDto)
    {
        try
        {
            var document = await _documentService.UpdateDocumentAsync(id, updateDocumentDto);
            if (document == null)
                return NotFound();

            return Ok(document);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    /// <summary>
    /// Delete a document
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteDocument(Guid id)
    {
        var result = await _documentService.DeleteDocumentAsync(id);
        if (!result)
            return NotFound();

        return NoContent();
    }

    /// <summary>
    /// Upload a file to the server filesystem.
    /// Path: communityId\categoria\residentId\nombreArchivo.ext
    /// (residentId and category use "general" when not provided)
    /// </summary>
    [HttpPost("upload")]
    [RequestSizeLimit(20 * 1024 * 1024)] // 20 MB
    [RequestFormLimits(MultipartBodyLengthLimit = 20 * 1024 * 1024)]
    public async Task<ActionResult<DocumentUploadResponse>> UploadDocument(
        [FromForm] IFormFile file,
        [FromForm] Guid communityId,
        [FromForm] Guid? residentId,
        [FromForm] string? category,
        CancellationToken cancellationToken = default)
    {
        if (file == null || file.Length == 0)
            return BadRequest("No file or empty file.");

        var categoria = string.IsNullOrWhiteSpace(category) ? "general" : SanitizePathSegment(category);
        var residentIdSegment = residentId.HasValue ? residentId.Value.ToString() : "general";
        var fileName = SanitizeFileName(file.FileName);
        if (string.IsNullOrEmpty(fileName))
            return BadRequest("Invalid file name.");

        // Path: communityId\categoria\residentId\nombreArchivo.ext
        var relativePathParts = new[] { "uploads", "documents", communityId.ToString(), categoria, residentIdSegment, fileName };
        var relativePath = Path.Combine(relativePathParts);
        var fullPath = Path.Combine(_env.ContentRootPath, relativePath);
        var directory = Path.GetDirectoryName(fullPath);
        if (string.IsNullOrEmpty(directory))
            return BadRequest("Invalid path.");

        try
        {
            Directory.CreateDirectory(directory);
            await using (var stream = new FileStream(fullPath, FileMode.Create, FileAccess.Write, FileShare.None, 4096, useAsync: true))
            {
                await file.CopyToAsync(stream, cancellationToken);
            }

            var response = new DocumentUploadResponse
            {
                RelativePath = relativePath.Replace('\\', '/'),
                OriginalFileName = file.FileName,
                FileSizeBytes = file.Length
            };
            return Ok(response);
        }
        catch (IOException ex)
        {
            return StatusCode(500, ex.Message);
        }
    }

    private static string SanitizePathSegment(string segment)
    {
        if (string.IsNullOrWhiteSpace(segment)) return "general";
        var sanitized = new string(segment.Where(c => char.IsLetterOrDigit(c) || c == '-' || c == '_').ToArray());
        return string.IsNullOrEmpty(sanitized) ? "general" : sanitized;
    }

    private static string SanitizeFileName(string fileName)
    {
        if (string.IsNullOrWhiteSpace(fileName)) return string.Empty;
        var name = Path.GetFileName(fileName);
        if (string.IsNullOrEmpty(name)) return string.Empty;
        var invalid = Path.GetInvalidFileNameChars();
        return new string(name.Where(c => !invalid.Contains(c)).ToArray());
    }
}
