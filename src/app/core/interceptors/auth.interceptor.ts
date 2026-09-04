import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '@core/services/auth.service';
import { isPublicAuthEndpoint } from './public-endpoints';

/**
 * Añade `Authorization: Bearer <accessToken>` a toda petición salvo las de
 * autenticación pública (login, registro y refresh), que no llevan token.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.getAccessToken();

  if (!token || isPublicAuthEndpoint(req.url)) {
    return next(req);
  }

  return next(
    req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
  );
};
