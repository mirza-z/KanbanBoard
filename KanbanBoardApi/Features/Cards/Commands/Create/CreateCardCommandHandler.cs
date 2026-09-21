using KanbanBoardApi.Data;
using KanbanBoardApi.Domain.Entities;
using KanbanBoardApi.Features.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace KanbanBoardApi.Features.Cards.Commands.Create
{
    public class CreateCardCommandHandler(KanbanDbContext ctx) : IRequestHandler<CreateCardCommand, Guid>
    {
        public async Task<Guid> Handle(CreateCardCommand request, CancellationToken ct)
        {
            var title = request.Title.Trim();

            var columnExists = await ctx.Columns.AnyAsync(b => b.Id == request.ColumnId, ct);
            if (!columnExists)
                throw new NotFoundException("Column not found");

            var maxOrder = await ctx.Cards
                .Where(c => c.ColumnId == request.ColumnId)
                .MaxAsync(c => (int?)c.Order, ct) ?? -1;

            var card = new Card
            {
                Id = Guid.NewGuid(),
                Title = title,
                Description = string.IsNullOrWhiteSpace(request.Description) ? null : request.Description.Trim(),
                ColumnId = request.ColumnId,
                Version = 1,
                Order = maxOrder + 1
            };

            ctx.Cards.Add(card);
            await ctx.SaveChangesAsync(ct);
            return card.Id;
        }
    }
}
