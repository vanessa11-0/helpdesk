import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '@core/services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.getAccessToken();

  let authReq = req;

  // Adjuntar el token JWT si está disponible
  if (token) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Si la API responde con 401 (no autorizado), cerrar sesión y redirigir
      if (error.status === 401) {
        authService.logout();
        router.navigate(['/login'], {
          queryParams: { sessionExpired: 'true' }
        });
      }
      return throwError(() => error);
    })
  );
};