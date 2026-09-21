
using KanbanBoardApi.Features.Common;

namespace KanbanBoardApi.Features.Columns.Queries.List
{
    public class ListColumnsQuery : BasePagedQuery<ListColumnsQueryDto>
    {
        public Guid? BoardId { get; init; }
        public string? Search { get; init; }

    }
}
