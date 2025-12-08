import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FormUtils } from '../../utils/form-utils';
import { ShowFormErrorTemplateComponent } from '../../shared/show-form-error-template/show-form-error-template.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'hh-register',
  imports: [ReactiveFormsModule, ShowFormErrorTemplateComponent, CommonModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  formUtils = FormUtils;
  errorMessage = signal<string | null>(null);
  isLoading = signal<boolean>(false);

  registerForm: FormGroup = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(3), FormUtils.checkBlacklist]],
    email: ['', [Validators.required, Validators.pattern(FormUtils.emailPattern)]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]],
    fullname: ['', [Validators.required, Validators.minLength(3)]],
    phone: ['']
  }, {
    validators: [FormUtils.compareFormFields('password', 'confirmPassword')]
  });

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.errorMessage.set(null);
    this.isLoading.set(true);

    const { username, email, password, fullname, phone } = this.registerForm.value;

    this.authService.register({ username, email, password, fullname, phone }).subscribe({
      next: () => {
        // Redirigir al home después del registro exitoso
        this.router.navigate(['/home']);
      },
      error: (error) => {
        this.isLoading.set(false);
        this.errorMessage.set(
          error?.error?.message || 'Error al registrar usuario. Intenta nuevamente.'
        );
      }
    });
  }

  getFieldError(fieldName: string): string | null {
    if (fieldName === 'confirmPassword' && this.registerForm.errors?.['fieldsAreNotEquals']) {
      return 'Las contraseñas no coinciden';
    }
    return FormUtils.getFieldError(this.registerForm, fieldName);
  }

  isValidField(fieldName: string): boolean | null {
    if (fieldName === 'confirmPassword') {
      const field = this.registerForm.get('confirmPassword');
      const hasError = this.registerForm.errors?.['fieldsAreNotEquals'];
      return !(field?.touched && (!!field?.errors || hasError));
    }
    return FormUtils.isValidField(this.registerForm, fieldName);
  }
}
