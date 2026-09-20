using MediatR;

namespace KanbanBoardApi.Features.Boards.Queries.GetById
{
    public class GetBoardByIdQuery : IRequest<GetBoardByIdQueryDto>
    {
        public Guid Id { get; set; }
    }
}
