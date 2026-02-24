using Microsoft.AspNetCore.Mvc;
using HappyHabitat.API.Models;

namespace HappyHabitat.API.Extensions;

/// <summary>
/// Extension methods to return unified API error responses from controllers.
/// </summary>
public static class ControllerBaseExtensions
{
    /// <summary>
    /// Returns 400 Bad Request with the standard ApiErrorResponse format.
    /// </summary>
    public static ActionResult BadRequestApiError(this ControllerBase controller, string code, string message)
    {
        return controller.BadRequest(new ApiErrorResponse
        {
            Code = code,
            Message = message,
            TraceId = controller.HttpContext.TraceIdentifier
        });
    }

    /// <summary>
    /// Returns 404 Not Found with the standard ApiErrorResponse format.
    /// </summary>
    public static ActionResult NotFoundApiError(this ControllerBase controller, string message = "Recurso no encontrado.")
    {
        return controller.NotFound(new ApiErrorResponse
        {
            Code = "NOT_FOUND",
            Message = message,
            TraceId = controller.HttpContext.TraceIdentifier
        });
    }

    /// <summary>
    /// Returns 409 Conflict with the standard ApiErrorResponse format.
    /// </summary>
    public static ActionResult ConflictApiError(this ControllerBase controller, string code, string message)
    {
        return controller.Conflict(new ApiErrorResponse
        {
            Code = code,
            Message = message,
            TraceId = controller.HttpContext.TraceIdentifier
        });
    }
}
