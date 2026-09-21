using FluentValidation;

namespace KanbanBoardApi.Features.Cards.Commands.Update
{
    public class UpdateCardCommandValidator : AbstractValidator<UpdateCardCommand>
    {
        public UpdateCardCommandValidator()
        {
            RuleFor(x => x.Title).NotEmpty().MaximumLength(100);
            RuleFor(x => x.Description).MaximumLength(500);
            RuleFor(x => x.Version).GreaterThan(0);
        }
    }
}
