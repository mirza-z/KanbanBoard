using Microsoft.EntityFrameworkCore;
using KanbanBoardApi.Domain.Entities;

namespace KanbanBoardApi.Data;

public class KanbanDbContext : DbContext
{
    public KanbanDbContext(DbContextOptions<KanbanDbContext> options)
        : base(options)
    {
    }

    public DbSet<Board> Boards => Set<Board>();
    public DbSet<Column> Columns => Set<Column>();
    public DbSet<Card> Cards => Set<Card>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Board>()
            .HasMany(b => b.Columns)
            .WithOne(c => c.Board)
            .HasForeignKey(c => c.BoardId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Column>()
            .HasMany(c => c.Cards)
            .WithOne(card => card.Column)
            .HasForeignKey(card => card.ColumnId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Card>()
            .Property(c => c.Version).IsConcurrencyToken();

        base.OnModelCreating(modelBuilder);
    }
}