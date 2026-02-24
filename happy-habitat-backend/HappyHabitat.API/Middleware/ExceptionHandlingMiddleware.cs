using System.Net;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using HappyHabitat.API.Models;

namespace HappyHabitat.API.Middleware;

public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;
    private readonly IHostEnvironment _env;

    public ExceptionHandlingMiddleware(
        RequestDelegate next,
        ILogger<ExceptionHandlingMiddleware> logger,
        IHostEnvironment env)
    {
        _next = next;
        _logger = logger;
        _env = env;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        var traceId = context.TraceIdentifier;
        _logger.LogError(exception, "Unhandled exception. TraceId: {TraceId}", traceId);

        var (statusCode, code, message) = exception switch
        {
            InvalidOperationException inv => (HttpStatusCode.BadRequest, "INVALID_OPERATION", inv.Message),
            ArgumentException arg => (HttpStatusCode.BadRequest, "BAD_REQUEST", arg.Message),
            KeyNotFoundException => (HttpStatusCode.NotFound, "NOT_FOUND", "Recurso no encontrado."),
            UnauthorizedAccessException => (HttpStatusCode.Unauthorized, "UNAUTHORIZED", "No autorizado."),
            DbUpdateException dbEx => (
                HttpStatusCode.InternalServerError,
                "DATABASE_ERROR",
                _env.IsDevelopment() ? dbEx.InnerException?.Message ?? dbEx.Message : "Error al guardar los datos. Intente de nuevo.")
            ,
            _ => (
                HttpStatusCode.InternalServerError,
                "INTERNAL_ERROR",
                _env.IsDevelopment() ? exception.Message : "Ha ocurrido un error interno. Intente más tarde.")
        };

        context.Response.ContentType = "application/json";
        context.Response.StatusCode = (int)statusCode;

        var response = new ApiErrorResponse
        {
            Code = code,
            Message = message,
            TraceId = traceId
        };

        var options = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
        await context.Response.WriteAsync(JsonSerializer.Serialize(response, options));
    }
}
