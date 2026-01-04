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
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    lastName: ['', [Validators.required, Validators.minLength(2)]],
    username: ['', [Validators.required, Validators.minLength(3), FormUtils.checkBlacklist]],
    email: ['', [Validators.required, Validators.pattern(FormUtils.emailPattern)]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]],
    roleId: ['', [Validators.required]] // GUID del rol (por defecto Resident)
  }, {
    validators: [FormUtils.compareFormFields('password', 'confirmPassword')]
  });

  constructor() {
    // Establecer roleId por defecto (Resident)
    // Nota: En producción, esto debería obtenerse del backend o de una lista de roles disponibles
    // Por ahora usamos un GUID hardcodeado que corresponde al rol "Resident" en el seed
    // En el futuro, deberíamos hacer una llamada a /api/roles para obtener los roles disponibles
    this.registerForm.patchValue({
      roleId: '00000000-0000-0000-0000-000000000000' // Placeholder - debería obtenerse dinámicamente
    });
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.errorMessage.set(null);
    this.isLoading.set(true);

    const { firstName, lastName, username, email, password, roleId } = this.registerForm.value;

    this.authService.register({ 
      firstName, 
      lastName, 
      username, 
      email, 
      password, 
      roleId 
    }).subscribe({
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
