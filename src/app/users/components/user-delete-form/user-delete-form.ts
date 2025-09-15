import { Component, effect, EventEmitter, inject, Input, Output, signal, WritableSignal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { User } from '../../../auth/auth.types';
import { MatButtonModule } from '@angular/material/button';
import { UsersService } from '../../services/users-service';
import { NotifyService } from '../../../shared/notify/services/notify';

@Component({
  selector: 'app-user-delete-form',
  imports: [ReactiveFormsModule, MatButtonModule],
  templateUrl: './user-delete-form.html',
  standalone: true
})
export class UserDeleteForm {
  @Input() user!: User;
  @Output() toggleModal: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() deleteUser: EventEmitter<string> = new EventEmitter<string>();

  private readonly usersService = inject(UsersService);
  private readonly notifyService = inject(NotifyService);
  public pending: WritableSignal<boolean> = signal(false);
  public form = new FormGroup({ 
    id: new FormControl("", [Validators.required]) 
  });

  constructor() {
    effect(() => {
      if(this.user) {
        this.form.get('id')?.setValue(this.user.id);
      }
    })
  }

  onSubmit() {
    this.pending.set(true);

    this.usersService.deleteUser(this.user.id.toString()).subscribe({
      next: () => {
        this.notifyService.addNotification({ type: 'success', message: 'User deleted successfully' });
        this.deleteUser.emit(this.user.id);
        this.toggleModal.emit(false);
        this.pending.set(false);
      },
      error: (err) => {
        this.notifyService.addNotification({ type: 'error', message: err.error.message ?? 'Something went wrong' });
        this.pending.set(false);
      }
    });
  }
}
