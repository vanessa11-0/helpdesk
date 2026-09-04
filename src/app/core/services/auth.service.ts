import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, of, tap, throwError } from 'rxjs';
import { environment } from '@env/environment';
import {
  ApiError,
  AuthResponse,
  LoginRequest,
  MeResponse,
  RefreshTokenRequest,
  RegisterRequest,
  User,
  UserRole
} from '@core/models';

/**
 * Punto único de autenticación: login, registro, refresh, logout y
 * persistencia de tokens. Ningún otro servicio debe tocar el storage.
 *
 * Los tokens se guardan en localStorage para que la sesión sobreviva a un
 * refresco del navegador. La alternativa (cookie httpOnly) sería más segura
 * frente a XSS, pero la API entrega los tokens en el cuerpo de la respuesta,
 * así que el cliente es quien debe almacenarlos.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/auth`;

  private readonly ACCESS_TOKEN_KEY = 'helpdesk_access_token';
  private readonly REFRESH_TOKEN_KEY = 'helpdesk_refresh_token';
  private readonly USER_KEY = 'helpdesk_user';

  private readonly _currentUser = signal<User | null>(this.readUser());
  private readonly _accessToken = signal<string | null>(
    localStorage.getItem(this.ACCESS_TOKEN_KEY)
  );

  readonly currentUser = this._currentUser.asReadonly();
  readonly isAuthenticated = computed(() => !!this._accessToken() && !!this._currentUser());
  readonly userRole = computed<UserRole | null>(() => this._currentUser()?.role ?? null);

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(tap((res) => this.storeSession(res)));
  }

  /** La API crea siempre la cuenta con rol `client`; no se envía rol. */
  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/register`, data)
      .pipe(tap((res) => this.storeSession(res)));
  }

  /**
   * Intercambia el refresh token por un par nuevo (la API rota ambos, así que
   * hay que guardar también el refresh token que vuelve).
   */
  refreshToken(): Observable<AuthResponse> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return throwError(() => new Error('No hay refresh token almacenado.'));
    }

    const payload: RefreshTokenRequest = { refreshToken };
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/refresh`, payload)
      .pipe(tap((res) => this.storeSession(res)));
  }

  /**
   * Cierra sesión invalidando el refresh token en el servidor. El access token
   * no tiene lista negra: expira solo a los 15 minutos.
   */
  logout(): Observable<unknown> {
    const refreshToken = this.getRefreshToken();
    const request$ = refreshToken
      ? this.http
          .post(`${this.apiUrl}/logout`, { refreshToken })
          .pipe(catchError(() => of(null)))
      : of(null);

    return request$.pipe(tap(() => this.clearSession()));
  }

  /** Revalida contra el servidor los datos de sesión rehidratados del storage. */
  loadProfile(): Observable<MeResponse> {
    return this.http
      .get<MeResponse>(`${this.apiUrl}/me`)
      .pipe(tap((res) => this.storeUser(res.user)));
  }

  getAccessToken(): string | null {
    return this._accessToken();
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  hasRole(...roles: UserRole[]): boolean {
    const role = this.userRole();
    return !!role && roles.includes(role);
  }

  /** Borra la sesión local sin llamar al servidor (refresh token ya inválido). */
  clearSession(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this._accessToken.set(null);
    this._currentUser.set(null);
  }

  /**
   * Traduce el formato de error de la API (`{ error: { code, message } }`) a un
   * texto mostrable. Incluye los errores de campo cuando la API los detalla.
   */
  static describeError(error: unknown, fallback = 'Ocurrió un error inesperado.'): string {
    if (!(error instanceof HttpErrorResponse)) {
      return fallback;
    }
    if (error.status === 0) {
      return 'No se pudo contactar al servidor. Revisa tu conexión.';
    }

    const body = error.error as ApiError | null;
    const detail = body?.error;
    if (!detail) {
      return fallback;
    }
    if (detail.fields?.length) {
      return detail.fields.map((f) => f.message).join(' ');
    }
    return detail.message || fallback;
  }

  private storeSession(res: AuthResponse): void {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, res.accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, res.refreshToken);
    this._accessToken.set(res.accessToken);
    this.storeUser(res.user);
  }

  private storeUser(user: User): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this._currentUser.set(user);
  }

  private readUser(): User | null {
    const raw = localStorage.getItem(this.USER_KEY);
    if (!raw) {
      return null;
    }
    try {
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  }
}
