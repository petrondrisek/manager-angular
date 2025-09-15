import { Component, EventEmitter, inject, Input, Output, signal, WritableSignal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UsersService } from '../../services/users-service';
import { User } from '../../../auth/auth.types';
import { MatButtonModule } from '@angular/material/button';
import { NotifyService } from '../../../shared/notify/services/notify';

@Component({
  selector: 'app-user-add-form',
  imports: [ReactiveFormsModule, MatButtonModule],
  templateUrl: './user-add-form.html'
})
export class UserAddForm {  
  @Input() users!: WritableSignal<User[]>
  @Output() toggleModal: EventEmitter<boolean> = new EventEmitter<boolean>();

  private readonly usersService = inject(UsersService);
  private readonly notifyService = inject(NotifyService);
  public pending: WritableSignal<boolean> = signal(false);
  public form = new FormGroup({ 
    username: new FormControl("", [Validators.required, Validators.minLength(3), Validators.maxLength(32), Validators.pattern('^[a-zA-Z0-9]+$')]), 
    email: new FormControl("", [Validators.required, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]) 
  });

  onSubmit() {
    this.pending.set(true);

    this.usersService.createUser(this.form.value as User).subscribe({
      next: (res) => {
          this.users.set([...this.users(), res]);
          this.notifyService.addNotification({ type: 'success', message: 'User added successfully' });
          this.toggleModal.emit(false);
          this.pending.set(false);
      },
      error: (err) => {
        this.notifyService.addNotification({ type: 'error', message: err.error.message ?? 'Something went wrong' });
        this.pending.set(false);
      }
    });
  }

  get username() { return this.form.get('username'); }
  get email() { return this.form.get('email'); }
}
