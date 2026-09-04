import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, of, shareReplay, tap } from 'rxjs';
import { environment } from '@env/environment';
import { User, UserListResponse, UserResponse, UserRole } from '@core/models';

/**
 * Endpoints reservados a admin. La API sólo expone listar, ver detalle y
 * cambiar rol: no hay alta ni baja de usuarios desde el panel.
 */
@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/users`;

  private agentsCache$?: Observable<User[]>;

  getUsers(role?: UserRole): Observable<User[]> {
    let params = new HttpParams();
    if (role) {
      params = params.set('role', role);
    }
    return this.http
      .get<UserListResponse>(this.apiUrl, { params })
      .pipe(map((res) => res.data));
  }

  getUserById(id: string): Observable<User> {
    return this.http
      .get<UserResponse>(`${this.apiUrl}/${id}`)
      .pipe(map((res) => res.data));
  }

  /** Un admin no puede quitarse a sí mismo el rol de admin (la API responde 400). */
  updateRole(id: string, role: UserRole): Observable<User> {
    return this.http
      .patch<UserResponse>(`${this.apiUrl}/${id}/role`, { role })
      .pipe(
        map((res) => res.data),
        tap(() => this.invalidateAgents())
      );
  }

  /** Lista de agentes para el selector de asignación; se cachea por sesión. */
  getAgents(): Observable<User[]> {
    if (!this.agentsCache$) {
      this.agentsCache$ = this.getUsers('agent').pipe(shareReplay(1));
    }
    return this.agentsCache$;
  }

  invalidateAgents(): void {
    this.agentsCache$ = undefined;
  }

  /**
   * Los tickets traen sólo IDs de usuario. Un admin puede resolverlos a
   * nombres; el resto de roles no tiene acceso a /api/users, así que se
   * devuelve un diccionario vacío y la UI cae al ID.
   */
  getDirectory(canList: boolean): Observable<Record<string, User>> {
    if (!canList) {
      return of({});
    }
    return this.getUsers().pipe(
      map((users) =>
        users.reduce<Record<string, User>>((acc, user) => {
          acc[user.id] = user;
          return acc;
        }, {})
      )
    );
  }
}
