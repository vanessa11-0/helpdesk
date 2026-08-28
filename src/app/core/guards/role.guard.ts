import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { UserRole } from '../models/user.model';

export const roleGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const allowedRoles = route.data['roles'] as Array<UserRole> | undefined;
  const currentRole = authService.userRole();

  if (currentRole && allowedRoles && allowedRoles.includes(currentRole)) {
    return true;
  }

  // Si no tiene los permisos suficientes, redirigir al Dashboard principal
  return router.createUrlTree(['/dashboard']);
};