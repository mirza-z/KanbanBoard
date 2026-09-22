using FluentValidation;

namespace KanbanBoardApi.Features.Columns.Commands.Reorder;

public class ReorderColumnsCommandValidator : AbstractValidator<ReorderColumnsCommand>
{
    public ReorderColumnsCommandValidator()
    {
        RuleFor(x => x.BoardId).NotEmpty();
        RuleFor(x => x.ColumnIds).NotEmpty();
    }
}