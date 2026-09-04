import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';

/**
 * Hay sesión válida cuando existen un access token y un usuario en el estado
 * del AuthService (rehidratado desde localStorage al arrancar). El guard no
 * verifica la firma ni la expiración del token: de eso se encarga la API con
 * un 401, que el interceptor de renovación convierte en un refresh.
 */
export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isAuthenticated()) {
    return true;
  }

  return router.createUrlTree(['/auth/login'], {
    queryParams: { returnUrl: state.url }
  });
};
