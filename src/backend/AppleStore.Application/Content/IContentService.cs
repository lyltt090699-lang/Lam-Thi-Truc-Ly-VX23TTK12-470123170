namespace AppleStore.Application.Content;

public interface IContentService
{
    Task<IReadOnlyList<ContentPageListItemDto>> GetPagesAsync(CancellationToken cancellationToken);

    Task<ContentPageDto?> GetPageAsync(string slug, CancellationToken cancellationToken);

    Task<IReadOnlyList<AdminContentPageDto>> GetAdminPagesAsync(CancellationToken cancellationToken);

    Task<AdminContentPageDto?> UpdatePageAsync(int id, ContentUpdateRequest request, CancellationToken cancellationToken);
}
