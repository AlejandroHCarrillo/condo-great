using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using HappyHabitat.API.Models;

namespace HappyHabitat.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class FileController : ControllerBase
{
    private readonly IWebHostEnvironment _env;

    public FileController(IWebHostEnvironment env)
    {
        _env = env;
    }

    /// <summary>
    /// Upload a file to the server filesystem at the given relative path.
    /// Path must be a relative path (e.g. uploads/tickets/guid/image.jpg). Path traversal is not allowed.
    /// </summary>
    [HttpPost("upload")]
    [RequestSizeLimit(20 * 1024 * 1024)] // 20 MB
    [RequestFormLimits(MultipartBodyLengthLimit = 20 * 1024 * 1024)]
    public async Task<ActionResult<DocumentUploadResponse>> UploadFile(
        [FromForm] IFormFile file,
        [FromForm] string? path,
        CancellationToken cancellationToken = default)
    {
        if (file == null || file.Length == 0)
            return BadRequest("No file or empty file.");

        if (string.IsNullOrWhiteSpace(path))
            return BadRequest("Path is required.");

        var relativePath = path.Replace('\\', '/').TrimStart('/', '\\');
        if (string.IsNullOrEmpty(relativePath))
            return BadRequest("Invalid path.");

        // Prevent path traversal: ensure resolved path is under ContentRootPath
        var fullPath = Path.GetFullPath(Path.Combine(_env.ContentRootPath, relativePath));
        var rootPath = Path.GetFullPath(_env.ContentRootPath);
        if (!fullPath.StartsWith(rootPath, StringComparison.OrdinalIgnoreCase))
            return BadRequest("Invalid path.");

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
                RelativePath = relativePath,
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
}
