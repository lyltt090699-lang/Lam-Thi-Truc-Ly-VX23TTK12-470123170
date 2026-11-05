using AppleStore.Application.Content;
using AppleStore.Domain.Content;
using AppleStore.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace AppleStore.Infrastructure.Content;

public sealed class ContentService : IContentService
{
    private readonly AppDbContext _db;

    public ContentService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<IReadOnlyList<ContentPageListItemDto>> GetPagesAsync(CancellationToken cancellationToken)
    {
        var pages = await _db.ContentPages
            .AsNoTracking()
            .OrderBy(page => page.SortOrder)
            .ThenBy(page => page.Title)
            .ToListAsync(cancellationToken);

        return pages.Select(page => new ContentPageListItemDto
        {
            Slug = page.Slug,
            Title = page.Title
        }).ToList();
    }

    public async Task<ContentPageDto?> GetPageAsync(string slug, CancellationToken cancellationToken)
    {
        var page = await _db.ContentPages.AsNoTracking().FirstOrDefaultAsync(item => item.Slug == slug, cancellationToken);
        if (page is null)
        {
            return null;
        }

        return new ContentPageDto
        {
            Slug = page.Slug,
            Title = page.Title,
            Body = page.Body
        };
    }

    public async Task<IReadOnlyList<AdminContentPageDto>> GetAdminPagesAsync(CancellationToken cancellationToken)
    {
        var pages = await _db.ContentPages
            .AsNoTracking()
            .OrderBy(page => page.SortOrder)
            .ThenBy(page => page.Title)
            .ToListAsync(cancellationToken);

        return pages.Select(MapAdmin).ToList();
    }

    public async Task<AdminContentPageDto?> UpdatePageAsync(int id, ContentUpdateRequest request, CancellationToken cancellationToken)
    {
        var page = await _db.ContentPages.FirstOrDefaultAsync(item => item.Id == id, cancellationToken);
        if (page is null)
        {
            return null;
        }

        page.Title = request.Title.Trim();
        page.Body = request.Body.Trim();
        await _db.SaveChangesAsync(cancellationToken);
        return MapAdmin(page);
    }

    private static AdminContentPageDto MapAdmin(ContentPage page)
    {
        return new AdminContentPageDto
        {
            Id = page.Id,
            Slug = page.Slug,
            Title = page.Title,
            Body = page.Body
        };
    }
}
