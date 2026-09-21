using KanbanBoardApi.Data;
using KanbanBoardApi.Features.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace KanbanBoardApi.Features.Boards.Queries.GetById
{
    public class GetBoardByIdQueryHandler(KanbanDbContext ctx) :IRequestHandler<GetBoardByIdQuery, GetBoardByIdQueryDto>
    {
        public async Task<GetBoardByIdQueryDto> Handle (GetBoardByIdQuery request, CancellationToken ct)
        {
            var q = ctx.Boards.AsNoTracking()
            .Where(c => c.Id == request.Id);

            var dto = await q
            .Select(x => new GetBoardByIdQueryDto
            {
                Id = x.Id,
                Title = x.Title,
                OwnerId = x.OwnerId,
                CreatedAt = x.CreatedAt,
                Columns = x.Columns
                            .OrderBy(c => c.Order)
                            .Select(c => new ColumnDto
                            {
                                Id = c.Id,
                                Title = c.Title,
                                Order = c.Order,
                                Cards = c.Cards
                                    .OrderBy(k => k.Order)
                                    .Select(k => new CardDto
                                    {
                                        Id = k.Id,
                                        Title = k.Title,
                                        Description = k.Description,
                                        Order = k.Order,
                                        Version = k.Version
                                    }).ToList()
                            }).ToList()
            })
            .FirstOrDefaultAsync(ct);

            if (dto == null)
            {
                throw new NotFoundException($"Board with Id {request.Id} not found.");
            }

            return dto;
        }
    }
}
