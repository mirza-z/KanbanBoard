using MediatR;

namespace KanbanBoardApi.Features.Boards.Commands.Delete
{
    public class DeleteBoardCommand : IRequest<Unit>
    {
        public required Guid Id { get; set; }
    }
}
