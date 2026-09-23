using System.Security.Claims;

namespace KanbanBoardApi.Features.Common;

public static class ClaimsExtensions
{
    public static string GetOwnerId(this ClaimsPrincipal user) =>
        user.FindFirstValue("sub")
        ?? user.FindFirstValue(ClaimTypes.NameIdentifier)
        ?? throw new UnauthorizedAccessException();
}