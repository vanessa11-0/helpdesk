import { Component, computed, inject } from '@angular/core';
import { AuthService } from '@core/services/auth.service';
import { buildMenu } from '../../menu';

@Component({
  selector: 'app-dashboard-layout',
  templateUrl: './dashboard-layout.component.html'
})
export class DashboardLayoutComponent {
  private readonly auth = inject(AuthService);

  /** El mismo menú del sidebar, para la barra horizontal en pantallas chicas. */
  readonly menuItems = computed(() => buildMenu(this.auth.userRole()));
}
