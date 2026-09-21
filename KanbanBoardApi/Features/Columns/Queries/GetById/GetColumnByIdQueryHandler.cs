using KanbanBoardApi.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace KanbanBoardApi.Features.Columns.Queries.GetById
{
    public class GetColumnByIdQueryHandler(KanbanDbContext ctx) : IRequestHandler<GetColumnByIdQuery,GetColumnByIdQueryDto>
    {
        public async Task<GetColumnByIdQueryDto> Handle (GetColumnByIdQuery request, CancellationToken ct)
        {
            var q = ctx.Columns.AsNoTracking()
                .Where(c => c.Id == request.Id);

            var dto = await q
            .Select(x => new GetColumnByIdQueryDto
            {
                Id = x.Id,
                Title = x.Title,
                Order = x.Order,
                BoardId = x.BoardId,
                BoardTitle = x.Board.Title,
                Cards = x.Cards.OrderBy(c => c.Order).Select(c => new CardDto { Id = c.Id, Title = c.Title, Order = c.Order , Description = c.Description, Version = c.Version }).ToList()
            })
            .FirstOrDefaultAsync(ct);

            if (dto == null)
            {
                throw new Exception($"Column with Id {request.Id} not found.");
            }

            return dto;
        }
    }
}
