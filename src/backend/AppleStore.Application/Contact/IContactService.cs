namespace AppleStore.Application.Contact;

public interface IContactService
{
    Task<ContactMessageDto> CreateAsync(ContactRequest request, CancellationToken cancellationToken);

    Task<ContactMessageListDto> GetMessagesAsync(int page, int pageSize, CancellationToken cancellationToken);

    Task<ContactMessageDto?> GetMessageAsync(int id, CancellationToken cancellationToken);
}
