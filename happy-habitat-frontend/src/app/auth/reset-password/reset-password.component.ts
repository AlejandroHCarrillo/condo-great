import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LoggerService } from '../../services/logger.service';
import { FormUtils } from '../../utils/form-utils';
import { ShowFormErrorTemplateComponent } from '../../shared/show-form-error-template/show-form-error-template.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'hh-reset-password',
  imports: [ReactiveFormsModule, ShowFormErrorTemplateComponent, CommonModule, RouterLink],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css'
})
export class ResetPasswordComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private logger = inject(LoggerService);

  formUtils = FormUtils;
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  isLoading = signal<boolean>(false);

  resetPasswordForm: FormGroup = this.fb.group({
    currentPassword: ['', [Validators.required]],
    newPassword: ['', [Validators.required, FormUtils.strongPassword]],
    confirmPassword: ['', [Validators.required]]
  }, {
    validators: [FormUtils.compareFormFields('newPassword', 'confirmPassword')]
  });

  onSubmit(): void {
    if (this.resetPasswordForm.invalid) {
      this.resetPasswordForm.markAllAsTouched();
      this.logger.debug('Reset password form validation failed', 'ResetPasswordComponent');
      return;
    }

    this.errorMessage.set(null);
    this.successMessage.set(null);
    this.isLoading.set(true);

    const { currentPassword, newPassword } = this.resetPasswordForm.value;
    this.logger.event('reset_password_requested', {}, 'ResetPasswordComponent');

    this.authService.resetPassword(currentPassword, newPassword).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.successMessage.set('Tu contraseña ha sido actualizada exitosamente.');
        this.logger.info('Reset password successful', 'ResetPasswordComponent');
        
        // Limpiar el formulario y redirigir después de 2 segundos
        setTimeout(() => {
          this.resetPasswordForm.reset();
          this.router.navigate(['/home']);
        }, 2000);
      },
      error: (error) => {
        this.isLoading.set(false);
        const errorMsg = error?.error?.message || 'Error al actualizar la contraseña. Verifica tu contraseña actual e intenta nuevamente.';
        this.errorMessage.set(errorMsg);
        this.logger.event('reset_password_failed', { error: errorMsg }, 'ResetPasswordComponent');
      }
    });
  }

  getFieldError(fieldName: string): string | null {
    if (fieldName === 'confirmPassword' && this.resetPasswordForm.errors?.['fieldsAreNotEquals']) {
      return 'Las contraseñas no coinciden';
    }
    
    if (fieldName === 'newPassword') {
      const field = this.resetPasswordForm.get('newPassword');
      if (field?.errors) {
        // Verificar si tiene errores de contraseña fuerte
        if (field.errors['passwordLength'] || 
            field.errors['passwordUppercase'] || 
            field.errors['passwordNumber'] || 
            field.errors['passwordSpecial'] ||
            field.errors['passwordInvalidChars']) {
          return FormUtils.getStrongPasswordError(field.errors);
        }
      }
    }
    
    return FormUtils.getFieldError(this.resetPasswordForm, fieldName);
  }

  isValidField(fieldName: string): boolean | null {
    if (fieldName === 'confirmPassword') {
      const field = this.resetPasswordForm.get('confirmPassword');
      const hasError = this.resetPasswordForm.errors?.['fieldsAreNotEquals'];
      return !(field?.touched && (!!field?.errors || hasError));
    }
    return FormUtils.isValidField(this.resetPasswordForm, fieldName);
  }
}

