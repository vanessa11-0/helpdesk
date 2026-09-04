import { Component, inject, signal } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { landingRouteFor } from '../../landing-route';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html'
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  /**
   * El campo se llama `name` porque así lo espera POST /api/auth/register.
   * El rol no se envía: la API crea toda cuenta nueva como `client`.
   */
  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.auth.register(this.form.getRawValue()).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        void this.router.navigateByUrl(landingRouteFor(res.user.role));
      },
      error: (err: unknown) => {
        this.isLoading.set(false);
        this.errorMessage.set(
          AuthService.describeError(err, 'No se pudo completar el registro.')
        );
      }
    });
  }

  isInvalid(field: 'name' | 'email' | 'password'): boolean {
    const control = this.form.controls[field];
    return control.invalid && (control.dirty || control.touched);
  }
}
