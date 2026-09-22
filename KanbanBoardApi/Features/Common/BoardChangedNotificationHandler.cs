using KanbanBoardApi.Hubs;
using MediatR;
using Microsoft.AspNetCore.SignalR;

namespace KanbanBoardApi.Features.Common;

public class BoardChangedNotificationHandler(IHubContext<BoardHub> hubContext)
    : INotificationHandler<BoardChangedNotification>
{
    public Task Handle(BoardChangedNotification notification, CancellationToken ct)
    {
        return hubContext.Clients
            .Group(BoardHub.GroupName(notification.BoardId))
            .SendAsync("BoardChanged", cancellationToken: ct);
    }
}