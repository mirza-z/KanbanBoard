using KanbanBoardApi.Data;
using KanbanBoardApi.Features.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace KanbanBoardApi.Features.Boards.Commands.Delete;

public class DeleteBoardCommandHandler(KanbanDbContext ctx): IRequestHandler<DeleteBoardCommand, Unit>
{
    public async Task<Unit> Handle(DeleteBoardCommand request, CancellationToken cancellationToken)
    {
        var board = await ctx.Boards.FirstOrDefaultAsync(x=> x.Id == request.Id, cancellationToken);

        if (board is null) { throw new NotFoundException("Board not found"); }

        ctx.Boards.Remove(board);
        await ctx.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}