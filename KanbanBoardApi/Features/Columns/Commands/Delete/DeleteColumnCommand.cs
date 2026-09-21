using MediatR;

namespace KanbanBoardApi.Features.Columns.Commands.Delete
{
    public class DeleteColumnCommand : IRequest<Unit>
    {
        public required Guid Id { get; set; }
    }
}