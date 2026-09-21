using FluentValidation;

namespace KanbanBoardApi.Features.Columns.Commands.Create
{
    public class CreateColumnCommandValidator : AbstractValidator<CreateColumnCommand>
    {
        public CreateColumnCommandValidator()
        {
            RuleFor(x => x.Title).NotEmpty().MaximumLength(100);
            RuleFor(x => x.BoardId).NotEmpty();   // hvata i Guid.Empty
        }
    }
}
