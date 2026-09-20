namespace KanbanBoardApi.Domain.Entities;

public class Column
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public int Order { get; set; }

    public Guid BoardId { get; set; }
    public Board Board { get; set; } = null!;

    public List<Card> Cards { get; set; } = new();
}