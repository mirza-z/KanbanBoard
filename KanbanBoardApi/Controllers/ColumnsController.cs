using KanbanBoardApi.Features.Columns.Commands.Create;
using KanbanBoardApi.Features.Columns.Queries.GetById;
using KanbanBoardApi.Features.Columns.Queries.List;
using KanbanBoardApi.Features.Common;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace KanbanBoardApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ColumnsController(IMediator mediator) : ControllerBase
    {
        //create
        [HttpPost]
        public async Task<IActionResult> CreateColumn([FromBody] CreateColumnCommand command, CancellationToken ct)
        {
            var boardId = await mediator.Send(command, ct);
            return CreatedAtAction(nameof(GetColumnById), new { id = boardId }, boardId);
        }

        //getById
        [HttpGet("{id}")]
        public async Task<IActionResult> GetColumnById(Guid id, CancellationToken ct)
        {
            var query = new GetColumnByIdQuery { Id = id };
            var dto = await mediator.Send(query, ct);
            return Ok(dto);
        }

        //getAll
        [HttpGet]
        public async Task<PageResult<ListColumnsQueryDto>> List([FromQuery] ListColumnsQuery query, CancellationToken ct)
        {
            var result = await mediator.Send(query, ct);
            return result;
        }

    }
}