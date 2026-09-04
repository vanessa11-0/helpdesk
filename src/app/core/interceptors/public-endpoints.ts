/** Endpoints que no requieren access token y que nunca deben disparar un refresh. */
const PUBLIC_AUTH_PATHS = ['/auth/login', '/auth/register', '/auth/refresh'];

export function isPublicAuthEndpoint(url: string): boolean {
  return PUBLIC_AUTH_PATHS.some((path) => url.includes(path));
}
