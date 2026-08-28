import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TicketsService } from '../../../../core/services/tickets.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { Ticket, TicketStatus, TicketPriority } from '../../../../interfaces/ticket.interface';

interface TimelineComment {
  id: string;
  authorName: string;
  authorRole: string;
  content: string;
  createdAt: string;
  isInternal?: boolean;
}

@Component({
  selector: 'app-ticket-detail',
  templateUrl: './ticket-detail.component.html',

})
export class TicketDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly ticketsService = inject(TicketsService);
  readonly authService = inject(AuthService);

  readonly ticket = signal<Ticket | null>(null);
  readonly isLoading = signal<boolean>(true);
  readonly isSubmittingComment = signal<boolean>(false);
  readonly comments = signal<TimelineComment[]>([]);

  readonly commentForm: FormGroup = this.fb.group({
    content: ['', [Validators.required, Validators.minLength(3)]]
  });

  ngOnInit(): void {
    const ticketId = this.route.snapshot.paramMap.get('id');
    if (ticketId) {
      this.loadTicketDetails(ticketId);
    }
  }

  private loadTicketDetails(id: string): void {
    this.isLoading.set(true);

    // Simulación de respuesta de detalle de ticket e historial
    setTimeout(() => {
      this.ticket.set({
        id,
        title: 'Error de acceso al módulo de reportes',
        description: 'Al intentar exportar el reporte mensual en formato PDF, el sistema muestra un error 500 y cierra la sesión activa.',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        createdBy: { id: '1', fullName: 'Carlos Mendoza', email: 'carlos@ejemplo.com', role: 'CLIENT' },
        assignedTo: { id: '2', fullName: 'Ana Gómez', email: 'ana@ejemplo.com', role: 'AGENT' },
        createdAt: '2026-08-27T10:30:00Z',
        updatedAt: '2026-08-28T08:15:00Z'
      });

      this.comments.set([
        {
          id: 'c1',
          authorName: 'Carlos Mendoza',
          authorRole: 'CLIENT',
          content: 'He adjuntado las capturas del error en el reporte.',
          createdAt: '2026-08-27T10:35:00Z'
        },
        {
          id: 'c2',
          authorName: 'Ana Gómez',
          authorRole: 'AGENT',
          content: 'Estamos revisando los logs del servidor para identificar la falla en la generación del PDF.',
          createdAt: '2026-08-28T08:15:00Z'
        }
      ]);

      this.isLoading.set(false);
    }, 600);
  }

  onAddComment(): void {
    if (this.commentForm.invalid) return;

    this.isSubmittingComment.set(true);
    const content = this.commentForm.value.content;
    const currentUser = this.authService.currentUser();

    setTimeout(() => {
      const newComment: TimelineComment = {
        id: `c_${Date.now()}`,
        authorName: currentUser?.fullName || 'Usuario',
        authorRole: currentUser?.role || 'CLIENT',
        content,
        createdAt: new Date().toISOString()
      };

      this.comments.update(prev => [...prev, newComment]);
      this.commentForm.reset();
      this.isSubmittingComment.set(false);
    }, 400);
  }

  updateStatus(newStatus: TicketStatus): void {
    if (this.ticket()) {
      this.ticket.update(t => t ? { ...t, status: newStatus } : null);
    }
  }

  getStatusBadgeClass(status?: TicketStatus): string {
    switch (status) {
      case 'OPEN': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'IN_PROGRESS': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'RESOLVED': return 'bg-green-100 text-green-700 border-green-200';
      case 'CLOSED': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-gray-100 text-gray-600';
    }
  }
}