import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TicketsService } from '../../../../core/services/tickets.service';

@Component({
  selector: 'app-ticket-create',
  templateUrl: './ticket-create.component.html',

})
export class TicketCreateComponent {
  private readonly fb = inject(FormBuilder);
  private readonly ticketsService = inject(TicketsService);
  private readonly router = inject(Router);

  readonly isSubmitting = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);

  readonly ticketForm: FormGroup = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(100)]],
    category: ['', [Validators.required]],
    priority: ['MEDIUM', [Validators.required]],
    description: ['', [Validators.required, Validators.minLength(20), Validators.maxLength(1000)]]
  });

  // Helpers para acceder a los controles desde el HTML
  get f() {
    return this.ticketForm.controls;
  }

  onSubmit(): void {
    if (this.ticketForm.invalid) {
      this.ticketForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    const formData = this.ticketForm.value;

    // Simulación de envío de datos al backend (Sustituir por integración real con TicketsService)
    setTimeout(() => {
      this.isSubmitting.set(false);
      // Redirigir al listado tras creación exitosa
      this.router.navigate(['/tickets']);
    }, 800);
  }
}