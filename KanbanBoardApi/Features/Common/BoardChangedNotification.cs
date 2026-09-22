using MediatR;

namespace KanbanBoardApi.Features.Common;

public record BoardChangedNotification(Guid BoardId) : INotification;