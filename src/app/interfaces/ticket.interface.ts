import { User } from '../core/models/user.model';

export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  createdBy: User;
  assignedTo?: User | null;
  createdAt: string;
  updatedAt: string;
}

export interface TicketFilter {
  search?: string;
  status?: TicketStatus | '';
  priority?: TicketPriority | '';
  page: number;
  limit: number;
}

export interface PaginatedTicketsResponse {
  data: Ticket[];
  total: number;
  page: number;
  totalPages: number;
}