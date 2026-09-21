using KanbanBoardApi.Features.Common;

namespace KanbanBoardApi.Features.Boards.Queries.GetById
{
    public class GetBoardByIdQueryDto
    {
        public Guid Id { get; set; }
        public required string Title { get; set; }
        public required string OwnerId { get; set; }
        public DateTime CreatedAt { get; set; }
        public List<ColumnDto> Columns { get; set; } = new();
    }

    public sealed class ColumnDto
    {
        public Guid Id { get; set; }
        public required string Title { get; set; }
        public int Order { get; set; }
        public List<CardDto> Cards { get; set; } = new();
    }
}