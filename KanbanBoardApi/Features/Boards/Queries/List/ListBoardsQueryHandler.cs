using KanbanBoardApi.Data;
using KanbanBoardApi.Features.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace KanbanBoardApi.Features.Boards.Queries.List
{
    public class ListBoardsQueryHandler(KanbanDbContext ctx) : IRequestHandler<ListBoardsQuery, PageResult<ListBoardsQueryDto>>
    {
        public async Task<PageResult<ListBoardsQueryDto>> Handle(
       ListBoardsQuery request, CancellationToken ct)
        {
            var q = ctx.Boards.AsNoTracking();
            q = q.Where(b => b.OwnerId == request.OwnerId);

            var searchTerm = request.Search?.Trim().ToLower() ?? string.Empty;

            if (!string.IsNullOrWhiteSpace(request.Search))
            {
                q = q.Where(x => x.Title.ToLower().Contains(searchTerm));
            }

            var projectedQuery = q.OrderBy(x => x.Title)
                .Select(x => new ListBoardsQueryDto
                {
                    Id = x.Id,
                    Title = x.Title,
                    OwnerId = x.OwnerId,
                    CreatedAt = x.CreatedAt,
                });

            return await PageResult<ListBoardsQueryDto>.FromQueryableAsync(projectedQuery, request.Paging, ct);
        }
    }
}
