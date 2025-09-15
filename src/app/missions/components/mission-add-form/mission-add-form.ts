import { Component, EventEmitter, inject, Input, Output, signal, WritableSignal } from '@angular/core';
import { CreateMissionDto, Mission } from '../../missions.types';
import { MissionsService } from '../../services/missions-service';
import { NotifyService } from '../../../shared/notify/services/notify';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { SearchInput } from '../../../users/components/search-input/search-input';
import { TagManager } from '../tag-manager/tag-manager';
import { FileManager } from '../../../shared/file/components/file-manager/file-manager';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-mission-add-form',
  imports: [
    ReactiveFormsModule, 
    CommonModule, 
    MatButtonModule, 
    MatFormFieldModule,
    MatInputModule,
    SearchInput, 
    TagManager, 
    FileManager
  ],
  templateUrl: './mission-add-form.html'
})
export class MissionAddForm {
  @Input() missions!: Mission[];
  @Output() toggleModal: EventEmitter<boolean> = new EventEmitter<boolean>();

  private readonly missionsService = inject(MissionsService);
  private readonly notifyService = inject(NotifyService);
  public pending: WritableSignal<boolean> = signal(false);
  public currentTags = signal<string[]>([]);

  public form = new FormGroup({
    title: new FormControl<string>("", [Validators.required, Validators.minLength(5), Validators.maxLength(100)]),
    description: new FormControl<string>("", [Validators.maxLength(2000)]),
    deadline: new FormControl<Date | null>(null, [this.missionsService.deadlineValidator]),
    userId: new FormControl<string>(""),
    relatedUserIds: new FormControl<string[]>([]),
    files: new FormControl<FileList | null>(null),
    tags: new FormControl<string[]>([])
  });

  setUser(user: string[]) {
    if(user.length === 0) this.form.patchValue({ userId: "" });
    else this.form.patchValue({ userId: user[0] });
  }

  setRelatedUsers(usersIds: string[]) {
    this.form.patchValue({ relatedUserIds: usersIds });
  }

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.form.patchValue({ files: input.files });
    }
  }

  setTags(tags: string[]) {
    this.form.patchValue({ tags: tags });
  }
  
  setNewFiles(files: FileList | null) {
    this.form.patchValue({ files: files });
  }

  onSubmit() {
    this.pending.set(true);

    const formValue = this.form.value;
    const missionDto: CreateMissionDto = {
      ...formValue,
      files: formValue.files || undefined 
    } as CreateMissionDto;
    
    this.missionsService.createMission(missionDto).subscribe({
      next: (mission) => {
        this.pending.set(false);
        this.missions.push(mission);
        this.notifyService.addNotification({ type: 'success', message: 'Mission added successfully' });
        this.toggleModal.emit(false);
        
      },
      error: (err) => {
        console.error(err);
        this.pending.set(false);
        this.notifyService.addNotification({ type: 'error', message: err.error.message ?? 'Something went wrong' });

        if(err.error.errors) {
          let errors = Object.values(err.error.errors || {}).map((arr: any) => arr.join(' | '));
          errors.forEach(error => this.notifyService.addNotification({ type: 'error', message: error }));
        }
      }
    });
  }

  get title() { return this.form.get('title'); }
  get description() { return this.form.get('description'); }
  get deadline() { return this.form.get('deadline'); }
  get userId() { return this.form.get('userId'); }
  get relatedUsersIds() { return this.form.get('relatedUsersIds'); }
  get files() { return this.form.get('files'); }
  get tags() { return this.form.get('tags'); }
}
