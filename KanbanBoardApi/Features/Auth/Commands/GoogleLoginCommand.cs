using FluentValidation;
using Google.Apis.Auth;
using MediatR;
using Microsoft.Extensions.Options;

public record GoogleLoginCommand(string IdToken) : IRequest<GoogleLoginResult>;

public record GoogleLoginResult(string Token, string OwnerId, string Email, string Name);

public class GoogleLoginCommandValidator : AbstractValidator<GoogleLoginCommand>
{
    public GoogleLoginCommandValidator()
    {
        RuleFor(x => x.IdToken).NotEmpty();
    }
}

public class GoogleLoginCommandHandler(
    IOptions<JwtSettings> googleAudienceOptions,
    IJwtTokenService jwtTokenService,
    IConfiguration configuration) : IRequestHandler<GoogleLoginCommand, GoogleLoginResult>
{
    public async Task<GoogleLoginResult> Handle(GoogleLoginCommand request, CancellationToken ct)
    {
        var googleClientId = configuration["Google:ClientId"];

        GoogleJsonWebSignature.Payload payload;
        try
        {
            payload = await GoogleJsonWebSignature.ValidateAsync(request.IdToken, new GoogleJsonWebSignature.ValidationSettings
            {
                Audience = [googleClientId]
            });
        }
        catch (InvalidJwtException)
        {
            throw new UnauthorizedAccessException("Invalid Google token.");
        }

        var token = jwtTokenService.GenerateToken(payload.Subject, payload.Email, payload.Name);

        return new GoogleLoginResult(token, payload.Subject, payload.Email, payload.Name);
    }
}