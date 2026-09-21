using MediatR;

namespace KanbanBoardApi.Features.Cards.Commands.Delete
{
    public class DeleteCardCommand : IRequest<Unit>
    {
        public required Guid Id { get; set; }
    }
}