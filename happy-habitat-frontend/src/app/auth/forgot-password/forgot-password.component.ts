import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LoggerService } from '../../services/logger.service';
import { FormUtils } from '../../utils/form-utils';
import { ShowFormErrorTemplateComponent } from '../../shared/show-form-error-template/show-form-error-template.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'hh-forgot-password',
  imports: [ReactiveFormsModule, ShowFormErrorTemplateComponent, CommonModule, RouterLink],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css'
})
export class ForgotPasswordComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private logger = inject(LoggerService);

  formUtils = FormUtils;
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  isLoading = signal<boolean>(false);

  forgotPasswordForm: FormGroup = this.fb.group({
    usernameOrEmail: ['', [Validators.required, Validators.minLength(3)]]
  });

  onSubmit(): void {
    if (this.forgotPasswordForm.invalid) {
      this.forgotPasswordForm.markAllAsTouched();
      this.logger.debug('Forgot password form validation failed', 'ForgotPasswordComponent');
      return;
    }

    this.errorMessage.set(null);
    this.successMessage.set(null);
    this.isLoading.set(true);

    const { usernameOrEmail } = this.forgotPasswordForm.value;
    this.logger.event('forgot_password_requested', { usernameOrEmail }, 'ForgotPasswordComponent');

    this.authService.forgotPassword(usernameOrEmail).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.successMessage.set(
          'Si el usuario o correo existe, se ha enviado un correo con una contraseña provisional. Por favor, revisa tu bandeja de entrada.'
        );
        this.logger.info('Forgot password request successful', 'ForgotPasswordComponent', { usernameOrEmail });
        
        // Limpiar el formulario después de 3 segundos
        setTimeout(() => {
          this.forgotPasswordForm.reset();
        }, 3000);
      },
      error: (error) => {
        this.isLoading.set(false);
        const errorMsg = error?.error?.message || 'Error al procesar la solicitud. Intenta nuevamente.';
        this.errorMessage.set(errorMsg);
        this.logger.event('forgot_password_failed', { usernameOrEmail, error: errorMsg }, 'ForgotPasswordComponent');
      }
    });
  }
}

