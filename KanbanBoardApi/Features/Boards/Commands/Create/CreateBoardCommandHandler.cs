using KanbanBoardApi.Data;
using KanbanBoardApi.Domain.Entities;
using KanbanBoardApi.Features.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace KanbanBoardApi.Features.Boards.Commands.Create
{
    public class CreateBoardCommandHandler(KanbanDbContext ctx) : IRequestHandler<CreateBoardCommand, Guid>
    {
        public async Task<Guid> Handle(CreateBoardCommand request, CancellationToken ct)
        {
            var exists = await ctx.Boards.AnyAsync(x => x.Title == request.Title && x.OwnerId == request.OwnerId,ct);
            if (exists)
            {
                throw new ConflictException("This Board already exists");
            }
            var board = new Board
            {
                Id = Guid.NewGuid(),
                OwnerId = request.OwnerId,
                Title = request.Title,
                CreatedAt = DateTime.UtcNow,
                Columns = new()
            };
            await ctx.Boards.AddAsync(board, ct);
            await ctx.SaveChangesAsync(ct);
            return board.Id;
        }
    }
}
