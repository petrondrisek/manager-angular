import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormGroup, ReactiveFormsModule, FormControl, Validators, ValidationErrors, AbstractControl } from '@angular/forms';
import { AuthService } from '../../services/auth-service';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-set-password',
  imports: [ReactiveFormsModule, CommonModule, MatButtonModule],
  templateUrl: './set-password.html'
})
export class SetPassword {
  public changePasswordState = signal<any>({ success: false, errors: [] });
  public pending = signal(false);
  private authService = inject(AuthService);
  
  public form = new FormGroup({
    previousPassword: new FormControl(""),
    newPassword: new FormControl("", [
      Validators.required,
      Validators.minLength(8),
      Validators.pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).+$/)
    ]),
    confirmPassword: new FormControl('', [Validators.required])
  }, this.passwordMatchValidator);

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const group = control as FormGroup;
    const newPassword = group.get('newPassword')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return newPassword === confirmPassword ? null : { passwordsMismatch: true };
  }

  onSubmit() {
    this.pending.set(true);

    this.authService.changePassword(`${this.form.value.previousPassword}`, `${this.form.value.newPassword}`).subscribe({
      next: (res) => {
        this.changePasswordState.set({ success: true, errors: [] });
        this.pending.set(false);
      },
      error: (err) => {
        this.changePasswordState.set({
          success: false,
          errors: [
            err.error.error ?? 'Change password failed',
            ...Object.values(err.error.errors || {}).map(
              (arr: any) => arr.join(' | ')
            )
          ]
        });

        this.pending.set(false);
      }
    });
  }

  get previousPassword() { return this.form.get('previousPassword'); }
  get newPassword() { return this.form.get('newPassword'); }
  get confirmPassword() { return this.form.get('confirmPassword'); }
}
