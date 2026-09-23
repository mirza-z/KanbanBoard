using KanbanBoardApi.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace KanbanBoardApi.Data;

public static class DemoSeeder
{
    public static readonly Guid DemoBoardId = Guid.Parse("a1b2c3d4-0000-4000-8000-000000000001");
    public const string DemoOwnerId = "demo";

    public static async Task SeedAsync(KanbanDbContext ctx)
    {
        if (await ctx.Boards.AnyAsync(b => b.Id == DemoBoardId)) return;

        Column Col(string title, int order, params string[] cards)
        {
            var col = new Column { Id = Guid.NewGuid(), Title = title, Order = order, BoardId = DemoBoardId, Cards = new() };
            for (var i = 0; i < cards.Length; i++)
                col.Cards.Add(new Card { Id = Guid.NewGuid(), Title = cards[i], Order = i, Version = 1, ColumnId = col.Id });
            return col;
        }

        ctx.Boards.Add(new Board
        {
            Id = DemoBoardId,
            Title = "Demo board",
            OwnerId = DemoOwnerId,
            CreatedAt = DateTime.UtcNow,
            Columns = new()
            {
                Col("To do", 0, "Otvori board u drugom tabu", "Prevuci karticu u drugu kolonu"),
                Col("In progress", 1, "Pogledaj tuđi kursor uživo"),
                Col("Done", 2, "Prijavi se preko Googlea")
            }
        });

        await ctx.SaveChangesAsync();
    }
}