using KanbanBoardApi.Features.Boards.Commands.Create;
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
            return CreatedAtAction(nameof(CreateBoard), new { id = boardId }, boardId);
        }
    }
}