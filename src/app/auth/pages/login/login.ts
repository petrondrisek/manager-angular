import { Component, inject, signal, WritableSignal } from '@angular/core';
import { AuthService } from '../../services/auth-service';
import { Router } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { firstValueFrom } from 'rxjs';
import { NotifyService } from '../../../shared/notify/services/notify';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, CommonModule, MatButtonModule],
  templateUrl: './login.html'
})
export class Login {
  private readonly authService: AuthService = inject(AuthService);
  private readonly notifyService = inject(NotifyService);
  private readonly router = inject(Router);
  public loginResponse = signal<any>({ success: false, errors: [] });
  public pending: WritableSignal<boolean> = signal(false);
  
  public loginForm = new FormGroup({ 
    username: new FormControl<string>("", [Validators.required, Validators.minLength(3)]), 
    password: new FormControl<string>("") 
  });

  onSubmit() {
    this.pending.set(true);

    if(!this.loginForm.value.username) {
      this.loginResponse.update(l => ({...l, errors: [l.errors, 'Username is required.'] as string[]}));
      return;
    }

    this.authService.login(this.loginForm.value.username, this.loginForm.value.password ?? '').subscribe({
      next: async (response) => {
        this.loginResponse.set({ success: true, errors: [] });
        this.pending.set(false);

        await firstValueFrom(this.authService.getLoggedUser());
        this.notifyService.addNotification({ type: 'success', message: 'Logged in successfully' });

        if(!response.isPasswordSet) {
          this.notifyService.addNotification({ type: 'warning', message: 'You\'re password has been reset, please set a new one.' });
          this.router.navigate(['set-password']);
        } else {
          this.router.navigate(['dashboard']);
        }
      },
      error: (err) => {
        this.loginResponse.set({
          success: false,
          errors: [
            err.error.message ?? 'Login failed',
            ...Object.values(err.error.errors || {}).map(
              (arr: any) => arr.join(' | ')
            )
          ]
        });

        this.pending.set(false);
      }
    });
  }

  get username() { return this.loginForm.get('username'); }
  get password() { return this.loginForm.get('password'); }
}
