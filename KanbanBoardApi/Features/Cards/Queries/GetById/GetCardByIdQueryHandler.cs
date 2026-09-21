using KanbanBoardApi.Data;
using KanbanBoardApi.Features.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace KanbanBoardApi.Features.Cards.Queries.GetById
{
    public class GetCardByIdQueryHandler(KanbanDbContext ctx) : IRequestHandler<GetCardByIdQuery, GetCardByIdQueryDto>
    {
        public async Task<GetCardByIdQueryDto> Handle(GetCardByIdQuery request, CancellationToken ct)
        {
            var q = ctx.Cards.AsNoTracking()
            .Where(c => c.Id == request.Id);

            var dto = await q
            .Select(x => new GetCardByIdQueryDto
            {
                Id = x.Id,
                Title = x.Title,
                Description = x.Description,
                Version = x.Version,
                Order = x.Order,
                ColumnId = x.ColumnId,
                ColumnTitle = x.Column.Title

            })
            .FirstOrDefaultAsync(ct);

            if (dto == null)
            {
                throw new NotFoundException($"Card with Id {request.Id} not found.");
            }

            return dto;
        }
    }
}
