using MediatR;

namespace KanbanBoardApi.Features.Boards.Commands.Create
{
    public class CreateBoardCommand : IRequest<Guid>
    {
        public string Title { get; set; } = string.Empty;
        public string OwnerId { get; set; } = string.Empty;
    }
}