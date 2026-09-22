using System.Collections.Concurrent;

namespace KanbanBoardApi.Hubs;

public record PresenceInfo(Guid BoardId, string Color, string DisplayName);

public interface IPresenceTracker
{
    void Add(string connectionId, PresenceInfo info);
    PresenceInfo? Remove(string connectionId);
    PresenceInfo? Get(string connectionId);
    IEnumerable<(string ConnectionId, PresenceInfo Info)> GetByBoard(Guid boardId);
}

public class InMemoryPresenceTracker : IPresenceTracker
{
    private readonly ConcurrentDictionary<string, PresenceInfo> _connections = new();

    public void Add(string connectionId, PresenceInfo info) => _connections[connectionId] = info;

    public PresenceInfo? Remove(string connectionId) =>
        _connections.TryRemove(connectionId, out var info) ? info : null;

    public PresenceInfo? Get(string connectionId) =>
        _connections.TryGetValue(connectionId, out var info) ? info : null;

    public IEnumerable<(string ConnectionId, PresenceInfo Info)> GetByBoard(Guid boardId) =>
        _connections.Where(kv => kv.Value.BoardId == boardId)
                     .Select(kv => (kv.Key, kv.Value));
}