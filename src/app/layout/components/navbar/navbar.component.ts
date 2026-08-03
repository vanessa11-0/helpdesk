import { Component } from '@angular/core'
import { Router } from '@angular/router'
import { AuthService } from '../../../core/auth/services/auth.service'

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
  currentUser = this.authService.currentUser

  constructor (private authService: AuthService, private router: Router) {}

  onLogout (): void {
    this.authService.logout()
    this.router.navigate(['/auth/login'])
  }
}
