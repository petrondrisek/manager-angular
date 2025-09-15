import { Component, computed, inject } from '@angular/core';
import { AuthService } from '../auth/services/auth-service';

@Component({
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.html'
})
export class Dashboard {
  private readonly authService = inject(AuthService);
  public loggedUser = this.authService.loggedUser;
}
