import { UserRole } from '@core/models';

export interface MenuItem {
  label: string;
  route: string;
  /** `true` para que /tickets no quede marcado al estar en /tickets/create. */
  exact: boolean;
  roles: UserRole[];
}

/**
 * Cada entrada apunta a una ruta que existe de verdad en el router. Ocultar un
 * enlace es sólo comodidad de interfaz: quien acceda por URL sigue topándose
 * con authGuard, roleGuard y, en última instancia, con el 403 de la API.
 */
const MENU: MenuItem[] = [
  { label: 'Panel', route: '/dashboard', exact: true, roles: ['admin', 'agent', 'client'] },
  { label: 'Mis tickets', route: '/tickets', exact: true, roles: ['client'] },
  { label: 'Tickets', route: '/tickets', exact: true, roles: ['agent'] },
  { label: 'Todos los tickets', route: '/tickets', exact: true, roles: ['admin'] },
  { label: 'Nuevo ticket', route: '/tickets/create', exact: false, roles: ['admin', 'client'] },
  { label: 'Usuarios', route: '/users', exact: false, roles: ['admin'] }
];

export function buildMenu(role: UserRole | null): MenuItem[] {
  return role ? MENU.filter((item) => item.roles.includes(role)) : [];
}
