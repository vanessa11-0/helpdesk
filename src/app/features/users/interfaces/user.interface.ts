export type UserRole = 'Cliente' | 'Agente' | 'Administrador';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
}

export interface CreateUserDTO {
  name: string;
  email: string;
  password?: string;
  role: UserRole;
}

export interface UpdateUserRoleDTO {
  userId: string;
  role: UserRole;
}