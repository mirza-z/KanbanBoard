using MediatR;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/auth")]
public class AuthController(IMediator mediator) : ControllerBase
{
    [HttpPost("google-login")]
    public async Task<ActionResult<GoogleLoginResult>> GoogleLogin(GoogleLoginCommand command)
        => Ok(await mediator.Send(command));
}