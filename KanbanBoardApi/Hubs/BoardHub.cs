using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;

namespace KanbanBoardApi.Hubs;

public class BoardHub : Hub
{
    private readonly IPresenceTracker _presence;

    private static readonly string[] Palette =
    {
        "#D98E04", "#3E7C79", "#A63D2F", "#6B8E23",
        "#7B5EA7", "#C9622F", "#2E7D8C", "#B0552B"
    };

    public BoardHub(IPresenceTracker presence)
    {
        _presence = presence;
    }

    public async Task JoinBoard(Guid boardId, string? guestName = null)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, GroupName(boardId));

        var color = Palette[Math.Abs(Context.ConnectionId.GetHashCode()) % Palette.Length];
        var displayName = ResolveDisplayName(guestName);
        var info = new PresenceInfo(boardId, color, displayName);

        var existing = _presence.GetByBoard(boardId).ToList();

        _presence.Add(Context.ConnectionId, info);

        await Clients.Caller.SendAsync("UserJoined", Context.ConnectionId, color, displayName, true);

        foreach (var (connId, existingInfo) in existing)
        {
            await Clients.Caller.SendAsync("UserJoined", connId, existingInfo.Color, existingInfo.DisplayName, false);
        }

        await Clients.OthersInGroup(GroupName(boardId))
            .SendAsync("UserJoined", Context.ConnectionId, color, displayName, false);
    }

    private string ResolveDisplayName(string? guestName)
    {
        if (Context.User?.Identity?.IsAuthenticated == true)
        {
            var name = Context.User.FindFirst("name")?.Value
                       ?? Context.User.FindFirst(ClaimTypes.Name)?.Value;
            if (!string.IsNullOrWhiteSpace(name)) return name;
        }

        var cleaned = guestName?.Trim();
        if (!string.IsNullOrEmpty(cleaned))
            return cleaned.Length > 30 ? cleaned[..30] : cleaned;

        return $"Guest {Random.Shared.Next(100, 999)}";
    }

    public async Task LeaveBoard(Guid boardId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, GroupName(boardId));
        _presence.Remove(Context.ConnectionId);
        await Clients.OthersInGroup(GroupName(boardId)).SendAsync("UserLeft", Context.ConnectionId);
    }

    public async Task UpdateCursorPosition(Guid boardId, double x, double y)
    {
        await Clients.OthersInGroup(GroupName(boardId))
            .SendAsync("CursorMoved", Context.ConnectionId, x, y);
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var info = _presence.Remove(Context.ConnectionId);
        if (info is not null)
        {
            await Clients.OthersInGroup(GroupName(info.BoardId)).SendAsync("UserLeft", Context.ConnectionId);
        }
        await base.OnDisconnectedAsync(exception);
    }

    public static string GroupName(Guid boardId) => $"board-{boardId}";
}