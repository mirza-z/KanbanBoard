using MediatR;
using System.Text.Json.Serialization;

namespace KanbanBoardApi.Features.Boards.Commands.Delete
{
    public class DeleteBoardCommand : IRequest<Unit>
    {
        [JsonIgnore]
        public string RequesterId { get; set; } = string.Empty;

        public required Guid Id { get; set; }
    }
}
