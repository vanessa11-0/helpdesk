import { Component, signal } from '@angular/core'
import { FormBuilder, FormGroup, Validators } from '@angular/forms'
import { Router } from '@angular/router'
import { AuthService } from '../../../../core/auth/services/auth.service'

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  registerForm: FormGroup
  isLoading = signal<boolean>(false)
  errorMessage = signal<string | null>(null)

  constructor (
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    })
  }

  onSubmit (): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched()
      return
    }

    this.isLoading.set(true)
    this.errorMessage.set(null)

    this.authService.register(this.registerForm.value).subscribe({
      next: () => {
        this.isLoading.set(false)
        this.router.navigate(['/dashboard'])
      },
      error: err => {
        this.isLoading.set(false)
        const message = err.error?.message || 'Error al completar el registro.'
        this.errorMessage.set(
          Array.isArray(message) ? message.join(', ') : message
        )
      }
    })
  }
  
  hasFieldError (field: string): boolean {
    const control = this.registerForm.get(field)
    return !!(control && control.invalid && (control.dirty || control.touched))
  }
}
