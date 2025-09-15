import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth-service';
import { Router } from '@angular/router';
import { NotifyService } from '../../../shared/notify/services/notify';

@Component({
  selector: 'app-logout',
  imports: [],
  template: ''
})
export class Logout implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly notifyService = inject(NotifyService);

  ngOnInit() {
    this.authService.logOut().subscribe({
      next: () => this.router.navigate(['/']),
      error: (err) => this.notifyService.addNotification({ type: 'error', message: err.error.message ?? 'Something went wrong' })
    });
  }
}
