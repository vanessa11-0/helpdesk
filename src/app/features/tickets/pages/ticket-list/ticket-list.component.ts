import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TicketsService } from '../../../../core/services/tickets.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { Ticket, TicketStatus, TicketPriority, TicketFilter } from '../../../../interfaces/ticket.interface';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-ticket-list',
  templateUrl: './ticket-list.component.html',

})
export class TicketListComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly ticketsService = inject(TicketsService);
  readonly authService = inject(AuthService);

  readonly tickets = signal<Ticket[]>([]);
  readonly isLoading = signal<boolean>(true);
  readonly totalItems = signal<number>(0);
  readonly totalPages = signal<number>(1);
  readonly currentPage = signal<number>(1);

  readonly filterForm: FormGroup = this.fb.group({
    search: [''],
    status: [''],
    priority: ['']
  });

  ngOnInit(): void {
    this.fetchTickets();

    // Escuchar cambios de filtros con debounce para evitar llamadas excesivas a la API
    this.filterForm.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(() => {
        this.currentPage.set(1);
        this.fetchTickets();
      });
  }

  fetchTickets(): void {
    this.isLoading.set(true);
    const formValues = this.filterForm.value;

    const queryFilters: TicketFilter = {
      search: formValues.search,
      status: formValues.status,
      priority: formValues.priority,
      page: this.currentPage(),
      limit: 10
    };

    this.ticketsService.getTickets(queryFilters).subscribe({
      next: (res) => {
        this.tickets.set(res.data);
        this.totalItems.set(res.total);
        this.totalPages.set(res.totalPages);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  changePage(newPage: number): void {
    if (newPage >= 1 && newPage <= this.totalPages()) {
      this.currentPage.set(newPage);
      this.fetchTickets();
    }
  }

  getStatusBadgeClass(status: TicketStatus): string {
    switch (status) {
      case 'OPEN': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'IN_PROGRESS': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'RESOLVED': return 'bg-green-100 text-green-700 border-green-200';
      case 'CLOSED': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-gray-100 text-gray-600';
    }
  }

  getPriorityBadgeClass(priority: TicketPriority): string {
    switch (priority) {
      case 'LOW': return 'bg-gray-100 text-gray-600';
      case 'MEDIUM': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'HIGH': return 'bg-orange-50 text-orange-600 border-orange-100';
      case 'URGENT': return 'bg-red-50 text-red-600 border-red-100 font-semibold';
      default: return 'bg-gray-100 text-gray-600';
    }
  }
}