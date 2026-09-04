/**
 * Configuración de producción. Aquí no hay proxy que reescriba nada, así que
 * se apunta directo al backend desplegado. angular.json sustituye
 * environment.ts por este archivo al compilar con la configuración
 * `production`.
 */
export const environment = {
  production: true,
  apiUrl: 'https://sla-api.areasoftccyt.com/api'
};
