namespace AppleStore.Domain.Account;

public class CustomerAddress
{
    public int Id { get; set; }

    public string UserId { get; set; } = string.Empty;

    public string RecipientName { get; set; } = string.Empty;

    public string Phone { get; set; } = string.Empty;

    public string AddressLine { get; set; } = string.Empty;

    public bool IsDefault { get; set; }

    public DateTime CreatedAt { get; set; }
}
