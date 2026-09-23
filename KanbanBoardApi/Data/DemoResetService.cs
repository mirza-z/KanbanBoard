using KanbanBoardApi.Hubs;
using Microsoft.AspNetCore.SignalR;

namespace KanbanBoardApi.Data;

public class DemoResetService(
    IServiceScopeFactory scopeFactory,
    IHubContext<BoardHub> hub,
    IConfiguration config,
    ILogger<DemoResetService> logger) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        var minutes = config.GetValue("Demo:ResetIntervalMinutes", 60);
        using var timer = new PeriodicTimer(TimeSpan.FromMinutes(minutes));

        try
        {
            while (await timer.WaitForNextTickAsync(stoppingToken))
            {
                try
                {
                    using var scope = scopeFactory.CreateScope();
                    var ctx = scope.ServiceProvider.GetRequiredService<KanbanDbContext>();
                    await DemoSeeder.ResetAsync(ctx, stoppingToken);

                    await hub.Clients.Group(BoardHub.GroupName(DemoSeeder.DemoBoardId))
                        .SendAsync("BoardChanged", cancellationToken: stoppingToken);

                    logger.LogInformation("Demo board reset.");
                }
                catch (Exception ex) when (ex is not OperationCanceledException)
                {
                    logger.LogError(ex, "Demo board reset failed.");
                }
            }
        }
        catch (OperationCanceledException)
        {
        }
    }
}