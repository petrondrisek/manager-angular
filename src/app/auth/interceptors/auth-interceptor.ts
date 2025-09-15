import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AUTHORIZE } from '../authorize.token';
import { AuthService } from '../services/auth-service';
import { throwError, switchMap, catchError } from 'rxjs';
import { CookieService } from '../../shared/cookies/services/cookie-service';
import { COOKIE_AUTH_TOKEN, COOKIE_REFRESH_TOKEN } from '../auth.const';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const cookieService = inject(CookieService);
  
  // If authorization needed
  if (req.context.get(AUTHORIZE)) {
    const token = cookieService.getCookie(COOKIE_AUTH_TOKEN);
    const refreshToken = cookieService.getCookie(COOKIE_REFRESH_TOKEN);

    // If not logged in
    if (!token && !refreshToken) {
      return throwError(() => new Error('Unauthorized'));
    }

    // Revalidate token from refresh token if expired
    if (!token && refreshToken) {
      return authService.revalidateToken().pipe(
        switchMap((res) => {
          // Clone request with new token
          const authorizedReq = req.clone({
            headers: req.headers.set('Authorization', `Bearer ${res.token}`),
          });
          return next(authorizedReq);
        }),
        catchError(() => {
          throwError(() => new Error('Unauthorized'));

          // Remove cookies
          cookieService.unsetCookie(COOKIE_REFRESH_TOKEN);
          cookieService.unsetCookie(COOKIE_AUTH_TOKEN);

          return next(req);
        })
      );
    }

    // Only if valid token add authorization header
    if (token) {
      req = req.clone({
        headers: req.headers.set('Authorization', `Bearer ${token}`),
      });
    }
  }

  return next(req);
};