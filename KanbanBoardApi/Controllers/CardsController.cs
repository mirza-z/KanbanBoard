using KanbanBoardApi.Features.Cards.Commands.Create;
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


        //update


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