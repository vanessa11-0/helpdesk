import { User } from '@core/models/user.model';

export type TicketStatus = 'Abierto' | 'En Proceso' | 'Resuelto' | 'Cerrado';
export type TicketPriority = 'Baja' | 'Media' | 'Alta' | 'Urgente';

export interface TicketComment {
  id: string | number;
  ticketId: string | number;
  author: User;
  message: string;
  createdAt: string;
}

export interface Ticket {
  id: string | number;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  client: User;
  assignedAgent?: User | null;
  comments?: TicketComment[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateTicketRequest {
  title: string;
  description: string;
  priority: TicketPriority;
}

export interface TicketFilterParams {
  status?: TicketStatus | '';
  priority?: TicketPriority | '';
  search?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedTicketsResponse {
  data: Ticket[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}