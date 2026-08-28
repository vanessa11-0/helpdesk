import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, switchMap, filter, take } from 'rxjs/operators';
import { AuthService } from '@core/services/auth.service';

// Variables de estado a nivel de módulo para controlar llamadas concurrentes
let isRefreshing = false;
const refreshTokenSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

export const authRefreshInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Interceptar únicamente si la respuesta es 401 y no viene del propio endpoint de refresh/login
      const isAuthApi = req.url.includes('/auth/login') || req.url.includes('/auth/refresh');

      if (error.status === 401 && !isAuthApi) {
        return handle401Error(req, next, authService);
      }

      return throwError(() => error);
    })
  );
};

function handle401Error(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
  authService: AuthService
): Observable<unknown> {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);

    return authService.refreshToken().pipe(
      switchMap((response) => {
        isRefreshing = false;
        refreshTokenSubject.next(response.accessToken);

        // Reintentar la petición original con el nuevo token
        return next(
          req.clone({
            setHeaders: {
              Authorization: `Bearer ${response.accessToken}`
            }
          })
        );
      }),
      catchError((refreshErr) => {
        isRefreshing = false;
        authService.logout();
        return throwError(() => refreshErr);
      })
    );
  } else {
    // Si ya hay un refresco en proceso, encolar/esperar hasta que emita un token válido
    return refreshTokenSubject.pipe(
      filter((token): token is string => token !== null),
      take(1),
      switchMap((token) => {
        return next(
          req.clone({
            setHeaders: {
              Authorization: `Bearer ${token}`
            }
          })
        );
      })
    );
  }
}