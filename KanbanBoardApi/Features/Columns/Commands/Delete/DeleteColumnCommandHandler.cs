using KanbanBoardApi.Data;
using KanbanBoardApi.Features.Boards.Commands.Delete;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace KanbanBoardApi.Features.Columns.Commands.Delete
{
    public class DeleteColumnCommandHandler(KanbanDbContext ctx) : IRequestHandler<DeleteColumnCommand, Unit>
    {
        public async Task<Unit> Handle(DeleteColumnCommand request, CancellationToken cancellationToken)
        {
            var column = await ctx.Columns.FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);

            if (column is null) { throw new Exception("Column not found"); }

            ctx.Columns.Remove(column);
            await ctx.SaveChangesAsync(cancellationToken);

            return Unit.Value;
        }
    }
}