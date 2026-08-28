import { Component, Output, EventEmitter, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TicketService } from '../../services/ticket.service';

@Component({
  selector: 'app-ticket-create-modal',
  templateUrl: './ticket-create-modal.component.html',
  styleUrls: ['./ticket-create-modal.component.scss']
})
export class TicketCreateModalComponent {
  private readonly fb = inject(FormBuilder);
  private readonly ticketService = inject(TicketService);

  @Output() closeModal = new EventEmitter<boolean>();

  isSubmitting = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  ticketForm: FormGroup = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(5)]],
    priority: ['Media', [Validators.required]],
    description: ['', [Validators.required, Validators.minLength(15)]]
  });

  onSubmit(): void {
    if (this.ticketForm.invalid) {
      this.ticketForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    this.ticketService.createTicket(this.ticketForm.value).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.closeModal.emit(true);
      },
      error: (err) => {
        this.errorMessage.set(err?.error?.message || 'Error al crear la solicitud.');
        this.isSubmitting.set(false);
      }
    });
  }

  onCancel(): void {
    this.closeModal.emit(false);
  }
}