using FluentValidation;
using MediatR;
using System.Text.Json.Serialization;

public class MoveCardCommand : IRequest<int>
{
    [JsonIgnore]
    public Guid Id { get; set; }
    public Guid TargetColumnId { get; set; }
    public int TargetIndex { get; set; }
    public int Version { get; set; }
}

public class MoveCardCommandValidator : AbstractValidator<MoveCardCommand>
{
    public MoveCardCommandValidator()
    {
        RuleFor(x => x.TargetColumnId).NotEmpty();
        RuleFor(x => x.TargetIndex).GreaterThanOrEqualTo(0);
        RuleFor(x => x.Version).GreaterThan(0);
    }
}