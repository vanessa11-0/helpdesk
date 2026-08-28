import { Injectable, signal, computed, inject } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { 
  LoginRequest, 
  RegisterRequest, 
  AuthResponse, 
  RefreshTokenResponse 
} from '../../interfaces/auth.interface';
import { User, UserRole } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly router = inject(Router);

  private readonly ACCESS_TOKEN_KEY = 'helpdesk_access_token';
  private readonly REFRESH_TOKEN_KEY = 'helpdesk_refresh_token';

  // State mediante Angular Signals
  readonly currentUser = signal<User | null>(this.getUserFromStorage());
  readonly isAuthenticated = computed(() => !!this.currentUser());
  readonly userRole = computed<UserRole | null>(() => this.currentUser()?.role ?? null);

  constructor() {}

  /**
   * Simula el inicio de sesión sin backend
   */
  login(credentials: LoginRequest): Observable<AuthResponse> {
    const mockUser: User = {
      id: 'usr_1',
      fullName: 'Usuario Pruebas',
      email: credentials.email,
      role: 'CLIENT'
    };

    const mockResponse: AuthResponse = {
      accessToken: 'fake_access_token_123',
      refreshToken: 'fake_refresh_token_123',
      user: mockUser
    };

    return of(mockResponse).pipe(
      delay(800), // Simula latencia de red (800ms)
      tap(response => this.handleAuthSuccess(response))
    );
  }

  /**
   * Simula el registro de usuario sin backend
   */
  register(data: RegisterRequest): Observable<AuthResponse> {
    const mockUser: User = {
      id: `usr_${Date.now()}`,
      fullName: data.fullName,
      email: data.email,
      role: 'CLIENT'
    };

    const mockResponse: AuthResponse = {
      accessToken: 'fake_access_token_123',
      refreshToken: 'fake_refresh_token_123',
      user: mockUser
    };

    return of(mockResponse).pipe(
      delay(800), // Simula latencia de red (800ms)
      tap(response => this.handleAuthSuccess(response))
    );
  }

  /**
   * Simula la renovación del token de acceso
   */
  refreshToken(): Observable<RefreshTokenResponse> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      this.logout();
      return throwError(() => new Error('No refresh token available'));
    }

    return of({
      accessToken: 'new_fake_access_token_456',
      refreshToken: 'new_fake_refresh_token_456'
    }).pipe(
      delay(500),
      tap(response => {
        this.setAccessToken(response.accessToken);
        if (response.refreshToken) {
          this.setRefreshToken(response.refreshToken);
        }
      })
    );
  }

  /**
   * Cierra la sesión activa y limpia el almacenamiento
   */
  logout(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem('helpdesk_user');
    this.currentUser.set(null);
    this.router.navigate(['/auth/login']);
  }

  getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  private setAccessToken(token: string): void {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, token);
  }

  private setRefreshToken(token: string): void {
    localStorage.setItem(this.REFRESH_TOKEN_KEY, token);
  }

  private handleAuthSuccess(response: AuthResponse): void {
    this.setAccessToken(response.accessToken);
    this.setRefreshToken(response.refreshToken);
    localStorage.setItem('helpdesk_user', JSON.stringify(response.user));
    this.currentUser.set(response.user);
  }

  private getUserFromStorage(): User | null {
    const userRaw = localStorage.getItem('helpdesk_user');
    if (!userRaw) return null;
    try {
      return JSON.parse(userRaw) as User;
    } catch {
      return null;
    }
  }
}