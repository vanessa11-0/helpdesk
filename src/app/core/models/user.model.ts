/**
 * Roles tal como los define la API (`#/components/schemas/Role`).
 * Se usan en minúscula porque es el valor exacto que viaja en el JSON;
 * traducirlos aquí obligaría a mapear en cada petición.
 */
export type UserRole = 'admin' | 'agent' | 'client';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

/** GET /api/users → { data, total } */
export interface UserListResponse {
  data: User[];
  total: number;
}

/** GET /api/users/:id y PATCH /api/users/:id/role → { data } */
export interface UserResponse {
  data: User;
}

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Administrador',
  agent: 'Agente',
  client: 'Cliente'
};
