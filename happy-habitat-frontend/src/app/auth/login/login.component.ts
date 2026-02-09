import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LoggerService } from '../../services/logger.service';
import { FormUtils } from '../../utils/form-utils';
import { ShowFormErrorTemplateComponent } from '../../shared/show-form-error-template/show-form-error-template.component';
import { CommonModule } from '@angular/common';
import { RoleDto } from '../../shared/interfaces/auth.interface';

@Component({
  selector: 'hh-login',
  imports: [ReactiveFormsModule, ShowFormErrorTemplateComponent, CommonModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private logger = inject(LoggerService);

  formUtils = FormUtils;
  errorMessage = signal<string | null>(null);
  isLoading = signal<boolean>(false);
  showRoleSelection = signal<boolean>(false);
  availableRoles = signal<RoleDto[]>([]);
  selectedRole = signal<string>('');

  loginForm: FormGroup = this.fb.group({
    username: ['elgrandeahc', [Validators.required, Validators.minLength(3)]],
    password: ['abc123', [Validators.required, Validators.minLength(6)]]
  });

  roleSelectionForm: FormGroup = this.fb.group({
    role: ['', [Validators.required]]
  });

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      this.logger.debug('Login form validation failed', 'LoginComponent');
      return;
    }

    this.errorMessage.set(null);
    this.isLoading.set(true);
    this.showRoleSelection.set(false);

    const { username, password } = this.loginForm.value;
    this.logger.event('login_form_submitted', { username }, 'LoginComponent');

    this.authService.login({ username, password }).subscribe({
      next: () => {
        // Obtener la URL de retorno o redirigir a home
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/home';
        this.logger.info('Login successful, redirecting', 'LoginComponent', { returnUrl });
        this.showRoleSelection.set(true);
        this.isLoading.set(false);

        // this.router.navigate([returnUrl]);
      },
      error: (error) => {
        // Verificar si el error es porque necesita selección de rol
        if (error?.needsRoleSelection) {
          this.isLoading.set(false);
          this.showRoleSelection.set(true);
          this.availableRoles.set(error.roleDetails || []);
          
          // Si hay roles disponibles, seleccionar el primero por defecto
          if (error.roles && error.roles.length > 0) {
            this.selectedRole.set(error.roles[0]);
            this.roleSelectionForm.patchValue({ role: error.roles[0] });
          }
          
          this.logger.info('User has multiple roles, showing role selector', 'LoginComponent', { 
            rolesCount: error.roles?.length 
          });
        } else {
          this.isLoading.set(false);
          const errorMsg = error?.error?.message || 'Error al iniciar sesión. Verifica tus credenciales.';
          this.errorMessage.set(errorMsg);
          this.logger.event('login_failed', { username, error: errorMsg }, 'LoginComponent');
        }
      }
    });
  }

  onRoleSelected(): void {
    const selectedRoleCode = this.roleSelectionForm.get('role')?.value;
    if (!selectedRoleCode) {
      return;
    }

    this.selectedRole.set(selectedRoleCode);
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.authService.completeLoginWithRole(selectedRoleCode).subscribe({
      next: () => {
        // Obtener la URL de retorno o redirigir a home
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/home';
        this.logger.info('Login completed with selected role, redirecting', 'LoginComponent', { 
          returnUrl,
          selectedRole: selectedRoleCode 
        });
        this.router.navigate([returnUrl]);
      },
      error: (error) => {
        this.isLoading.set(false);
        const errorMsg = error?.message || 'Error al completar el inicio de sesión.';
        this.errorMessage.set(errorMsg);
        this.logger.event('role_selection_failed', { selectedRole: selectedRoleCode, error: errorMsg }, 'LoginComponent');
      }
    });
  }
}
