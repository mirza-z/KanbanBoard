
namespace KanbanBoardApi.Features.Boards.Queries.GetById
{
    public class GetBoardByIdQueryDto
    {
        public Guid Id { get; set; }
        public string Title { get; set; }
        public string OwnerId { get; set; }
        public DateTime CreatedAt { get; set; }
        public List<ColumnDto> Columns { get; set; }
    }
    public sealed class ColumnDto
    {
        public Guid Id { get; set; }
        public string Title { get; set; }
        public int Order { get; set; }
    }
}
