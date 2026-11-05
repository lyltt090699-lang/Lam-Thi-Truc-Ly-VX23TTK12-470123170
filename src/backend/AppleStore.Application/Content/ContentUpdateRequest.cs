namespace AppleStore.Application.Content;

public sealed class ContentUpdateRequest
{
    public string Title { get; set; } = string.Empty;

    public string Body { get; set; } = string.Empty;
}

public sealed class AdminContentPageDto
{
    public int Id { get; init; }

    public string Slug { get; init; } = string.Empty;

    public string Title { get; init; } = string.Empty;

    public string Body { get; init; } = string.Empty;
}
