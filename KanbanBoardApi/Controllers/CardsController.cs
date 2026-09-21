using KanbanBoardApi.Features.Cards.Commands.Create;
using KanbanBoardApi.Features.Cards.Commands.Delete;
using KanbanBoardApi.Features.Cards.Commands.Update;
using KanbanBoardApi.Features.Cards.Queries.GetById;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace KanbanBoardApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CardsController(IMediator mediator) : ControllerBase
    {
        //create
        [HttpPost]
        public async Task<IActionResult> CreateCard([FromBody] CreateCardCommand command, CancellationToken ct)
        {
            var cardId = await mediator.Send(command, ct);
            return CreatedAtAction(nameof(GetCardById), new { id = cardId }, cardId);
        }

        //delete
        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> DeleteCard(Guid id, CancellationToken ct)
        {
            await mediator.Send(new DeleteCardCommand { Id = id }, ct);
            return NoContent();
        }

        //move
        [HttpPut("{id:guid}/move")]
        public async Task<IActionResult> MoveCard(Guid id, [FromBody] MoveCardCommand command, CancellationToken ct)
        {
            command.Id = id;
            var version = await mediator.Send(command, ct);
            return Ok(new { version });
        }

        //update
        [HttpPut("{id:guid}")]
        public async Task<IActionResult> UpdateCard(Guid id, [FromBody] UpdateCardCommand command, CancellationToken ct)
        {
            command.Id = id;
            var version = await mediator.Send(command, ct);
            return Ok(new { version });
        }

        //getById
        [HttpGet("{id}")]
        public async Task<IActionResult> GetCardById(Guid id, CancellationToken ct)
        {
            var query = new GetCardByIdQuery { Id = id };
            var dto = await mediator.Send(query, ct);
            return Ok(dto);
        }

        //getAll

    }
}