namespace AppleStore.Application.Account;

public sealed class ProfileDto
{
    public string Email { get; init; } = string.Empty;

    public string FullName { get; init; } = string.Empty;

    public string PhoneNumber { get; init; } = string.Empty;
}

public sealed class UpdateProfileRequest
{
    public string FullName { get; set; } = string.Empty;

    public string PhoneNumber { get; set; } = string.Empty;
}

public sealed class ChangePasswordRequest
{
    public string CurrentPassword { get; set; } = string.Empty;

    public string NewPassword { get; set; } = string.Empty;

    public string ConfirmPassword { get; set; } = string.Empty;
}

public sealed class AddressDto
{
    public int Id { get; init; }

    public string RecipientName { get; init; } = string.Empty;

    public string Phone { get; init; } = string.Empty;

    public string AddressLine { get; init; } = string.Empty;

    public bool IsDefault { get; init; }
}

public sealed class AddressWriteRequest
{
    public string RecipientName { get; set; } = string.Empty;

    public string Phone { get; set; } = string.Empty;

    public string AddressLine { get; set; } = string.Empty;

    public bool IsDefault { get; set; }
}
