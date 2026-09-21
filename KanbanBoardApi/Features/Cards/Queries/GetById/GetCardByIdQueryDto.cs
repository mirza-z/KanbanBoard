namespace KanbanBoardApi.Features.Cards.Queries.GetById
{
    public class GetCardByIdQueryDto
    {
        public Guid Id { get; set; }
        public string Title { get; set; }
        public string? Description { get; set; }
        public int Order { get; set; }
        public int Version { get; set; }
        public Guid ColumnId { get; set; }
        public string ColumnTitle { get; set; }
    }
}
