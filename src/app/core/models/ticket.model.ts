import { UserRole } from './user.model';

/** Valores exactos de `#/components/schemas/TicketStatus`. */
export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';

/** Valores exactos de `#/components/schemas/Priority`. */
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';

export const TICKET_STATUSES: TicketStatus[] = ['open', 'in_progress', 'resolved', 'closed'];
export const TICKET_PRIORITIES: TicketPriority[] = ['low', 'medium', 'high', 'urgent'];

export const STATUS_LABELS: Record<TicketStatus, string> = {
  open: 'Abierto',
  in_progress: 'En proceso',
  resolved: 'Resuelto',
  closed: 'Cerrado'
};

export const PRIORITY_LABELS: Record<TicketPriority, string> = {
  low: 'Baja',
  medium: 'Media',
  high: 'Alta',
  urgent: 'Urgente'
};

/**
 * `createdBy` y `assignedTo` llegan como IDs de usuario (strings), no como
 * objetos anidados. Para mostrar nombres hay que resolverlos contra /api/users,
 * endpoint que sólo puede consultar un admin.
 */
export interface Ticket {
  id: string;
  title: string;
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
  createdBy: string;
  assignedTo: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TicketComment {
  id: string;
  ticketId: string;
  authorId: string;
  body: string;
  createdAt: string;
  author: {
    id: string;
    name: string;
    role: UserRole;
  } | null;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/** GET /api/tickets → { data, meta } */
export interface TicketListResponse {
  data: Ticket[];
  meta: PaginationMeta;
}

/** GET/POST/PATCH de un ticket → { data } */
export interface TicketResponse {
  data: Ticket;
}

/** GET /api/tickets/:id/comments → { data, total } */
export interface CommentListResponse {
  data: TicketComment[];
  total: number;
}

export interface CommentResponse {
  data: TicketComment;
}

export interface TicketFilters {
  status?: TicketStatus | '';
  priority?: TicketPriority | '';
  page?: number;
  /** La API rechaza limit > 50. */
  limit?: number;
}

export interface CreateTicketRequest {
  title: string;
  description: string;
  priority?: TicketPriority;
}

/**
 * Campos aceptados por PATCH /api/tickets/:id. Qué subconjunto puede enviar
 * cada rol lo decide `ticketPermissions`.
 */
export interface UpdateTicketRequest {
  title?: string;
  description?: string;
  priority?: TicketPriority;
  status?: TicketStatus;
}
