using FluentValidation;

namespace KanbanBoardApi.Features.Cards.Commands.Create
{
    public class CreateCardCommandValidator: AbstractValidator<CreateCardCommand>
    {
        public CreateCardCommandValidator()
        {
            RuleFor(x => x.Title)
                .NotEmpty().WithMessage("Title cannot be empty")
                .MaximumLength(100).WithMessage("Maximum length for title is 100");

            RuleFor(x => x.Description)
                .MaximumLength(500).WithMessage("Maximum length for description is 500");

            RuleFor(x => x.ColumnId)
                .NotEmpty().WithMessage("Column Id cannot be empty");
        }
    }
}
