import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { User } from '@core/models/user.model';
import {
  CreateUserRequest,
  UpdateUserRequest,
  UserFilterParams,
  PaginatedUsersResponse
} from '../user-management.interface';

@Injectable({
  providedIn: 'root'
})
export class UserManagementService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/users`;

  getUsers(filters: UserFilterParams = {}): Observable<PaginatedUsersResponse> {
    let params = new HttpParams();

    if (filters.role) params = params.set('role', filters.role);
    if (filters.search) params = params.set('search', filters.search);
    if (filters.page) params = params.set('page', filters.page.toString());
    if (filters.limit) params = params.set('limit', filters.limit.toString());

    return this.http.get<PaginatedUsersResponse>(this.apiUrl, { params });
  }

  getUserById(id: string | number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  createUser(userData: CreateUserRequest): Observable<User> {
    return this.http.post<User>(this.apiUrl, userData);
  }

  updateUser(id: string | number, userData: UpdateUserRequest): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/${id}`, userData);
  }

  deleteUser(id: string | number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}