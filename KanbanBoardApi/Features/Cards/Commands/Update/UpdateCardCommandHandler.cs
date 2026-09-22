using KanbanBoardApi.Data;
using KanbanBoardApi.Domain.Entities;
using KanbanBoardApi.Features.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace KanbanBoardApi.Features.Cards.Commands.Update
{
    public class UpdateCardCommandHandler(KanbanDbContext ctx, IPublisher publisher)
    : IRequestHandler<UpdateCardCommand, int>
    {
        public async Task<int> Handle(UpdateCardCommand request, CancellationToken ct)
        {
            var card = await ctx.Cards.FirstOrDefaultAsync(c => c.Id == request.Id, ct)
                ?? throw new NotFoundException($"Card with Id {request.Id} not found.");


            if (card.Version != request.Version)
                throw new ConflictException("Card was modified by someone else. Refresh and try again.");

            card.Title = request.Title.Trim();
            card.Description = string.IsNullOrWhiteSpace(request.Description)
                ? null
                : request.Description.Trim();
            card.Version++;

            try
            {
                await ctx.SaveChangesAsync(ct);
            }
            catch (DbUpdateConcurrencyException)
            {
                throw new ConflictException("Card was modified by someone else. Refresh and try again.");
            }

            var boardId = await ctx.Columns
                .Where(c => c.Id == card.ColumnId)
                .Select(c => c.BoardId)
                .FirstAsync(ct);

            await publisher.Publish(new BoardChangedNotification(boardId), ct);
            return card.Version;
        }
    }
}