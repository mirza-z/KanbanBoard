using KanbanBoardApi.Data;
using KanbanBoardApi.Features.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace KanbanBoardApi.Features.Columns.Commands.Reorder;

public class ReorderColumnsCommandHandler(KanbanDbContext ctx, IPublisher publisher)
    : IRequestHandler<ReorderColumnsCommand, Unit>
{
    public async Task<Unit> Handle(ReorderColumnsCommand request, CancellationToken ct)
    {
        var boardExists = await ctx.Boards.AnyAsync(b => b.Id == request.BoardId, ct);
        if (!boardExists)
            throw new NotFoundException($"Board with Id {request.BoardId} not found.");

        var columns = await ctx.Columns
            .Where(c => c.BoardId == request.BoardId)
            .ToListAsync(ct);

        var existingIds = columns.Select(c => c.Id).ToHashSet();
        var requestIds = request.ColumnIds.ToHashSet();

        if (existingIds.Count != requestIds.Count || !existingIds.SetEquals(requestIds))
            throw new ConflictException("ColumnIds must contain exactly all columns of this board, each exactly once.");

        for (var i = 0; i < request.ColumnIds.Count; i++)
        {
            var column = columns.First(c => c.Id == request.ColumnIds[i]);
            column.Order = i;
        }

        await ctx.SaveChangesAsync(ct);

        await publisher.Publish(new BoardChangedNotification(request.BoardId), ct);
        return Unit.Value;
    }
}