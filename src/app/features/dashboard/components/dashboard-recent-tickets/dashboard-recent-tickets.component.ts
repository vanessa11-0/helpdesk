import { Component, inject } from '@angular/core';
import { TicketService } from '../../../tickets/services/ticket.service';
import { Ticket } from '../../../tickets/interfaces/ticket.interface';

@Component({
  selector: 'app-dashboard-recent-tickets',
  templateUrl: './dashboard-recent-tickets.component.html',
  styleUrls: ['./dashboard-recent-tickets.component.scss']
})
export class DashboardRecentTicketsComponent {
  private readonly ticketService = inject(TicketService);

  tickets: Ticket[] = [];
  isLoading = false;

  constructor() {
    this.ticketService.getTickets({ page: 1, limit: 5 }).subscribe({
      next: (response) => {
        this.tickets = response.data;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }
}
