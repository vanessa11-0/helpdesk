import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { User, CreateUserDTO, UpdateUserRoleDTO } from '../user.interface';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/users`;

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }

  createUser(userData: CreateUserDTO): Observable<User> {
    return this.http.post<User>(this.apiUrl, userData);
  }

  updateRole(dto: UpdateUserRoleDTO): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/${dto.userId}/role`, { role: dto.role });
  }

  toggleActiveState(userId: string, isActive: boolean): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/${userId}/status`, { isActive });
  }
}