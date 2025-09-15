import { Component, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { UsersService } from './services/users-service';
import { UserAddForm } from './components/user-add-form/user-add-form';
import { CommonModule } from '@angular/common';
import { UserDeleteForm } from './components/user-delete-form/user-delete-form';
import { UserEditForm } from './components/user-edit-form/user-edit-form';
import { Modal } from '../shared/modal/components/modal';
import { User } from '../auth/auth.types';
import { NotifyService } from '../shared/notify/services/notify';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { MatPaginatorModule } from '@angular/material/paginator';

@Component({
  selector: 'app-users',
  imports: [UserAddForm, CommonModule, UserDeleteForm, UserEditForm, Modal, MatCardModule, MatTableModule, MatPaginatorModule],
  templateUrl: './users.html',
})
export class Users implements OnInit {
  private readonly usersService = inject(UsersService);
  private readonly notifyService = inject(NotifyService);
  private readonly router = inject(Router);
  public users: WritableSignal<User[]> = signal([]);
  public page = signal<number>(1);
  public limit = signal<number>(5);
  public limitOptions = [5, 10];
  public total = signal<number>(0);

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    const routePage = this.route.snapshot.paramMap.get('page');
    if(routePage) {
      this.page.set(Number(routePage));
      this.getUsers();
    }
    else this.router.navigate(['/users', 1]);
  }

  getUsers() {
    this.usersService.getUsers((this.page() - 1) * this.limit(), this.limit()).subscribe({
      next: (res) => {
        this.total.set(res.totalCount);
        this.users.set(res.items);
      },
      error: (err) => {
        console.error(err);
        this.notifyService.addNotification({ type: 'error', message: err.error.message ?? 'Something went wrong' })
      }
    });
  }

  handlePageEvent(event: any) {
    if(event.pageIndex !== event.previousPageIndex) this.page.set(event.pageIndex + 1);
    if(event.pageSize !== this.limit()) this.limit.set(event.pageSize);

    this.getUsers();
    this.router.navigate(['/users', this.page()], {
      replaceUrl: true
    });
  }

  deleteUser(id: string) {
    this.users.set(this.users().filter(user => user.id !== id));
  }

}
