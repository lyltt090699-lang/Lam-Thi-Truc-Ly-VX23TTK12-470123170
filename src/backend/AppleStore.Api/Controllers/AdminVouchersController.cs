using AppleStore.Application.Auth;
using AppleStore.Application.Orders;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AppleStore.Api.Controllers;

[ApiController]
[Authorize(Roles = AppRoles.Admin)]
[Route("api/admin/vouchers")]
public class AdminVouchersController : ControllerBase
{
    private readonly IAdminVoucherService _vouchers;
    private readonly IValidator<VoucherWriteRequest> _validator;

    public AdminVouchersController(IAdminVoucherService vouchers, IValidator<VoucherWriteRequest> validator)
    {
        _vouchers = vouchers;
        _validator = validator;
    }

    [HttpGet]
    public Task<IReadOnlyList<VoucherDto>> List(CancellationToken cancellationToken)
    {
        return _vouchers.ListAsync(cancellationToken);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] VoucherWriteRequest request, CancellationToken cancellationToken)
    {
        var validation = await _validator.ValidateAsync(request, cancellationToken);
        if (!validation.IsValid)
        {
            return BadRequest(new { message = validation.Errors[0].ErrorMessage });
        }

        var voucher = await _vouchers.CreateAsync(request, cancellationToken);
        if (voucher is null)
        {
            return Conflict(new { message = "Mã giảm giá đã tồn tại." });
        }

        return Ok(voucher);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] VoucherWriteRequest request, CancellationToken cancellationToken)
    {
        var validation = await _validator.ValidateAsync(request, cancellationToken);
        if (!validation.IsValid)
        {
            return BadRequest(new { message = validation.Errors[0].ErrorMessage });
        }

        var existing = await _vouchers.ListAsync(cancellationToken);
        if (existing.All(item => item.Id != id))
        {
            return NotFound(new { message = "Không tìm thấy mã giảm giá." });
        }

        var voucher = await _vouchers.UpdateAsync(id, request, cancellationToken);
        if (voucher is null)
        {
            return Conflict(new { message = "Mã giảm giá đã tồn tại." });
        }

        return Ok(voucher);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        var deleted = await _vouchers.DeleteAsync(id, cancellationToken);
        if (!deleted)
        {
            return NotFound(new { message = "Không tìm thấy mã giảm giá." });
        }

        return Ok(new { message = "Đã xóa mã giảm giá." });
    }
}
