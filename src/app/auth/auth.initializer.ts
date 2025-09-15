import { inject } from '@angular/core';
import { AuthService } from './services/auth-service';
import { firstValueFrom } from 'rxjs';
import { CookieService } from '../shared/cookies/services/cookie-service';
import { COOKIE_REFRESH_TOKEN } from './auth.const';

export async function authRefreshTokenInitializer() {
    const authService = inject(AuthService);
    const cookieService = inject(CookieService);

    try {
        const refreshToken = cookieService.getCookie(COOKIE_REFRESH_TOKEN);

        if (refreshToken) {
            await firstValueFrom(authService.revalidateToken());
            await firstValueFrom(authService.getLoggedUser());
        }
    } catch (error) {
        await firstValueFrom(authService.logOut());
    }
}