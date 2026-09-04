import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { forkJoin } from 'rxjs';
import { STATUS_LABELS, TICKET_STATUSES, Ticket, TicketStatus } from '@core/models';
import { canCreateTicket } from '@core/permissions/ticket-permissions';
import { AuthService } from '@core/services/auth.service';
import { TicketService } from '@core/services/ticket.service';

interface MetricCard {
  status: TicketStatus;
  label: string;
  count: number;
  accent: string;
}

@Component({
  selector: 'app-dashboard-home',
  templateUrl: './dashboard-home.component.html'
})
export class DashboardHomeComponent implements OnInit {
  private readonly ticketService = inject(TicketService);
  private readonly auth = inject(AuthService);

  readonly user = this.auth.currentUser;
  readonly role = this.auth.userRole;
  readonly canCreate = computed(() => canCreateTicket(this.role()));

  readonly isLoading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly total = signal(0);
  readonly metrics = signal<MetricCard[]>([]);
  readonly recentTickets = signal<Ticket[]>([]);

  private readonly accents: Record<TicketStatus, string> = {
    open: 'border-l-blue-500',
    in_progress: 'border-l-amber-500',
    resolved: 'border-l-green-500',
    closed: 'border-l-gray-400'
  };

  readonly subtitle = computed(() => {
    switch (this.role()) {
      case 'admin':
        return 'Resumen de todos los tickets del sistema.';
      case 'agent':
        return 'Resumen de los tickets asignados a ti y de los que están sin asignar.';
      default:
        return 'Resumen de las solicitudes que has reportado.';
    }
  });

  ngOnInit(): void {
    this.loadMetrics();
  }

  /**
   * La API no expone un endpoint de métricas, así que los totales se derivan
   * de /api/tickets: una consulta por estado con `limit=1`, aprovechando que
   * `meta.total` viene con el conteo completo. Además, el propio backend ya
   * acota el conjunto al rol, así que los números salen correctos sin lógica
   * extra en el cliente.
   */
  private loadMetrics(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    forkJoin({
      recent: this.ticketService.getTickets({ page: 1, limit: 5 }),
      open: this.ticketService.getTickets({ status: 'open', limit: 1 }),
      in_progress: this.ticketService.getTickets({ status: 'in_progress', limit: 1 }),
      resolved: this.ticketService.getTickets({ status: 'resolved', limit: 1 }),
      closed: this.ticketService.getTickets({ status: 'closed', limit: 1 })
    }).subscribe({
      next: (res) => {
        this.total.set(res.recent.meta.total);
        this.recentTickets.set(res.recent.data);
        this.metrics.set(
          TICKET_STATUSES.map((status) => ({
            status,
            label: STATUS_LABELS[status],
            count: res[status].meta.total,
            accent: this.accents[status]
          }))
        );
        this.isLoading.set(false);
      },
      error: (err: unknown) => {
        this.isLoading.set(false);
        this.errorMessage.set(
          AuthService.describeError(err, 'No se pudieron cargar las métricas.')
        );
      }
    });
  }
}
