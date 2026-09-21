using MediatR;

namespace KanbanBoardApi.Features.Columns.Queries.GetById
{
    public class GetColumnByIdQuery :IRequest<GetColumnByIdQueryDto>
    {
        public Guid Id { get; set; }
    }
}
