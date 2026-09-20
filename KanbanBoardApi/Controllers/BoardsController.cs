using KanbanBoardApi.Features.Boards.Commands.Create;
using KanbanBoardApi.Features.Boards.Queries.GetById;
using MediatR;
using Microsoft.AspNetCore.Mvc;

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

        [HttpGet("{id}")]
        public async Task<IActionResult> GetBoardById(Guid id, CancellationToken ct)
        {
            var query = new GetBoardByIdQuery { Id = id };
            var dto = await mediator.Send(query, ct);
            return Ok(dto);
        }
    }
}