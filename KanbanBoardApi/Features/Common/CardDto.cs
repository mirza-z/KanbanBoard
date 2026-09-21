namespace KanbanBoardApi.Features.Common
{
    public sealed class CardDto
    {
        public Guid Id { get; set; }
        public required string Title { get; set; }
        public string? Description { get; set; }
        public int Order { get; set; }
        public int Version { get; set; }
    }
}