import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { TicketService } from '../../services/ticket.service';
import { Ticket, TicketFilterParams, TicketPriority, TicketStatus } from '../../interfaces/ticket.interface';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-ticket-list',
  templateUrl: './ticket-list.component.html',
  styleUrls: ['./ticket-list.component.scss']
})
export class TicketListComponent implements OnInit {
  private readonly ticketService = inject(TicketService);
  private readonly authService = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);

  tickets = signal<Ticket[]>([]);
  isLoading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  showCreateModal = signal<boolean>(false);

  currentPage = signal<number>(1);
  pageSize = signal<number>(10);
  totalTickets = signal<number>(0);
  totalPages = signal<number>(1);

  currentUserRole = this.authService.currentUser()?.role;

  filterForm: FormGroup = this.fb.group({
    status: [''],
    priority: [''],
    search: ['']
  });

  ngOnInit(): void {
    this.loadTickets();
  }

  loadTickets(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    const values = this.filterForm.value;
    const filters: TicketFilterParams = {
      page: this.currentPage(),
      limit: this.pageSize(),
      status: values.status || undefined,
      priority: values.priority || undefined,
      search: values.search || undefined
    };

    this.ticketService.getTickets(filters).subscribe({
      next: (res) => {
        this.tickets.set(res.data);
        this.totalTickets.set(res.total);
        this.totalPages.set(res.totalPages);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(err?.error?.message || 'Error al cargar los tickets.');
        this.isLoading.set(false);
      }
    });
  }

  viewDetail(ticketId: string | number): void {
    this.router.navigate(['/tickets', ticketId]);
  }

  onModalClosed(shouldReload: boolean): void {
    this.showCreateModal.set(false);
    if (shouldReload) {
      this.loadTickets();
    }
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      this.loadTickets();
    }
  }

  getStatusBadge(status: TicketStatus): string {
    const classes: Record<TicketStatus, string> = {
      'Abierto': 'status-open',
      'En Proceso': 'status-process',
      'Resuelto': 'status-resolved',
      'Cerrado': 'status-closed'
    };
    return classes[status] || '';
  }

  getPriorityBadge(priority: TicketPriority): string {
    const classes: Record<TicketPriority, string> = {
      'Baja': 'priority-low',
      'Media': 'priority-medium',
      'Alta': 'priority-high',
      'Urgente': 'priority-urgent'
    };
    return classes[priority] || '';
  }
}