namespace HappyHabitat.API.Models;

/// <summary>
/// Response after uploading a document to the filesystem.
/// </summary>
public class DocumentUploadResponse
{
    /// <summary>
    /// Relative path where the file was saved (e.g. uploads/documents/communityId/categoria/residentId/file.ext).
    /// Use this value for Document.UrlDoc or to build the download URL.
    /// </summary>
    public string RelativePath { get; set; } = string.Empty;

    /// <summary>
    /// Original file name as sent by the client.
    /// </summary>
    public string OriginalFileName { get; set; } = string.Empty;

    /// <summary>
    /// File size in bytes.
    /// </summary>
    public long FileSizeBytes { get; set; }
}
