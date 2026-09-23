// Features/Common/GlobalExceptionHandler.cs
using KanbanBoardApi.Features.Common;
using Microsoft.AspNetCore.Diagnostics;

public class GlobalExceptionHandler(
    ILogger<GlobalExceptionHandler> logger,
    IProblemDetailsService problemDetails) : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(
        HttpContext ctx, Exception ex, CancellationToken ct)
    {
        if (ex is FluentValidation.ValidationException vex)
        {
            var errors = vex.Errors
                .GroupBy(e => e.PropertyName)
                .ToDictionary(g => g.Key, g => g.Select(e => e.ErrorMessage).ToArray());

            ctx.Response.StatusCode = StatusCodes.Status400BadRequest;
            return await problemDetails.TryWriteAsync(new ProblemDetailsContext
            {
                HttpContext = ctx,
                ProblemDetails =
        {
            Status = 400,
            Title = "Validation failed",
            Extensions = { ["errors"] = errors }
        }
            });
        }

        var (status, title) = ex switch
        {
            ForbiddenException => (StatusCodes.Status403Forbidden, "Forbidden"),
            NotFoundException => (StatusCodes.Status404NotFound, "Not found"),
            ConflictException => (StatusCodes.Status409Conflict, "Conflict"),
            _ => (StatusCodes.Status500InternalServerError, "Server error")
        };

        if (status == 500)
            logger.LogError(ex, "Unhandled exception");

        ctx.Response.StatusCode = status;

        return await problemDetails.TryWriteAsync(new ProblemDetailsContext
        {
            HttpContext = ctx,
            Exception = ex,
            ProblemDetails =
            {
                Status = status,
                Title = title,
                // interne poruke ne otkrivamo klijentu
                Detail = status == 500 ? null : ex.Message
            }
        });
    }
}