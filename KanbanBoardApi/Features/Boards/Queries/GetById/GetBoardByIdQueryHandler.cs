using KanbanBoardApi.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace KanbanBoardApi.Features.Boards.Queries.GetById
{
    public class GetBoardByIdQueryHandler(KanbanDbContext ctx) :IRequestHandler<GetBoardByIdQuery, GetBoardByIdQueryDto>
    {
        public async Task<GetBoardByIdQueryDto> Handle (GetBoardByIdQuery request, CancellationToken ct)
        {
            var q = ctx.Boards
            .Where(c => c.Id == request.Id);

            var dto = await q
            .Select(x => new GetBoardByIdQueryDto
            {
                Id = x.Id,
                Title = x.Title,
                OwnerId = x.OwnerId,
                CreatedAt = x.CreatedAt,
                Columns = x.Columns,
            })
            .FirstOrDefaultAsync(ct);

            if (dto == null)
            {
                throw new Exception($"Board with Id {request.Id} not found.");
            }

            return dto;
        }
    }
}
