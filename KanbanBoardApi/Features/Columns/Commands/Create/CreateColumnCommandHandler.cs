using KanbanBoardApi.Data;
using KanbanBoardApi.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace KanbanBoardApi.Features.Columns.Commands.Create
{
    public class CreateColumnCommandHandler (KanbanDbContext ctx) : IRequestHandler<CreateColumnCommand, Guid>
    {
        public async Task<Guid> Handle(CreateColumnCommand request, CancellationToken ct)
        {
            var title = request.Title.Trim();

            var boardExists = await ctx.Boards.AnyAsync(b => b.Id == request.BoardId, ct);
            if (!boardExists)
                throw new Exception("Board not found");

            var exists = await ctx.Columns.AnyAsync(
                x => x.BoardId == request.BoardId && x.Title == title, ct);
            if (exists)
                throw new Exception("This Column already exists");

            // (int?) cast jer MaxAsync na praznom setu baca exception
            var maxOrder = await ctx.Columns
                .Where(c => c.BoardId == request.BoardId)
                .MaxAsync(c => (int?)c.Order, ct) ?? -1;

            var column = new Column
            {
                Id = Guid.NewGuid(),
                Title = title,
                BoardId = request.BoardId,
                Order = maxOrder + 1
            };

            ctx.Columns.Add(column);
            await ctx.SaveChangesAsync(ct);
            return column.Id;
        }
    }
}
