import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../../../models/user.model';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Obtener los roles permitidos configurados en la ruta
  const allowedRoles = route.data?.['roles'] as UserRole[] | undefined;
  const userRole = authService.currentRole();

  // Si no se especificaron roles en la ruta o si el usuario no está autenticado
  if (!allowedRoles || !authService.isAuthenticated()) {
    return router.createUrlTree(['/auth/login']);
  }

  // Verificar si el rol actual del usuario está dentro de los permitidos
  if (userRole && allowedRoles.includes(userRole)) {
    return true;
  }

  // Redirigir al dashboard si no tiene permisos suficientes
  return router.createUrlTree(['/dashboard']);
};