namespace AppleStore.Application.Content;

public sealed class ContentPageListItemDto
{
    public string Slug { get; init; } = string.Empty;

    public string Title { get; init; } = string.Empty;
}

public sealed class ContentPageDto
{
    public string Slug { get; init; } = string.Empty;

    public string Title { get; init; } = string.Empty;

    public string Body { get; init; } = string.Empty;
}
