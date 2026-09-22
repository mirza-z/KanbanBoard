using FluentValidation;
using KanbanBoardApi.Data;
using Microsoft.EntityFrameworkCore;
using Scalar.AspNetCore;
using KanbanBoardApi.Hubs;

var builder = WebApplication.CreateBuilder(args);

const string AngularDevPolicy = "AngularDev";

builder.Services.AddControllers();

builder.Services.AddProblemDetails();
builder.Services.AddExceptionHandler<GlobalExceptionHandler>();

builder.Services.AddDbContext<KanbanDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddValidatorsFromAssembly(typeof(Program).Assembly);
builder.Services.AddMediatR(cfg =>
{
    cfg.RegisterServicesFromAssembly(typeof(Program).Assembly);
    cfg.AddOpenBehavior(typeof(ValidationBehavior<,>));
});

builder.Services.AddSignalR();

builder.Services.AddSingleton<IPresenceTracker, InMemoryPresenceTracker>();

builder.Services.AddCors(options =>
{
    options.AddPolicy(AngularDevPolicy, policy => policy
        .WithOrigins("http://localhost:4200")
        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowCredentials());
});

builder.Services.AddOpenApi();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
}

app.UseExceptionHandler();
app.UseHttpsRedirection();
app.UseCors(AngularDevPolicy);   
app.UseAuthorization();
app.MapControllers();
app.MapHub<BoardHub>("/hubs/board");

app.Run();