namespace AppleStore.Domain.Content;

public class ContentPage
{
    public int Id { get; set; }

    public string Slug { get; set; } = string.Empty;

    public string Title { get; set; } = string.Empty;

    public string Body { get; set; } = string.Empty;

    public int SortOrder { get; set; }
}
