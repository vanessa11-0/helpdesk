import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '@env/environment';
import {
  CommentListResponse,
  CommentResponse,
  CreateTicketRequest,
  Ticket,
  TicketComment,
  TicketFilters,
  TicketListResponse,
  TicketResponse,
  UpdateTicketRequest
} from '@core/models';

@Injectable({ providedIn: 'root' })
export class TicketService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/tickets`;

  /**
   * La API ya filtra por rol: admin ve todo, agent ve los suyos más los no
   * asignados, y client sólo los que creó. El front no necesita mandar nada
   * extra para eso, únicamente estado, prioridad y paginación.
   */
  getTickets(filters: TicketFilters = {}): Observable<TicketListResponse> {
    let params = new HttpParams();
    if (filters.status) {
      params = params.set('status', filters.status);
    }
    if (filters.priority) {
      params = params.set('priority', filters.priority);
    }
    if (filters.page) {
      params = params.set('page', filters.page);
    }
    if (filters.limit) {
      params = params.set('limit', filters.limit);
    }

    return this.http.get<TicketListResponse>(this.apiUrl, { params });
  }

  getTicketById(id: string): Observable<Ticket> {
    return this.http
      .get<TicketResponse>(`${this.apiUrl}/${id}`)
      .pipe(map((res) => res.data));
  }

  createTicket(payload: CreateTicketRequest): Observable<Ticket> {
    return this.http
      .post<TicketResponse>(this.apiUrl, payload)
      .pipe(map((res) => res.data));
  }

  updateTicket(id: string, changes: UpdateTicketRequest): Observable<Ticket> {
    return this.http
      .patch<TicketResponse>(`${this.apiUrl}/${id}`, changes)
      .pipe(map((res) => res.data));
  }

  deleteTicket(id: string): Observable<unknown> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  /** Sólo admin. Si el ticket estaba en `open`, la API lo pasa a `in_progress`. */
  assignTicket(id: string, agentId: string): Observable<Ticket> {
    return this.http
      .post<TicketResponse>(`${this.apiUrl}/${id}/assign`, { agentId })
      .pipe(map((res) => res.data));
  }

  getComments(ticketId: string): Observable<TicketComment[]> {
    return this.http
      .get<CommentListResponse>(`${this.apiUrl}/${ticketId}/comments`)
      .pipe(map((res) => res.data));
  }

  /** El campo del cuerpo se llama `body`, no `message`. */
  addComment(ticketId: string, body: string): Observable<TicketComment> {
    return this.http
      .post<CommentResponse>(`${this.apiUrl}/${ticketId}/comments`, { body })
      .pipe(map((res) => res.data));
  }
}
