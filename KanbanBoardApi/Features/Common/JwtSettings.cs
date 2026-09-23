public class JwtSettings
{
    public string Secret { get; set; } = default!;
    public string Issuer { get; set; } = "KanbanBoardApi";
    public string Audience { get; set; } = "KanbanBoardClient";
    public int ExpiryDays { get; set; } = 7; 
}