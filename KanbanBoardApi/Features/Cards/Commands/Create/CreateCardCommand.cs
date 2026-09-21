using MediatR;

namespace KanbanBoardApi.Features.Cards.Commands.Create
{
    public class CreateCardCommand : IRequest<Guid>
    {
        public string Title { get; set; }
        public string? Description { get; set; }
        public Guid ColumnId { get; set; }
    }
}
