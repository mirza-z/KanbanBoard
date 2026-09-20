using KanbanBoardApi.Domain.Entities;

namespace KanbanBoardApi.Features.Boards.Queries.List
{
    public sealed class ListBoardsQueryDto
    {
        public Guid Id { get; set; }
        public string Title { get; set; }
        public string OwnerId { get; set; }
        public DateTime CreatedAt { get; set; }
    }

}
