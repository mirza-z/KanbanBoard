using KanbanBoardApi.Data;
using KanbanBoardApi.Features.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

public class MoveCardCommandHandler(KanbanDbContext ctx)
    : IRequestHandler<MoveCardCommand, int>
{
    public async Task<int> Handle(MoveCardCommand request, CancellationToken ct)
    {
        var card = await ctx.Cards.FirstOrDefaultAsync(c => c.Id == request.Id, ct)
            ?? throw new NotFoundException($"Card with Id {request.Id} not found.");

        if (card.Version != request.Version)
            throw new ConflictException("Card was modified by someone else. Refresh and try again.");

        var sourceColumnId = card.ColumnId;

        var boardId = await ctx.Columns
            .Where(c => c.Id == sourceColumnId)
            .Select(c => c.BoardId)
            .FirstAsync(ct);

        var targetExists = await ctx.Columns
            .AnyAsync(c => c.Id == request.TargetColumnId && c.BoardId == boardId, ct);
        if (!targetExists)
            throw new NotFoundException("Target column not found on this board.");

        var target = await ctx.Cards
            .Where(c => c.ColumnId == request.TargetColumnId && c.Id != card.Id)
            .OrderBy(c => c.Order)
            .ToListAsync(ct);

        var index = Math.Min(request.TargetIndex, target.Count);
        target.Insert(index, card);
        for (var i = 0; i < target.Count; i++)
            target[i].Order = i;

        card.ColumnId = request.TargetColumnId;

        if (sourceColumnId != request.TargetColumnId)
        {
            var source = await ctx.Cards
                .Where(c => c.ColumnId == sourceColumnId && c.Id != card.Id)
                .OrderBy(c => c.Order)
                .ToListAsync(ct);
            for (var i = 0; i < source.Count; i++)
                source[i].Order = i;
        }

        card.Version++;

        try
        {
            await ctx.SaveChangesAsync(ct);   
        }
        catch (DbUpdateConcurrencyException)
        {
            throw new ConflictException("Card was modified by someone else. Refresh and try again.");
        }

        return card.Version;
    }
}