using KanbanBoardApi.Features.Boards.Commands.Create;
using KanbanBoardApi.Features.Boards.Commands.Delete;
using KanbanBoardApi.Features.Boards.Commands.Update;
using KanbanBoardApi.Features.Boards.Queries.GetById;
using KanbanBoardApi.Features.Boards.Queries.List;
using KanbanBoardApi.Features.Columns.Commands.Reorder;
using KanbanBoardApi.Features.Common;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace KanbanBoardApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BoardsController(IMediator mediator) : ControllerBase
    {

        //create
        [HttpPost]
        [Authorize]
        public async Task<IActionResult> CreateBoard([FromBody] CreateBoardCommand command, CancellationToken ct)
        {
            command.OwnerId = User.GetOwnerId(); // prepisuje sve što klijent pošalje
            var boardId = await mediator.Send(command, ct);
            return CreatedAtAction(nameof(GetBoardById), new { id = boardId }, boardId);
        }

        //update
        [HttpPut("{id:guid}")]
        [Authorize]
        public async Task<IActionResult> Update(Guid id, UpdateBoardCommand command, CancellationToken ct)
        {
            command.Id = id;
            command.RequesterId = User.GetOwnerId();
            await mediator.Send(command, ct);
            return NoContent();
        }

        //reorder columns
        [HttpPut("{boardId:guid}/columns/order")]
        public async Task<IActionResult> ReorderColumns(Guid boardId, [FromBody] ReorderColumnsCommand command, CancellationToken ct)
        {
            command.BoardId = boardId;
            await mediator.Send(command, ct);
            return NoContent();
        }

        //delete
        [HttpDelete("{id:guid}")]
        [Authorize]
        public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
        {
            await mediator.Send(new DeleteBoardCommand { Id = id, RequesterId = User.GetOwnerId() }, ct);
            return NoContent();
        }

        //getById
        [HttpGet("{id}")]
        public async Task<IActionResult> GetBoardById(Guid id, CancellationToken ct)
        {
            var query = new GetBoardByIdQuery { Id = id };
            var dto = await mediator.Send(query, ct);
            return Ok(dto);
        }

        //getAll
        [HttpGet]
        [Authorize]
        public async Task<PageResult<ListBoardsQueryDto>> List([FromQuery] ListBoardsQuery query, CancellationToken ct)
        {
            query.OwnerId = User.GetOwnerId();
            return await mediator.Send(query, ct);
        }
    }
}