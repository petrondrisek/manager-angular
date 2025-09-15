import { Injectable, signal } from '@angular/core';
import { CookieService } from '../../shared/cookies/services/cookie-service';
import { HttpRequestService } from '../../shared/http/services/http-request-service';
import { User, UserLoggedIn } from '../auth.types';
import { Observable, of, tap, throwError } from 'rxjs';
import { COOKIE_AUTH_TOKEN, COOKIE_REFRESH_TOKEN } from '../auth.const';

@Injectable({
  providedIn: 'root'
})
export class AuthService 
{
  public readonly tokenValidForMinutes = 15;
  private _loggedUser = signal<User | null>(null);
  public readonly loggedUser = this._loggedUser.asReadonly();

  constructor(
    private readonly httpRequestService: HttpRequestService,
    private readonly cookieService: CookieService
  ){ }

  login(username: string, password: string): Observable<UserLoggedIn> {
    return this.httpRequestService.httpReq<UserLoggedIn>(
        'post', 
        '/api/User/login', 
        { username, password }, 
        false
    ).pipe(
      tap(async (res) => {
        this.cookieService.setCookie(COOKIE_AUTH_TOKEN, res.token as string, this.tokenValidForMinutes);
        this.cookieService.setCookie(COOKIE_REFRESH_TOKEN, res.refreshToken as string, 60 * res.refreshTokenValidHours);
      })
    );
  }

  getLoggedUser(): Observable<User> { 
    let cachedUser = this._loggedUser();
    if(cachedUser) {
      return of(cachedUser);
    }

    return this.httpRequestService.httpReq<User>('get', '/api/User/me', undefined, true).pipe(
      tap(user => this._loggedUser.set(user))
    );
  }

  revalidateToken(): Observable<UserLoggedIn> {
    const refreshToken = this.cookieService.getCookie(COOKIE_REFRESH_TOKEN);
    if(!refreshToken) return throwError(() => new Error('Unauthorized'));

    return this.httpRequestService.httpReq<UserLoggedIn>('post', '/api/User/refresh-token', {
      Token: refreshToken
    }, false).pipe(
      tap((res) => {
        this.cookieService.setCookie(COOKIE_AUTH_TOKEN, res.token as string, this.tokenValidForMinutes);
      })
    );
  }

  changePassword(currentPassword: string, newPassword: string) : Observable<User> {
    return this.httpRequestService.httpReq<User>(
      'patch', 
      '/api/User/change-password', 
      { CurrentPassword: currentPassword, NewPassword: newPassword }, 
      true
    );
  }

  logOut(): Observable<void> {
    const refreshToken = this.cookieService.getCookie(COOKIE_REFRESH_TOKEN);
    if(!refreshToken) return throwError(() => new Error('Unauthorized'));

    // Invalidate token
    return this.httpRequestService.httpReq<void>('post', '/api/User/invalidate-token', {
      Token: refreshToken
    }, true).pipe(
      tap(() => {
        this.cookieService.unsetCookie(COOKIE_REFRESH_TOKEN);
        this.cookieService.unsetCookie(COOKIE_AUTH_TOKEN);
        this._loggedUser.set(null);
      })
    );
  }
}
