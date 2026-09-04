import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserRole } from '@core/models';
import { AuthService } from '@core/services/auth.service';

/**
 * Restringe una ruta a los roles declarados en `data.roles`.
 * Se ejecuta después de authGuard, así que aquí ya hay sesión: si el rol no
 * encaja es un 403 conceptual, no un 401, y por eso lleva a /unauthorized en
 * lugar de al login.
 */
export const roleGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const allowed = route.data['roles'] as UserRole[] | undefined;
  if (!allowed?.length) {
    return true;
  }

  return auth.hasRole(...allowed) ? true : router.createUrlTree(['/unauthorized']);
};
