// src/app/models/user.model.ts

export type UserRole = 'CLIENT' | 'AGENT' | 'ADMIN';

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
}