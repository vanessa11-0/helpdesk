import { Component, computed, inject } from '@angular/core';
import { AuthService } from '@core/services/auth.service';
import { buildMenu } from '../../menu';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html'
})
export class SidebarComponent {
  private readonly auth = inject(AuthService);

  readonly menuItems = computed(() => buildMenu(this.auth.userRole()));
}
