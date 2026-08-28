import { Component, inject, computed } from '@angular/core';
import { AuthService } from '../../../core/auth/auth.service';

interface MenuItem {
  label: string;
  icon: string;
  route: string;
  roles: string[];
}

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',

})
export class SidebarComponent {
  private readonly authService = inject(AuthService);

  private readonly allMenuItems: MenuItem[] = [
    { label: 'Dashboard', icon: 'chart-pie', route: '/dashboard', roles: ['CLIENT', 'AGENT', 'ADMIN'] },
    { label: 'Mis Tickets', icon: 'ticket', route: '/tickets/my-tickets', roles: ['CLIENT'] },
    { label: 'Crear Ticket', icon: 'plus-circle', route: '/tickets/create', roles: ['CLIENT'] },
    { label: 'Tickets Asignados', icon: 'user-check', route: '/tickets/assigned', roles: ['AGENT'] },
    { label: 'Tickets Disponibles', icon: 'inbox', route: '/tickets/unassigned', roles: ['AGENT'] },
    { label: 'Todos los Tickets', icon: 'collection', route: '/tickets', roles: ['ADMIN'] },
    { label: 'Usuarios', icon: 'users', route: '/users', roles: ['ADMIN'] }
  ];

  readonly menuItems = computed(() => {
    const role = this.authService.userRole();
    if (!role) return [];
    return this.allMenuItems.filter(item => item.roles.includes(role));
  });
}