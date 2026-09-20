namespace KanbanBoardApi.Domain.Entities;

public class ColumnEntity
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public int Order { get; set; }

    public Guid BoardId { get; set; }
    public BoardEntity Board { get; set; } = null!;

    public List<CardEntity> Cards { get; set; } = new();
}