import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CookieService {

  constructor() { }

  setCookie(name: string, value: string, minutes?: number): void {
    let expires = '';
    if (minutes) {
      const date = new Date();
      date.setTime(date.getTime() + (minutes * 60 * 1000));
      expires = '; expires=' + date.toUTCString();
    }
    document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}${expires}; path=/; SameSite=Lax; Secure;`;
  }

  unsetCookie(name: string): void {
    document.cookie = `${encodeURIComponent(name)}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax; Secure;`;
  }

  getCookie(name: string): string | null {
    const nameEncoded: string = encodeURIComponent(name) + '=';
    const cookies: string[] = document.cookie.split(';');
    
    for (let c of cookies) {
      const cookie = c.trim();
      if (cookie.startsWith(nameEncoded)) {
        return decodeURIComponent(cookie.substring(nameEncoded.length));
      }
    }
    return null;
  }
}
