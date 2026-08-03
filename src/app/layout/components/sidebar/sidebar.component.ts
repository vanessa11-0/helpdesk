import { Component, computed } from '@angular/core'
import { AuthService } from '../../../core/auth/services/auth.service'
import { UserRole } from '../../../models/user.model'

interface MenuItem {
  label: string
  icon: string
  routerLink: string
  roles: UserRole[]
}

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  currentRole = this.authService.currentRole

  private menuItems: MenuItem[] = [
    {
      label: 'Dashboard',
      icon: '📊',
      routerLink: '/dashboard',
      roles: [UserRole.CLIENT, UserRole.AGENT, UserRole.ADMIN]
    },
    {
      label: 'Mis Tickets',
      icon: '🎫',
      routerLink: '/tickets',
      roles: [UserRole.CLIENT, UserRole.AGENT, UserRole.ADMIN]
    },
    {
      label: 'Gestión de Usuarios',
      icon: '👥',
      routerLink: '/users',
      roles: [UserRole.ADMIN]
    }
  ]
  filteredMenuItems = computed(() => {
    const role = this.currentRole()
    if (!role) return []
    return this.menuItems.filter(item => item.roles.includes(role))
  })

  constructor (private authService: AuthService) {}
}
