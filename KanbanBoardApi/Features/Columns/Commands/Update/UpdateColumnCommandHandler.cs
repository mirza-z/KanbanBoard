using KanbanBoardApi.Data;
using KanbanBoardApi.Domain.Entities;
using KanbanBoardApi.Features.Boards.Commands.Update;
using KanbanBoardApi.Features.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace KanbanBoardApi.Features.Columns.Commands.Update;

public class UpdateColumnCommandHandler(KanbanDbContext ctx, IPublisher publisher)
    : IRequestHandler<UpdateColumnCommand, Unit>
{
    public async Task<Unit> Handle(UpdateColumnCommand request, CancellationToken ct)
    {
        var title = request.Title.Trim();
        var titleLower = title.ToLower();

        var entity = await ctx.Columns.FirstOrDefaultAsync(x => x.Id == request.Id, ct);
        if (entity is null)
            throw new NotFoundException($"Column with Id {request.Id} not found.");

        var exists = await ctx.Columns.AnyAsync(x =>
            x.BoardId == entity.BoardId
            && x.Id != request.Id
            && x.Title.ToLower() == titleLower, ct);
        if (exists)
            throw new ConflictException("This Column already exists");

        entity.Title = title;
        await ctx.SaveChangesAsync(ct);

        await publisher.Publish(new BoardChangedNotification(entity.BoardId), ct);
        return Unit.Value;
    }
}