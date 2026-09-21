using MediatR;

namespace KanbanBoardApi.Features.Columns.Commands.Create
{
    public class CreateColumnCommand : IRequest<Guid>
    {
        public required string Title { get; set; }
        public required Guid BoardId { get; set; }
    }
}
