using KanbanBoardApi.Data;
using KanbanBoardApi.Features.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace KanbanBoardApi.Features.Cards.Commands.Delete
{
    public class DeleteCardCommandHandler(KanbanDbContext ctx) : IRequestHandler<DeleteCardCommand, Unit>
    {
        public async Task<Unit> Handle(DeleteCardCommand request, CancellationToken cancellationToken)
        {
            var card = await ctx.Cards.FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);

            if (card is null) { throw new NotFoundException($"Card with Id {request.Id} not found."); }

            ctx.Cards.Remove(card);
            await ctx.SaveChangesAsync(cancellationToken);

            return Unit.Value;
        }
    }
}