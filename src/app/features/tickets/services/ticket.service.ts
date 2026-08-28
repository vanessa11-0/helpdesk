import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { 
  Ticket, 
  CreateTicketRequest, 
  TicketFilterParams, 
  PaginatedTicketsResponse,
  TicketComment,
  TicketStatus
} from '../interfaces/ticket.interface';

@Injectable({
  providedIn: 'root'
})
export class TicketService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/tickets`;

  getTickets(filters: TicketFilterParams = {}): Observable<PaginatedTicketsResponse> {
    let params = new HttpParams();

    if (filters.status) params = params.set('status', filters.status);
    if (filters.priority) params = params.set('priority', filters.priority);
    if (filters.search) params = params.set('search', filters.search);
    if (filters.page) params = params.set('page', filters.page.toString());
    if (filters.limit) params = params.set('limit', filters.limit.toString());

    return this.http.get<PaginatedTicketsResponse>(this.apiUrl, { params });
  }

  getTicketById(id: string | number): Observable<Ticket> {
    return this.http.get<Ticket>(`${this.apiUrl}/${id}`);
  }

  createTicket(ticketData: CreateTicketRequest): Observable<Ticket> {
    return this.http.post<Ticket>(this.apiUrl, ticketData);
  }

  updateStatus(ticketId: string | number, status: TicketStatus): Observable<Ticket> {
    return this.http.patch<Ticket>(`${this.apiUrl}/${ticketId}/status`, { status });
  }

  assignAgent(ticketId: string | number, agentId: string | number): Observable<Ticket> {
    return this.http.patch<Ticket>(`${this.apiUrl}/${ticketId}/assign`, { agentId });
  }

  addComment(ticketId: string | number, message: string): Observable<TicketComment> {
    return this.http.post<TicketComment>(`${this.apiUrl}/${ticketId}/comments`, { message });
  }
}