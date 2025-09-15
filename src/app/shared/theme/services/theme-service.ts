import { inject, Injectable, signal, WritableSignal } from '@angular/core';
import { CookieService } from '../../cookies/services/cookie-service';
import { COOKIE_DARK_THEME } from '../theme.conts';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly cookiesService = inject(CookieService);
  private readonly isDarkModeCookie = this.cookiesService.getCookie(COOKIE_DARK_THEME);
  public isDarkMode : WritableSignal<boolean> = signal<boolean>(this.isDarkModeCookie === 'true');

  toggleTheme(on: boolean) {
    const html = document.querySelector('html')!;
    const body = document.querySelector('body')!;

    if (on) {
      html.classList.add('dark');
      body.classList.add('dark');
    }
    else {
      html.classList.remove('dark');
      body.classList.remove('dark');
    }

    this.cookiesService.setCookie(COOKIE_DARK_THEME, on ? 'true' : 'false', 365 * 24 * 60);
  }
}
