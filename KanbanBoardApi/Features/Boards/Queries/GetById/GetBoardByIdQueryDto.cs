using KanbanBoardApi.Domain.Entities;

namespace KanbanBoardApi.Features.Boards.Queries.GetById
{
    public class GetBoardByIdQueryDto
    {
        public Guid Id { get; set; }
        public string Title { get; set; }
        public string OwnerId { get; set; }
        public DateTime CreatedAt { get; set; }
        public List<Column> Columns { get; set; }
    }
}
