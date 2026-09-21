using MediatR;

namespace KanbanBoardApi.Features.Cards.Queries.GetById
{
    public class GetCardByIdQuery : IRequest<GetCardByIdQueryDto>
    {
        public Guid Id { get; set; }
    }
}
