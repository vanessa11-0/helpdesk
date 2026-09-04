/**
 * Configuración de desarrollo. `apiUrl` es una ruta relativa a propósito: en
 * `ng serve` las peticiones a /api las reenvía el proxy definido en
 * proxy.conf.json, así el navegador las ve como mismo origen y no hay CORS.
 */
export const environment = {
  production: false,
  apiUrl: '/api'
};
