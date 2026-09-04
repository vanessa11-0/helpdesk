import { UserRole } from '@core/models';

/**
 * Destino por defecto tras iniciar sesión. El agente entra directo a la cola
 * de tickets, que es donde trabaja; cliente y administrador arrancan en el
 * panel, que ya resume su situación.
 */
export function landingRouteFor(role: UserRole | null): string {
  return role === 'agent' ? '/tickets' : '/dashboard';
}
