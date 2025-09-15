import { Component, effect, EventEmitter, inject, Input, Output, signal, OnChanges, SimpleChanges } from '@angular/core';
import { UsersService } from '../../services/users-service';
import { User } from '../../../auth/auth.types';
import { MatButtonModule } from '@angular/material/button';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs';

@Component({
  selector: 'app-search-input',
  templateUrl: './search-input.html',
  imports: [MatButtonModule, ReactiveFormsModule, MatIcon]
})
export class SearchInput implements OnChanges {
  @Input() alreadySelected: User[] = [];
  @Input() multiple: boolean = false;
  @Input() placeholder: string = 'Search user ...';
  @Input() label: string = 'Users';
  @Input() name!: string;
  @Output() selectedUsers: EventEmitter<string[]> = new EventEmitter<string[]>();

  private readonly usersService = inject(UsersService);
  public selected = signal<User[]>([]);
  public users = signal<User[]>([]);
  public count = signal<number>(0);
  public searchControl = new FormControl<string>('');

  constructor() {
    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap(() => this.usersService.getUsers(0, 10, this.searchControl.value || 'xxx'))
      )
      .subscribe((res) => {
        this.users.set(res.items);
        this.count.set(res.totalCount);
      });

    effect(() => {
      const selectedIds = this.selected().map((user) => user.id);
      this.selectedUsers.emit(selectedIds);
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['alreadySelected'] && this.alreadySelected) {
      this.selected.set(this.multiple 
        ? [...this.alreadySelected] 
        : (this.alreadySelected.length > 0 
            ? [this.alreadySelected[0]] 
            : []
          )
      );
    }
  }

  add(user: User) {
    this.searchControl.setValue('');
    this.users.set([]);
    this.count.set(0);

    if (this.selected().some((u) => u.id === user.id)){
      return;
    }

    if (!this.multiple){
      this.selected.set([user]);
    }
    else {
      this.selected.set([...this.selected(), user]);
    }
  }

  remove(e: Event, id: string) {
    e.preventDefault();
    e.stopPropagation();

    this.selected.set(this.selected().filter((user) => user.id !== id));    
  }
}