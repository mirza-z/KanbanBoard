using System.Data.Common;

namespace KanbanBoardApi.Domain.Entities;

public class BoardEntity
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string OwnerId { get; set; } = string.Empty; // pripremamo se za auth kasnije
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public List<ColumnEntity> Columns { get; set; } = new();
}