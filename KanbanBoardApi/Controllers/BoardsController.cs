using KanbanBoardApi.Features.Boards.Commands.Create;
using KanbanBoardApi.Features.Boards.Commands.Delete;
using KanbanBoardApi.Features.Boards.Commands.Update;
using KanbanBoardApi.Features.Boards.Queries.GetById;
using KanbanBoardApi.Features.Boards.Queries.List;
using KanbanBoardApi.Features.Common;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Reflection;

namespace KanbanBoardApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BoardsController(IMediator mediator) : ControllerBase
    {
        [HttpPost]
        public async Task<IActionResult> CreateBoard([FromBody] CreateBoardCommand command, CancellationToken ct)
        {
            var boardId = await mediator.Send(command, ct);
            return CreatedAtAction(nameof(GetBoardById), new { id = boardId }, boardId);
        }

        [HttpPut("{id:Guid}")]
        public async Task Update(Guid id, UpdateBoardCommand command, CancellationToken ct)
        {
            // ID from the route takes precedence
            command.Id = id;
            await mediator.Send(command, ct);
            // no return -> 204 No Content
        }

        [HttpDelete("{id:Guid}")]
        public async Task Delete(Guid id, CancellationToken ct)
        {
            await mediator.Send(new DeleteBoardCommand { Id = id }, ct);
            // no return -> 204 No Content
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetBoardById(Guid id, CancellationToken ct)
        {
            var query = new GetBoardByIdQuery { Id = id };
            var dto = await mediator.Send(query, ct);
            return Ok(dto);
        }

        [HttpGet]
        public async Task<PageResult<ListBoardsQueryDto>> List([FromQuery] ListBoardsQuery query, CancellationToken ct)
        {
            var result = await mediator.Send(query, ct);
            return result;
        }
    }
}