import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { environment } from '@env/environment';
import { User, UserRole } from '@core/models/user.model';
import {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  RefreshTokenRequest,
  RefreshTokenResponse
} from '../auth/interfaces/auth.interface';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/auth`;

  // Claves de Storage
  private readonly ACCESS_TOKEN_KEY = 'helpdesk_access_token';
  private readonly REFRESH_TOKEN_KEY = 'helpdesk_refresh_token';
  private readonly USER_KEY = 'helpdesk_user';

  // Signals para estado reactivo interno
  private readonly _currentUser = signal<User | null>(this.getStoredUser());
  private readonly _accessToken = signal<string | null>(this.getStoredAccessToken());

  // Public Readonly Signals
  readonly currentUser = this._currentUser.asReadonly();
  readonly isAuthenticated = computed(() => !!this._currentUser() && !!this._accessToken());
  readonly userRole = computed<UserRole | null>(() => this._currentUser()?.role ?? null);

  /**
   * Autentica al usuario en el sistema.
   */
  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap((response) => this.handleAuthSuccess(response)),
      catchError(this.handleError)
    );
  }

  /**
   * Registra un nuevo usuario en la plataforma.
   */
  register(userData: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, userData).pipe(
      tap((response) => this.handleAuthSuccess(response)),
      catchError(this.handleError)
    );
  }

  /**
   * Renueva el Access Token expirado usando el Refresh Token.
   */
  refreshToken(): Observable<RefreshTokenResponse> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      this.logout();
      return throwError(() => new Error('No refresh token available'));
    }

    const payload: RefreshTokenRequest = { refreshToken };

    return this.http.post<RefreshTokenResponse>(`${this.apiUrl}/refresh`, payload).pipe(
      tap((response) => {
        this.setAccessToken(response.accessToken);
        if (response.refreshToken) {
          this.setRefreshToken(response.refreshToken);
        }
      }),
      catchError((err) => {
        this.logout();
        return throwError(() => err);
      })
    );
  }

  /**
   * Cierra la sesión activa y limpia la persistencia local y los signals.
   */
  logout(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);

    this._currentUser.set(null);
    this._accessToken.set(null);
  }

  // Getters auxiliares para Interceptores y Guards
  getAccessToken(): string | null {
    return this._accessToken() || localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  getToken(): string | null {
    return this.getAccessToken();
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  // Métodos privados de persistencia y actualización de Signals
  private handleAuthSuccess(response: AuthResponse): void {
    this.setAccessToken(response.accessToken);
    this.setRefreshToken(response.refreshToken);
    this.setUser(response.user);
  }

  private setAccessToken(token: string): void {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, token);
    this._accessToken.set(token);
  }

  private setRefreshToken(token: string): void {
    localStorage.setItem(this.REFRESH_TOKEN_KEY, token);
  }

  private setUser(user: User): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this._currentUser.set(user);
  }

  private getStoredUser(): User | null {
    const userStr = localStorage.getItem(this.USER_KEY);
    if (!userStr) return null;
    try {
      return JSON.parse(userStr) as User;
    } catch {
      return null;
    }
  }

  private getStoredAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  private handleError(error: unknown): Observable<never> {
    return throwError(() => error);
  }
}