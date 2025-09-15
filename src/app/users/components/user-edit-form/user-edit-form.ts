import { Component, effect, EventEmitter, inject, Input, Output, signal, WritableSignal } from '@angular/core';
import { User } from '../../../auth/auth.types';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { UsersService } from '../../services/users-service';
import { UpdateUserDto } from '../../users.types';
import { NotifyService } from '../../../shared/notify/services/notify';

@Component({
  selector: 'app-user-edit-form',
  imports: [ReactiveFormsModule, MatButtonModule, MatCheckboxModule],
  templateUrl: './user-edit-form.html'
})
export class UserEditForm {
  @Input() user!: User;
  @Output() toggleModal: EventEmitter<boolean> = new EventEmitter<boolean>();

  private readonly usersService = inject(UsersService);
  private readonly notifyService = inject(NotifyService);
  public pending: WritableSignal<boolean> = signal(false);
  public permissionsList = [
    { id: 0, label: 'User' },
    { id: 1, label: 'Manage users' },
    { id: 2, label: 'Manage tasks' },
  ];
  public form = new FormGroup({ 
    firstName: new FormControl("", [Validators.required, Validators.minLength(3), Validators.maxLength(32)]), 
    lastName: new FormControl("", [Validators.required, Validators.minLength(3), Validators.maxLength(32)]), 
    email: new FormControl("", [Validators.required, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]),
    resetPassword: new FormControl(false),
    permissions: new FormControl([0])
  });

  constructor() {
    effect(() => {
      if(this.user) {
        this.form.patchValue({
          firstName: this.user.firstName,
          lastName: this.user.lastName,
          email: this.user.email,
          permissions: this.user.permissions
        });
      }
    })
  }

  togglePermission(id: number, event: any) {
    let permissions: number[] = this.form.value.permissions ?? [0];

    if (id === 0) return;

    if (!permissions.includes(id)) {
      permissions.push(id);
    } else {
      permissions = permissions.filter(p => p !== id);
    }

    this.form.get('permissions')?.setValue(permissions);
  }

  onSubmit() {
    this.pending.set(true);
    let updatedUser =  this.form.value as UpdateUserDto;

    this.usersService.updateUser(this.user.id, updatedUser).subscribe({
      next: (res) => {
        this.user.firstName = res.firstName;
        this.user.lastName = res.lastName;
        this.user.email = res.email;
        this.user.permissions = res.permissions;
        this.notifyService.addNotification({ type: 'success', message: 'User updated successfully' });
        this.toggleModal.emit(false);
        this.pending.set(false);
      },
      error: (err) => {
        this.notifyService.addNotification({ type: 'error', message: err.error.message ?? 'Something went wrong' });
        this.pending.set(false);
      }
    });
  }

  get firstName() { return this.form.get('firstName'); }
  get lastName() { return this.form.get('lastName'); }
  get email() { return this.form.get('email'); }
  get resetPassword() { return this.form.get('resetPassword'); }
  get permissions() { return this.form.get('permissions'); }
}
