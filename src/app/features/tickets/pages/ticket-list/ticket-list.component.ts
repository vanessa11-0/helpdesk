import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import {
  PaginationMeta,
  TICKET_PRIORITIES,
  TICKET_STATUSES,
  Ticket,
  TicketFilters,
  TicketPriority,
  TicketStatus,
  User
} from '@core/models';
import { canCreateTicket } from '@core/permissions/ticket-permissions';
import { AuthService } from '@core/services/auth.service';
import { TicketService } from '@core/services/ticket.service';
import { UserService } from '@core/services/user.service';

/** Vista del agente sobre su bandeja; la API no ofrece este filtro. */
type AgentScope = 'all' | 'mine' | 'unassigned';

const PAGE_SIZE = 10;

@Component({
  selector: 'app-ticket-list',
  templateUrl: './ticket-list.component.html'
})
export class TicketListComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly ticketService = inject(TicketService);
  private readonly userService = inject(UserService);
  private readonly auth = inject(AuthService);

  readonly statuses = TICKET_STATUSES;
  readonly priorities = TICKET_PRIORITIES;

  readonly tickets = signal<Ticket[]>([]);
  readonly meta = signal<PaginationMeta>({ total: 0, page: 1, limit: PAGE_SIZE, totalPages: 1 });
  readonly isLoading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly agentScope = signal<AgentScope>('all');

  /** id → usuario, para mostrar nombres en lugar de `u_client1`. */
  private readonly directory = signal<Record<string, User>>({});

  readonly role = this.auth.userRole;
  readonly currentUserId = computed(() => this.auth.currentUser()?.id ?? null);
  readonly isAgent = computed(() => this.role() === 'agent');
  readonly isAdmin = computed(() => this.role() === 'admin');
  readonly canCreate = computed(() => canCreateTicket(this.role()));

  readonly filterForm = this.fb.nonNullable.group({
    status: [''],
    priority: ['']
  });

  /**
   * El filtro por asignación se aplica sobre la página ya recibida: la API
   * pagina en el servidor y no acepta un parámetro `assignedTo`.
   */
  readonly visibleTickets = computed(() => {
    const scope = this.agentScope();
    const all = this.tickets();
    if (!this.isAgent() || scope === 'all') {
      return all;
    }
    const me = this.currentUserId();
    return scope === 'mine'
      ? all.filter((t) => t.assignedTo === me)
      : all.filter((t) => t.assignedTo === null);
  });

  readonly pages = computed(() =>
    Array.from({ length: this.meta().totalPages }, (_, i) => i + 1)
  );

  ngOnInit(): void {
    // Sólo el admin puede consultar /api/users para resolver los nombres.
    this.userService.getDirectory(this.isAdmin()).subscribe({
      next: (dir) => this.directory.set(dir),
      error: () => this.directory.set({})
    });

    this.loadTickets(1);
  }

  applyFilters(): void {
    this.loadTickets(1);
  }

  clearFilters(): void {
    this.filterForm.reset({ status: '', priority: '' });
    this.agentScope.set('all');
    this.loadTickets(1);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.meta().totalPages && page !== this.meta().page) {
      this.loadTickets(page);
    }
  }

  setScope(scope: AgentScope): void {
    this.agentScope.set(scope);
  }

  /**
   * Sólo el admin puede resolver los IDs a nombres; para los demás roles se
   * muestra una etiqueta genérica en lugar de un identificador interno.
   */
  assignedLabel(assignedTo: string | null): string {
    if (!assignedTo) {
      return 'Sin asignar';
    }
    if (assignedTo === this.currentUserId()) {
      return 'Yo';
    }
    return this.directory()[assignedTo]?.name ?? 'Asignado a un agente';
  }

  private loadTickets(page: number): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    const { status, priority } = this.filterForm.getRawValue();
    const filters: TicketFilters = {
      status: status as TicketStatus | '',
      priority: priority as TicketPriority | '',
      page,
      limit: PAGE_SIZE
    };

    this.ticketService.getTickets(filters).subscribe({
      next: (res) => {
        this.tickets.set(res.data);
        this.meta.set(res.meta);
        this.isLoading.set(false);
      },
      error: (err: unknown) => {
        this.tickets.set([]);
        this.errorMessage.set(AuthService.describeError(err, 'No se pudieron cargar los tickets.'));
        this.isLoading.set(false);
      }
    });
  }
}
