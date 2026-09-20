using KanbanBoardApi.Features.Common;

namespace KanbanBoardApi.Features.Boards.Queries.List
{
    public sealed class ListBoardsQuery: BasePagedQuery<ListBoardsQueryDto>
    {
        public string? Search { get; init; }
    }
}
