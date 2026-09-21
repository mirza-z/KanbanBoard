using KanbanBoardApi.Data;
using KanbanBoardApi.Features.Boards.Commands.Update;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace KanbanBoardApi.Features.Columns.Commands.Update;

public class UpdateColumnCommandHandler(KanbanDbContext ctx)
    : IRequestHandler<UpdateColumnCommand, Unit>
{
    public async Task<Unit> Handle(UpdateColumnCommand request, CancellationToken ct)
    {
        var title = request.Title.Trim();
        var titleLower = title.ToLower();

        var entity = await ctx.Columns.FirstOrDefaultAsync(x => x.Id == request.Id, ct);
        if (entity is null)
            throw new Exception($"Column with Id {request.Id} not found.");

        var exists = await ctx.Columns.AnyAsync(x =>
            x.BoardId == entity.BoardId
            && x.Id != request.Id
            && x.Title.ToLower() == titleLower, ct);
        if (exists)
            throw new Exception("This Column already exists");

        entity.Title = title;
        await ctx.SaveChangesAsync(ct);
        return Unit.Value;
    }
}