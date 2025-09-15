import { Component, computed, effect, inject, signal, WritableSignal, ElementRef } from '@angular/core';
import { AuthService } from '../../../auth/services/auth-service';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { fromEvent, map, startWith} from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-nav',
  imports: [RouterLink, MatButtonModule, MatIconModule],
  templateUrl: './nav.html',
  styleUrl: './nav.scss',
  standalone: true
})
export class Nav {
  public readonly unlogged: Array<{ name: string, link: string }> = [
    { name: 'Sign in', link: '/' }
  ]

  public readonly logged : Array<{ name: string, link: string }> = [
    { name: 'Dashboard', link: '/dashboard' },
    { name: 'Tasks', link: '/mission' },
    { name: 'Users', link: '/users' },
    { name: 'Sign out', link: '/logout' }
  ]

  public readonly authService = inject(AuthService)
  private readonly document = inject(DOCUMENT);
  
  private _hamburgerMenu: WritableSignal<boolean> = signal(
    typeof window !== 'undefined' ? window.innerWidth < 1000 : false
  );
  public readonly hamburgerMenuSignal = computed(() => this._hamburgerMenu());
  public isMenuOpen: WritableSignal<boolean> = signal(false);

  readonly windowWidth = toSignal(
      fromEvent(window, 'resize').pipe(
        startWith(null),
        map(() => window.innerWidth)
    ),
    { initialValue: window.innerWidth }
  );

  constructor() {
    effect(() => {
      const currentWidth = this.windowWidth();
      const shouldBeHamburger = currentWidth < 1000;
      
      if (shouldBeHamburger !== this._hamburgerMenu()) {
        this.isMenuOpen.set(false);
        this._hamburgerMenu.set(shouldBeHamburger);
      }
    });

    effect(() => {
      const header = this.document.querySelector('.site-header') as HTMLElement;
      if (header) {
        if (this.isMenuOpen() && this._hamburgerMenu()) {
          header.classList.add('menu-expanded');
        } else {
          header.classList.remove('menu-expanded');
        }
      }
    });
  }

  toggleHamburgerMenu(): void {
    this.isMenuOpen.set(!this.isMenuOpen());
  }

  closeMenu(): void {
    if (this._hamburgerMenu()) {
      this.isMenuOpen.set(false);
    }
  }
}