import { User } from './user.model';

export interface LoginRequest {
    password?: string;
    email: string;
}

export interface RegisterRequest {
    email: string;
    password?: string;
    fullName: string;
    role?: string;
}

export interface RefreshTokenRequest {
    refreshToken: string;
}

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}

export interface AuthResponse {
    user: User;
    tokens: AuthTokens;
}

