using AppleStore.Application.Account;
using AppleStore.Domain.Account;
using AppleStore.Infrastructure.Identity;
using AppleStore.Infrastructure.Persistence;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace AppleStore.Infrastructure.Account;

public sealed class AccountService : IAccountService
{
    private readonly UserManager<ApplicationUser> _users;
    private readonly AppDbContext _db;

    public AccountService(UserManager<ApplicationUser> users, AppDbContext db)
    {
        _users = users;
        _db = db;
    }

    public async Task<ProfileDto?> GetProfileAsync(string userId, CancellationToken cancellationToken)
    {
        var user = await _users.FindByIdAsync(userId);
        if (user is null || string.IsNullOrWhiteSpace(user.Email))
        {
            return null;
        }

        return MapProfile(user);
    }

    public async Task<ProfileDto?> UpdateProfileAsync(string userId, UpdateProfileRequest request, CancellationToken cancellationToken)
    {
        cancellationToken.ThrowIfCancellationRequested();
        var user = await _users.FindByIdAsync(userId);
        if (user is null || string.IsNullOrWhiteSpace(user.Email))
        {
            return null;
        }

        user.FullName = request.FullName.Trim();
        user.PhoneNumber = string.IsNullOrWhiteSpace(request.PhoneNumber) ? null : request.PhoneNumber.Trim();
        var result = await _users.UpdateAsync(user);
        if (!result.Succeeded)
        {
            return null;
        }

        return MapProfile(user);
    }

    public async Task<(bool Success, string Message)> ChangePasswordAsync(string userId, ChangePasswordRequest request, CancellationToken cancellationToken)
    {
        cancellationToken.ThrowIfCancellationRequested();
        var user = await _users.FindByIdAsync(userId);
        if (user is null)
        {
            return (false, "Không tìm thấy tài khoản.");
        }

        var result = await _users.ChangePasswordAsync(user, request.CurrentPassword, request.NewPassword);
        if (result.Succeeded)
        {
            return (true, "Đã đổi mật khẩu.");
        }

        if (result.Errors.Any(error => error.Code is "PasswordMismatch"))
        {
            return (false, "Mật khẩu hiện tại không đúng.");
        }

        var message = result.Errors.Select(error => error.Code switch
        {
            "PasswordTooShort" => "Mật khẩu tối thiểu 8 ký tự.",
            "PasswordRequiresDigit" => "Mật khẩu cần chữ số.",
            "PasswordRequiresLower" => "Mật khẩu cần chữ thường.",
            "PasswordRequiresUpper" => "Mật khẩu cần chữ hoa.",
            "PasswordRequiresNonAlphanumeric" => "Mật khẩu cần ký tự đặc biệt.",
            _ => "Không đổi được mật khẩu."
        }).FirstOrDefault() ?? "Không đổi được mật khẩu.";

        return (false, message);
    }

    public async Task<IReadOnlyList<AddressDto>> GetAddressesAsync(string userId, CancellationToken cancellationToken)
    {
        var addresses = await _db.Addresses
            .AsNoTracking()
            .Where(address => address.UserId == userId)
            .OrderByDescending(address => address.IsDefault)
            .ThenByDescending(address => address.CreatedAt)
            .ToListAsync(cancellationToken);

        return addresses.Select(MapAddress).ToList();
    }

    public async Task<AddressDto?> CreateAddressAsync(string userId, AddressWriteRequest request, CancellationToken cancellationToken)
    {
        var count = await _db.Addresses.CountAsync(address => address.UserId == userId, cancellationToken);
        if (count >= 10)
        {
            return null;
        }

        var makeDefault = request.IsDefault || count == 0;
        if (makeDefault)
        {
            await ClearDefaultsAsync(userId, cancellationToken);
        }

        var address = new CustomerAddress
        {
            UserId = userId,
            RecipientName = request.RecipientName.Trim(),
            Phone = request.Phone.Trim(),
            AddressLine = request.AddressLine.Trim(),
            IsDefault = makeDefault,
            CreatedAt = DateTime.UtcNow
        };
        _db.Addresses.Add(address);
        await _db.SaveChangesAsync(cancellationToken);
        return MapAddress(address);
    }

    public async Task<AddressDto?> UpdateAddressAsync(string userId, int id, AddressWriteRequest request, CancellationToken cancellationToken)
    {
        var address = await _db.Addresses.FirstOrDefaultAsync(item => item.Id == id && item.UserId == userId, cancellationToken);
        if (address is null)
        {
            return null;
        }

        address.RecipientName = request.RecipientName.Trim();
        address.Phone = request.Phone.Trim();
        address.AddressLine = request.AddressLine.Trim();

        if (request.IsDefault)
        {
            await ClearDefaultsAsync(userId, cancellationToken);
            address.IsDefault = true;
        }
        else if (address.IsDefault)
        {
            var replacement = await _db.Addresses
                .Where(item => item.UserId == userId && item.Id != id)
                .OrderByDescending(item => item.CreatedAt)
                .FirstOrDefaultAsync(cancellationToken);
            if (replacement is null)
            {
                address.IsDefault = true;
            }
            else
            {
                address.IsDefault = false;
                replacement.IsDefault = true;
            }
        }

        await _db.SaveChangesAsync(cancellationToken);
        return MapAddress(address);
    }

    public async Task<bool> DeleteAddressAsync(string userId, int id, CancellationToken cancellationToken)
    {
        var address = await _db.Addresses.FirstOrDefaultAsync(item => item.Id == id && item.UserId == userId, cancellationToken);
        if (address is null)
        {
            return false;
        }

        var wasDefault = address.IsDefault;
        _db.Addresses.Remove(address);
        await _db.SaveChangesAsync(cancellationToken);

        if (wasDefault)
        {
            var replacement = await _db.Addresses
                .Where(item => item.UserId == userId)
                .OrderByDescending(item => item.CreatedAt)
                .FirstOrDefaultAsync(cancellationToken);
            if (replacement is not null)
            {
                replacement.IsDefault = true;
                await _db.SaveChangesAsync(cancellationToken);
            }
        }

        return true;
    }

    private async Task ClearDefaultsAsync(string userId, CancellationToken cancellationToken)
    {
        var defaults = await _db.Addresses.Where(address => address.UserId == userId && address.IsDefault).ToListAsync(cancellationToken);
        foreach (var address in defaults)
        {
            address.IsDefault = false;
        }
    }

    private static ProfileDto MapProfile(ApplicationUser user)
    {
        return new ProfileDto
        {
            Email = user.Email ?? string.Empty,
            FullName = user.FullName,
            PhoneNumber = user.PhoneNumber ?? string.Empty
        };
    }

    private static AddressDto MapAddress(CustomerAddress address)
    {
        return new AddressDto
        {
            Id = address.Id,
            RecipientName = address.RecipientName,
            Phone = address.Phone,
            AddressLine = address.AddressLine,
            IsDefault = address.IsDefault
        };
    }
}
