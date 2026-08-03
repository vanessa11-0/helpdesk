import { Injectable, signal, computed, inject } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable, tap, catchError, throwError, of } from 'rxjs'
import { environment } from '../../../../environments/environment'
import { User, UserRole } from '../../../models/user.model'
import {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  AuthTokens
} from '../../../models/auth.model'

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient)
  private readonly API_URL = `${environment.apiUrl}/auth`

  private readonly TOKEN_KEY = 'helpdesk_access_token'
  private readonly REFRESH_TOKEN_KEY = 'helpdesk_refresh_token'
  private readonly USER_KEY = 'helpdesk_user'

  private readonly currentUserSignal = signal<User | null>(this.getStoredUser())

  readonly currentUser = this.currentUserSignal.asReadonly()
  readonly isAuthenticated = computed(() => !!this.currentUserSignal())
  readonly currentRole = computed(() => this.currentUserSignal()?.role ?? null)

  constructor () {}

  login (credentials: LoginRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.API_URL}/login`, credentials)
      .pipe(
        tap(response => this.setSession(response)),
        catchError(error => throwError(() => error))
      )
  }

  register (data: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/register`, data).pipe(
      tap(response => this.setSession(response)),
      catchError(error => throwError(() => error))
    )
  }

  refreshToken (): Observable<AuthTokens> {
    const refreshToken = this.getRefreshToken()
    if (!refreshToken) {
      this.logout()
      return throwError(() => new Error('No refresh token available'))
    }

    return this.http
      .post<AuthTokens>(`${this.API_URL}/refresh`, { refreshToken })
      .pipe(
        tap(tokens => {
          this.setAccessToken(tokens.accessToken)
          if (tokens.refreshToken) {
            this.setRefreshToken(tokens.refreshToken)
          }
        }),
        catchError(error => {
          this.logout()
          return throwError(() => error)
        })
      )
  }

  logout (): void {
    localStorage.removeItem(this.TOKEN_KEY)
    localStorage.removeItem(this.REFRESH_TOKEN_KEY)
    localStorage.removeItem(this.USER_KEY)
    this.currentUserSignal.set(null)
  }

  getAccessToken (): string | null {
    return localStorage.getItem(this.TOKEN_KEY)
  }

  getRefreshToken (): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY)
  }

  hasRole (allowedRoles: UserRole[]): boolean {
    const role = this.currentRole()
    return role ? allowedRoles.includes(role) : false
  }

  private setSession (authResult: AuthResponse): void {
    this.setAccessToken(authResult.tokens.accessToken)
    this.setRefreshToken(authResult.tokens.refreshToken)
    localStorage.setItem(this.USER_KEY, JSON.stringify(authResult.user))
    this.currentUserSignal.set(authResult.user)
  }

  private setAccessToken (token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token)
  }

  private setRefreshToken (token: string): void {
    localStorage.setItem(this.REFRESH_TOKEN_KEY, token)
  }

  private getStoredUser (): User | null {
    const userJson = localStorage.getItem(this.USER_KEY)
    if (!userJson) return null
    try {
      return JSON.parse(userJson) as User
    } catch {
      return null
    }
  }
}
