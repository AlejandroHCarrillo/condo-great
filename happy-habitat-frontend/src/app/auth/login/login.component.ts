import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LoggerService } from '../../services/logger.service';
import { FormUtils } from '../../utils/form-utils';
import { ShowFormErrorTemplateComponent } from '../../shared/show-form-error-template/show-form-error-template.component';
import { CommonModule } from '@angular/common';

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

  loginForm: FormGroup = this.fb.group({
    username: ['elgrandeahc', [Validators.required, Validators.minLength(3)]],
    password: ['abc123', [Validators.required, Validators.minLength(6)]]
  });

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      this.logger.debug('Login form validation failed', 'LoginComponent');
      return;
    }

    this.errorMessage.set(null);
    this.isLoading.set(true);

    const { username, password } = this.loginForm.value;
    this.logger.event('login_form_submitted', { username }, 'LoginComponent');

    this.authService.login({ username, password }).subscribe({
      next: () => {
        // Obtener la URL de retorno o redirigir a home
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/home';
        this.logger.info('Login successful, redirecting', 'LoginComponent', { returnUrl });
        this.router.navigate([returnUrl]);
      },
      error: (error) => {
        this.isLoading.set(false);
        const errorMsg = error?.error?.message || 'Error al iniciar sesión. Verifica tus credenciales.';
        this.errorMessage.set(errorMsg);
        this.logger.event('login_failed', { username, error: errorMsg }, 'LoginComponent');
      }
    });
  }
}
