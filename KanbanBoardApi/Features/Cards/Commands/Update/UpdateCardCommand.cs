using MediatR;
using System.Text.Json.Serialization;

namespace KanbanBoardApi.Features.Cards.Commands.Update
{
    public class UpdateCardCommand : IRequest<int>
    {
        [JsonIgnore]
        public Guid Id { get; set; }
        public required string Title { get; set; }
        public string? Description { get; set; }
        public int Version { get; set; } 
    }
}
