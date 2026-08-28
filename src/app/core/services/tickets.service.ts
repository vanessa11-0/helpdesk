import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Ticket, TicketFilter, PaginatedTicketsResponse } from '../../interfaces/ticket.interface';

@Injectable({
  providedIn: 'root'
})
export class TicketsService {
  private readonly http = inject(HttpClient);
  private readonly API_URL = '/api/v1/tickets';

  getTickets(filters: TicketFilter): Observable<PaginatedTicketsResponse> {
    let params = new HttpParams()
      .set('page', filters.page.toString())
      .set('limit', filters.limit.toString());

    if (filters.search) params = params.set('search', filters.search);
    if (filters.status) params = params.set('status', filters.status);
    if (filters.priority) params = params.set('priority', filters.priority);

    return this.http.get<PaginatedTicketsResponse>(this.API_URL, { params });
  }

  getTicketById(id: string): Observable<Ticket> {
    return this.http.get<Ticket>(`${this.API_URL}/${id}`);
  }
}