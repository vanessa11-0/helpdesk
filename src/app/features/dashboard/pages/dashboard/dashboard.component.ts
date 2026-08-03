import { Component } from '@angular/core'
import { AuthService } from '../../../../core/auth/services/auth.service'

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  currentUser = this.authService.currentUser
  currentRole = this.authService.currentRole

  constructor (private authService: AuthService) {}
}
