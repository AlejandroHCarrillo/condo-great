using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using HappyHabitat.Application.DTOs;
using HappyHabitat.Application.Interfaces;

namespace HappyHabitat.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "ADMIN_COMPANY,SYSTEM_ADMIN")]
public class PaymentHistoriesController : ControllerBase
{
    private readonly IPaymentHistoryService _paymentHistoryService;

    public PaymentHistoriesController(IPaymentHistoryService paymentHistoryService)
    {
        _paymentHistoryService = paymentHistoryService;
    }

    /// <summary>
    /// Get all payment histories
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<PaymentHistoryDto>>> GetAllPaymentHistories([FromQuery] bool includeInactive = false)
    {
        var paymentHistories = await _paymentHistoryService.GetAllPaymentHistoriesAsync(includeInactive);
        return Ok(paymentHistories);
    }

    /// <summary>
    /// Get payment histories by contrato ID
    /// </summary>
    [HttpGet("contrato/{contratoId}")]
    public async Task<ActionResult<IEnumerable<PaymentHistoryDto>>> GetPaymentHistoriesByContratoId(Guid contratoId, [FromQuery] bool includeInactive = false)
    {
        var paymentHistories = await _paymentHistoryService.GetPaymentHistoriesByContratoIdAsync(contratoId, includeInactive);
        return Ok(paymentHistories);
    }

    /// <summary>
    /// Get payment history by ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<PaymentHistoryDto>> GetPaymentHistoryById(Guid id, [FromQuery] bool includeInactive = false)
    {
        var paymentHistory = await _paymentHistoryService.GetPaymentHistoryByIdAsync(id, includeInactive);
        if (paymentHistory == null)
            return NotFound();

        return Ok(paymentHistory);
    }

    /// <summary>
    /// Create a new payment history
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<PaymentHistoryDto>> CreatePaymentHistory(CreatePaymentHistoryDto createPaymentHistoryDto)
    {
        try
        {
            // Obtener el ID del usuario actual desde los claims
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            Guid? updatedByUserId = null;
            if (Guid.TryParse(userIdClaim, out var userId))
            {
                updatedByUserId = userId;
            }

            var paymentHistory = await _paymentHistoryService.CreatePaymentHistoryAsync(createPaymentHistoryDto, updatedByUserId);
            return CreatedAtAction(nameof(GetPaymentHistoryById), new { id = paymentHistory.Id }, paymentHistory);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    /// <summary>
    /// Update an existing payment history
    /// </summary>
    [HttpPut("{id}")]
    public async Task<ActionResult<PaymentHistoryDto>> UpdatePaymentHistory(Guid id, UpdatePaymentHistoryDto updatePaymentHistoryDto)
    {
        try
        {
            // Obtener el ID del usuario actual desde los claims
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            Guid? updatedByUserId = null;
            if (Guid.TryParse(userIdClaim, out var userId))
            {
                updatedByUserId = userId;
            }

            var paymentHistory = await _paymentHistoryService.UpdatePaymentHistoryAsync(id, updatePaymentHistoryDto, updatedByUserId);
            if (paymentHistory == null)
                return NotFound();

            return Ok(paymentHistory);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    /// <summary>
    /// Delete a payment history
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeletePaymentHistory(Guid id)
    {
        var result = await _paymentHistoryService.DeletePaymentHistoryAsync(id);
        if (!result)
            return NotFound();

        return NoContent();
    }
}


