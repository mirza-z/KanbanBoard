using FluentValidation;

namespace KanbanBoardApi.Features.Boards.Commands.Create
{
    public class CreateBoardCommandValidator : AbstractValidator<CreateBoardCommand>
    {
        public CreateBoardCommandValidator()
        {
            RuleFor(x => x.Title).NotEmpty().MaximumLength(100);
            RuleFor(x => x.OwnerId).NotEmpty();   // dok ga ručno unosiš
        }
    }
}
