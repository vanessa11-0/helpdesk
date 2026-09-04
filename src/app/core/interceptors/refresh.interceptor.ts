import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, catchError, filter, switchMap, take, throwError } from 'rxjs';
import { AuthService } from '@core/services/auth.service';
import { isPublicAuthEndpoint } from './public-endpoints';

/**
 * Estado compartido por todas las peticiones. Al vencer el access token es
 * habitual que varias llamadas fallen con 401 a la vez; sin este candado cada
 * una pediría su propio refresh y, como la API rota el refresh token, la
 * primera invalidaría el de las demás y la sesión se caería.
 *
 * Con el patrón BehaviorSubject sólo la primera petición renueva; el resto se
 * suspende sobre el subject y se reanuda cuando éste emite el token nuevo.
 */
let isRefreshing = false;
const refreshedToken$ = new BehaviorSubject<string | null>(null);

export const refreshInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: unknown) => {
      const isExpiredSession =
        error instanceof HttpErrorResponse &&
        error.status === 401 &&
        !isPublicAuthEndpoint(req.url) &&
        !!auth.getRefreshToken();

      if (!isExpiredSession) {
        return throwError(() => error);
      }

      return handleExpiredToken(req, next, auth, router);
    })
  );
};

function handleExpiredToken(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
  auth: AuthService,
  router: Router
): Observable<HttpEvent<unknown>> {
  if (isRefreshing) {
    // Ya hay una renovación en curso: esperar el token nuevo y reintentar.
    return refreshedToken$.pipe(
      filter((token): token is string => token !== null),
      take(1),
      switchMap((token) => next(withToken(req, token)))
    );
  }

  isRefreshing = true;
  refreshedToken$.next(null);

  return auth.refreshToken().pipe(
    switchMap((res) => {
      isRefreshing = false;
      refreshedToken$.next(res.accessToken);
      return next(withToken(req, res.accessToken));
    }),
    catchError((refreshError: unknown) => {
      // El refresh token también expiró o fue revocado: no hay vuelta atrás.
      isRefreshing = false;
      refreshedToken$.next(null);
      auth.clearSession();
      void router.navigate(['/auth/login'], {
        queryParams: { sessionExpired: 'true' }
      });
      return throwError(() => refreshError);
    })
  );
}

/**
 * El reintento sale desde este interceptor, así que ya no vuelve a pasar por
 * authInterceptor: hay que poner la cabecera a mano.
 */
function withToken(req: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
  return req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
}
