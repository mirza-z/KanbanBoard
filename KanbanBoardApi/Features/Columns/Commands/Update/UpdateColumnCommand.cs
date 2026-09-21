using MediatR;
using System.Text.Json.Serialization;

namespace KanbanBoardApi.Features.Columns.Commands.Update
{
    public class UpdateColumnCommand : IRequest<Unit>
    {
        [JsonIgnore]
        public Guid Id { get; set; }
        public required string Title { get; set; }
    }
}
