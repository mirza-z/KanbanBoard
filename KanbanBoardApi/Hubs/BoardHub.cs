using Microsoft.AspNetCore.SignalR;

namespace KanbanBoardApi.Hubs;

public class BoardHub : Hub
{
    public async Task JoinBoard(Guid boardId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, GroupName(boardId));
    }

    public async Task LeaveBoard(Guid boardId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, GroupName(boardId));
    }

    public static string GroupName(Guid boardId) => $"board-{boardId}";
}