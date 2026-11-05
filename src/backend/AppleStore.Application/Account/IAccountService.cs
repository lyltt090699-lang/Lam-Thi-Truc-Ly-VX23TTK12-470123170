namespace AppleStore.Application.Account;

public interface IAccountService
{
    Task<ProfileDto?> GetProfileAsync(string userId, CancellationToken cancellationToken);

    Task<ProfileDto?> UpdateProfileAsync(string userId, UpdateProfileRequest request, CancellationToken cancellationToken);

    Task<(bool Success, string Message)> ChangePasswordAsync(string userId, ChangePasswordRequest request, CancellationToken cancellationToken);

    Task<IReadOnlyList<AddressDto>> GetAddressesAsync(string userId, CancellationToken cancellationToken);

    Task<AddressDto?> CreateAddressAsync(string userId, AddressWriteRequest request, CancellationToken cancellationToken);

    Task<AddressDto?> UpdateAddressAsync(string userId, int id, AddressWriteRequest request, CancellationToken cancellationToken);

    Task<bool> DeleteAddressAsync(string userId, int id, CancellationToken cancellationToken);
}
