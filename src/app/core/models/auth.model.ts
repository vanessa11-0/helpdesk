import { User } from './user.model';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

/**
 * Login, registro y refresh devuelven el mismo objeto plano (sin envoltorio
 * `data`): par de tokens + el usuario autenticado.
 */
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

/** GET /api/auth/me → { user } */
export interface MeResponse {
  user: User;
}

/** Formato de error uniforme de la API. */
export interface ApiError {
  error: {
    code: string;
    message: string;
    fields?: Array<{ field: string; message: string }>;
  };
}
