namespace KanbanBoardApi.Features.Columns.Queries.List
{
    public sealed class ListColumnsQueryDto
    {
        public Guid Id { get; set; }
        public required string Title { get; set; }
        public int Order { get; set; }
        public Guid BoardId { get; set; }
        public required string BoardTitle { get; set; }
    }
}
