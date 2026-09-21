
using KanbanBoardApi.Data;
using KanbanBoardApi.Features.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace KanbanBoardApi.Features.Columns.Queries.List
{
    public class ListColumnsQueryHandler(KanbanDbContext ctx) : IRequestHandler<ListColumnsQuery, PageResult<ListColumnsQueryDto>>
    {
        public async Task<PageResult<ListColumnsQueryDto>> Handle(
                ListColumnsQuery request, CancellationToken ct)
        {
            var q = ctx.Columns.AsNoTracking();

            if (request.BoardId is { } boardId)
                q = q.Where(x => x.BoardId == boardId);

            var searchTerm = request.Search?.Trim().ToLower();
            if (!string.IsNullOrEmpty(searchTerm))
                q = q.Where(x => x.Title.ToLower().Contains(searchTerm));

            var projectedQuery = q
                .OrderBy(x => x.BoardId)
                .ThenBy(x => x.Order)
                .ThenBy(x => x.Id)
                .Select(x => new ListColumnsQueryDto
                {
                    Id = x.Id,
                    Title = x.Title,
                    Order = x.Order,
                    BoardId = x.BoardId,
                    BoardTitle = x.Board.Title
                });

            return await PageResult<ListColumnsQueryDto>.FromQueryableAsync(
                projectedQuery, request.Paging, ct);
        }
    }
}
