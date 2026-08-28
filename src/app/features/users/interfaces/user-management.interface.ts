import { User, UserRole } from '@core/models/user.model';

export interface CreateUserRequest {
  name: string;
  email: string;
  role: UserRole;
  password?: string;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  role?: UserRole;
}

export interface UserFilterParams {
  role?: UserRole | '';
  search?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedUsersResponse {
  data: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}