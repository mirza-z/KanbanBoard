
namespace KanbanBoardApi.Domain.Entities;

public class Card
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int Order { get; set; }
    public int Version { get; set; } = 1; // za optimistic concurrency, sjećaš se te priče

    public Guid ColumnId { get; set; }
    public Column Column { get; set; } = null!;
}