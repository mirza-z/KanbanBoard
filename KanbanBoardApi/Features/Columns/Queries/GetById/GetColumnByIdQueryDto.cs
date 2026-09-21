
namespace KanbanBoardApi.Features.Columns.Queries.GetById
{
    public class GetColumnByIdQueryDto
    {
        public Guid Id { get; set; }
        public required string Title { get; set; }
        public int Order { get; set; }
        public Guid BoardId { get; set; }
        public required string BoardTitle { get; set; }
        public List<CardDto> Cards { get; set; } = new();
    }

    public sealed class CardDto
    {
        public Guid Id { get; set; }
        public required string Title { get; set; }
        public string? Description { get; set; }
        public int Order { get; set; }
        public int Version { get; set; }
    }
}
