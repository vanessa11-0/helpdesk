import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TicketService } from '../../services/ticket.service';
import { CreateTicketRequest } from '../../interfaces/ticket.interface';

@Component({
  selector: 'app-ticket-create',
  templateUrl: './ticket-create.component.html',
  styleUrls: ['./ticket-create.component.scss']
})
export class TicketCreateComponent {
  private readonly fb = inject(FormBuilder);
  private readonly ticketService = inject(TicketService);
  private readonly router = inject(Router);

  isSubmitting = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  ticketForm: FormGroup = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(100)]],
    priority: ['medium', [Validators.required]],
    description: ['', [Validators.required, Validators.minLength(15), Validators.maxLength(1000)]]
  });

  onSubmit(): void {
    if (this.ticketForm.invalid) {
      this.ticketForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    const newTicket: CreateTicketRequest = this.ticketForm.value;

    this.ticketService.createTicket(newTicket).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.router.navigate(['/tickets']);
      },
      error: (err) => {
        this.errorMessage.set(err?.error?.message || 'Error al intentar crear el ticket. Intente nuevamente.');
        this.isSubmitting.set(false);
      }
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.ticketForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }
}