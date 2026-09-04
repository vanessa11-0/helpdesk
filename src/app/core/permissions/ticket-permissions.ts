import { Ticket, UpdateTicketRequest, UserRole } from '@core/models';

export type EditableTicketField = keyof UpdateTicketRequest;

/**
 * Reglas de negocio de la API, replicadas en el front para decidir qué se
 * muestra. Son una guía de interfaz, no un control de seguridad: el servidor
 * vuelve a validarlas y responde 403 si el rol no corresponde.
 */

/** POST /api/tickets está permitido a admin y client; los agentes no crean. */
export function canCreateTicket(role: UserRole | null): boolean {
  return role === 'admin' || role === 'client';
}

/** PATCH /api/tickets/:id: admin sobre cualquiera, agent sólo sobre los suyos. */
export function canUpdateTicket(
  role: UserRole | null,
  ticket: Ticket | null,
  userId: string | null
): boolean {
  if (!ticket) {
    return false;
  }
  if (role === 'admin') {
    return true;
  }
  if (role === 'agent') {
    return !!userId && ticket.assignedTo === userId;
  }
  return false;
}

/**
 * Campos que el formulario de edición debe mostrar según el rol:
 * el admin edita el ticket completo y el agente sólo prioridad y estado.
 */
export function editableTicketFields(role: UserRole | null): EditableTicketField[] {
  if (role === 'admin') {
    return ['title', 'description', 'priority', 'status'];
  }
  if (role === 'agent') {
    return ['priority', 'status'];
  }
  return [];
}

/** POST /api/tickets/:id/assign y DELETE /api/tickets/:id son sólo de admin. */
export function canAssignTicket(role: UserRole | null): boolean {
  return role === 'admin';
}

export function canDeleteTicket(role: UserRole | null): boolean {
  return role === 'admin';
}

/** No se puede comentar un ticket cerrado (la API responde 400). */
export function canComment(ticket: Ticket | null): boolean {
  return !!ticket && ticket.status !== 'closed';
}

export function canManageUsers(role: UserRole | null): boolean {
  return role === 'admin';
}
