using MediatR;
using System.Text.Json.Serialization;

namespace KanbanBoardApi.Features.Boards.Commands.Update
{
    public sealed class UpdateBoardCommand : IRequest<Unit>
    {
        [JsonIgnore]
        public Guid Id { get; set; }
        public string Title { get; set; }
    }
}
