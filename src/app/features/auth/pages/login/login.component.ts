import { Component, inject, signal } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { landingRouteFor } from '../../landing-route';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html'
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  /** Aviso cuando el interceptor devolvió al login por refresh token vencido. */
  readonly sessionExpired = this.route.snapshot.queryParams['sessionExpired'] === 'true';

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  /** Se valida en el cliente antes de gastar una llamada a la API. */
  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.auth.login(this.form.getRawValue()).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] as string | undefined;
        void this.router.navigateByUrl(returnUrl || landingRouteFor(res.user.role));
      },
      error: (err: unknown) => {
        this.isLoading.set(false);
        this.errorMessage.set(
          AuthService.describeError(err, 'Correo o contraseña incorrectos.')
        );
      }
    });
  }

  isInvalid(field: 'email' | 'password'): boolean {
    const control = this.form.controls[field];
    return control.invalid && (control.dirty || control.touched);
  }
}
