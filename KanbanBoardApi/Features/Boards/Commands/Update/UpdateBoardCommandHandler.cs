using KanbanBoardApi.Data;
using KanbanBoardApi.Features.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace KanbanBoardApi.Features.Boards.Commands.Update;

public sealed class UpdateBoardCommandHandler(KanbanDbContext ctx) : IRequestHandler<UpdateBoardCommand, Unit>
{
    public async Task<Unit> Handle(UpdateBoardCommand request, CancellationToken ct)
    {
        var entity = await ctx.Boards
            .Where(x => x.Id == request.Id).FirstOrDefaultAsync(ct);

        if (entity is null)
            throw new NotFoundException($"Board (ID={request.Id}) nije pronađena.");

        var exists = await ctx.Boards
            .AnyAsync(x => x.Id != request.Id
                && x.OwnerId == entity.OwnerId
                && x.Title.ToLower() == request.Title.ToLower(), ct);

        if (exists)
        {
            throw new ConflictException("Title already exists.");
        }

        entity.Title = request.Title.Trim();

        await ctx.SaveChangesAsync(ct);

        return Unit.Value;
    }
}