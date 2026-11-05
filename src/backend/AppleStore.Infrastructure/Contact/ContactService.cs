using AppleStore.Application.Contact;
using AppleStore.Domain.Contact;
using AppleStore.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace AppleStore.Infrastructure.Contact;

public sealed class ContactService : IContactService
{
    private readonly AppDbContext _db;

    public ContactService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<ContactMessageDto> CreateAsync(ContactRequest request, CancellationToken cancellationToken)
    {
        var message = new ContactMessage
        {
            FullName = request.FullName.Trim(),
            Email = request.Email.Trim(),
            Phone = request.Phone.Trim(),
            Message = request.Message.Trim(),
            IsRead = false,
            CreatedAt = DateTime.UtcNow
        };
        _db.ContactMessages.Add(message);
        await _db.SaveChangesAsync(cancellationToken);
        return Map(message);
    }

    public async Task<ContactMessageListDto> GetMessagesAsync(int page, int pageSize, CancellationToken cancellationToken)
    {
        page = page < 1 ? 1 : page;
        pageSize = pageSize is < 1 or > 24 ? 8 : pageSize;
        var query = _db.ContactMessages.AsNoTracking().OrderByDescending(message => message.CreatedAt);
        var total = await query.CountAsync(cancellationToken);
        var items = await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync(cancellationToken);
        return new ContactMessageListDto
        {
            Items = items.Select(Map).ToList(),
            TotalCount = total,
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task<ContactMessageDto?> GetMessageAsync(int id, CancellationToken cancellationToken)
    {
        var message = await _db.ContactMessages.FirstOrDefaultAsync(item => item.Id == id, cancellationToken);
        if (message is null)
        {
            return null;
        }

        if (!message.IsRead)
        {
            message.IsRead = true;
            await _db.SaveChangesAsync(cancellationToken);
        }

        return Map(message);
    }

    private static ContactMessageDto Map(ContactMessage message)
    {
        return new ContactMessageDto
        {
            Id = message.Id,
            FullName = message.FullName,
            Email = message.Email,
            Phone = message.Phone,
            Message = message.Message,
            IsRead = message.IsRead,
            CreatedAt = message.CreatedAt
        };
    }
}
