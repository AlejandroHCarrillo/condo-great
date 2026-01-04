using HappyHabitat.Application.DTOs;

namespace HappyHabitat.Application.Interfaces;

public interface IAuthService
{
    Task<LoginResponseDto?> LoginAsync(LoginDto loginDto);
    Task<AuthResponseDto> RegisterAsync(RegisterDto registerDto);
    Task<bool> ChangePasswordAsync(Guid userId, ChangePasswordDto changePasswordDto);
    Task<bool> ForgotPasswordAsync(ForgotPasswordDto forgotPasswordDto);
    Task<bool> ResetPasswordAsync(ResetPasswordDto resetPasswordDto);
    Task<AuthResponseDto?> RefreshTokenAsync(RefreshTokenDto refreshTokenDto);
}

