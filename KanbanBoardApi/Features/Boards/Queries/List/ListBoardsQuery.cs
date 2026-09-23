using KanbanBoardApi.Features.Common;
using System.Text.Json.Serialization;

namespace KanbanBoardApi.Features.Boards.Queries.List
{
    public sealed class ListBoardsQuery: BasePagedQuery<ListBoardsQueryDto>
    {
        [JsonIgnore]
        public string OwnerId { get; set; } = string.Empty;
        public string? Search { get; init; }
    }
}
