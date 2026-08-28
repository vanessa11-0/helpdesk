import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TicketService } from '../../services/ticket.service';
import { Ticket, TicketStatus } from '../../interfaces/ticket.interface';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-ticket-detail',
  templateUrl: './ticket-detail.component.html',
  styleUrls: ['./ticket-detail.component.scss']
})
export class TicketDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly ticketService = inject(TicketService);
  private readonly authService = inject(AuthService);

  ticket = signal<Ticket | null>(null);
  isLoading = signal<boolean>(true);
  errorMessage = signal<string | null>(null);

  newCommentText = signal<string>('');
  isPostingComment = signal<boolean>(false);

  currentUser = this.authService.currentUser();

  ngOnInit(): void {
    const ticketId = this.route.snapshot.paramMap.get('id');
    if (ticketId) {
      this.loadTicket(ticketId);
    }
  }

  loadTicket(id: string): void {
    this.isLoading.set(true);
    this.ticketService.getTicketById(id).subscribe({
      next: (data) => {
        this.ticket.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(err?.error?.message || 'No se pudo cargar la información del ticket.');
        this.isLoading.set(false);
      }
    });
  }

  onStatusChange(newStatus: TicketStatus): void {
    const currentTicket = this.ticket();
    if (!currentTicket) return;

    this.ticketService.updateStatus(currentTicket.id, newStatus).subscribe({
      next: (updatedTicket) => this.ticket.set(updatedTicket),
      error: (err) => alert(err?.error?.message || 'Error al cambiar el estado.')
    });
  }

  onAddComment(): void {
    const text = this.newCommentText().trim();
    const currentTicket = this.ticket();
    if (!text || !currentTicket) return;

    this.isPostingComment.set(true);
    this.ticketService.addComment(currentTicket.id, text).subscribe({
      next: (newComment) => {
        this.ticket.update((t) => t ? { ...t, comments: [...(t.comments || []), newComment] } : null);
        this.newCommentText.set('');
        this.isPostingComment.set(false);
      },
      error: (err) => {
        alert(err?.error?.message || 'Error al enviar el comentario.');
        this.isPostingComment.set(false);
      }
    });
  }
}