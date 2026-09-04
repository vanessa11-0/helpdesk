import { Component, inject, signal } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TICKET_PRIORITIES, TicketPriority } from '@core/models';
import { AuthService } from '@core/services/auth.service';
import { TicketService } from '@core/services/ticket.service';

@Component({
  selector: 'app-ticket-create',
  templateUrl: './ticket-create.component.html'
})
export class TicketCreateComponent {
  private readonly fb = inject(FormBuilder);
  private readonly tickets = inject(TicketService);
  private readonly router = inject(Router);

  readonly priorities = TICKET_PRIORITIES;
  readonly isSubmitting = signal(false);
  readonly errorMessage = signal<string | null>(null);

  /** Los mínimos replican los que valida la API (5 y 10 caracteres). */
  readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(120)]],
    description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(1000)]],
    priority: ['medium' as TicketPriority, [Validators.required]]
  });

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    this.tickets.createTicket(this.form.getRawValue()).subscribe({
      next: (ticket) => {
        this.isSubmitting.set(false);
        void this.router.navigate(['/tickets', ticket.id]);
      },
      error: (err: unknown) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(AuthService.describeError(err, 'No se pudo crear el ticket.'));
      }
    });
  }

  isInvalid(field: 'title' | 'description'): boolean {
    const control = this.form.controls[field];
    return control.invalid && (control.dirty || control.touched);
  }
}
