using MediatR;
using System.Text.Json.Serialization;

namespace KanbanBoardApi.Features.Columns.Commands.Reorder;

public class ReorderColumnsCommand : IRequest<Unit>
{
    [JsonIgnore]
    public Guid BoardId { get; set; }
    public required List<Guid> ColumnIds { get; set; }
}