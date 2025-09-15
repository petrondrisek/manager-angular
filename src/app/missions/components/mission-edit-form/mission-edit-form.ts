import { Component, effect, EventEmitter, inject, Input, Output, signal, WritableSignal, OnChanges, SimpleChanges } from '@angular/core';
import { Mission, UpdateMissionDto } from '../../missions.types';
import { MissionsService } from '../../services/missions-service';
import { NotifyService } from '../../../shared/notify/services/notify';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { SearchInput } from '../../../users/components/search-input/search-input';
import { User } from '../../../auth/auth.types';
import { FileManager } from '../../../shared/file/components/file-manager/file-manager';
import { TagManager } from '../tag-manager/tag-manager';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-mission-edit-form',
  imports: [
    ReactiveFormsModule, 
    CommonModule, 
    MatButtonModule, 
    MatFormFieldModule,
    MatInputModule,
    SearchInput, 
    FileManager, 
    TagManager
  ],
  templateUrl: './mission-edit-form.html'
})
export class MissionEditForm implements OnChanges {
  @Input() mission!: Mission;
  @Output() toggleModal: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() updateMission: EventEmitter<Mission> = new EventEmitter<Mission>();

  private readonly missionsService = inject(MissionsService);
  private readonly notifyService = inject(NotifyService);
  public pending: WritableSignal<boolean> = signal(false);
  public user = signal<User[]>([]);
  public relatedUsers = signal<User[]>([]);
  public storedFiles = signal<string[]>([]);
  public currentTags = signal<string[]>([]);

  public form = new FormGroup({
    title: new FormControl<string>("", [Validators.required, Validators.minLength(5), Validators.maxLength(100)]),
    description: new FormControl<string>("", [Validators.maxLength(2000)]),
    deadline: new FormControl<Date | null>(null, [this.missionsService.deadlineValidator]),
    userId: new FormControl<string>(""),
    relatedUserIds: new FormControl<string[]>([]),
    storedFiles: new FormControl<string[]>([]),
    files: new FormControl<FileList | null>(null),
    tags: new FormControl<string[]>([])
  });

  constructor() {
    effect(() => {
      if(this.mission) {
        this.user.set(this.mission.user ? [this.mission.user] : []);
        this.relatedUsers.set(this.mission.relatedUsers);
        this.storedFiles.set(this.mission.files || []);
        this.currentTags.set(this.mission.tags || []);

        this.form.patchValue({
          title: this.mission.title,
          description: this.mission.description,
          deadline: this.mission.deadline,
          userId: this.mission.userId,
          relatedUserIds: this.mission.relatedUsers.map(user => user.id),
          storedFiles: this.mission.files || [],
          tags: this.mission.tags || []
        });
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['mission'] && this.mission) {
      this.user.set(this.mission.user ? [this.mission.user] : []);
      this.relatedUsers.set(this.mission.relatedUsers);
      this.storedFiles.set(this.mission.files || []);
      this.currentTags.set(this.mission.tags || []);
    }
  }

  setUser(userIds: string[]) {
    if(userIds.length === 0) this.form.patchValue({ userId: "" });
    else this.form.patchValue({ userId: userIds[0] });
  }

  setRelatedUsers(userIds: string[]) {
    this.form.patchValue({ relatedUserIds: userIds });
  }

  setStoredFiles(files: string[]) {
    this.form.patchValue({ storedFiles: files });
  }

  setNewFiles(files: FileList | null) {
    this.form.patchValue({ files: files });
  }

  setTags(tags: string[]) {
    this.form.patchValue({ tags: tags });
  }

  onSubmit() {
    this.pending.set(true);

    const formValue = this.form.value;
    
    const missionDto: UpdateMissionDto = {
      ...formValue,
      files: formValue.files || undefined,
      id: this.mission.id 
    } as UpdateMissionDto;
    
    this.missionsService.updateMission(missionDto).subscribe({
      next: (mission: Mission) => {
        this.pending.set(false);
        this.notifyService.addNotification({ type: 'success', message: 'Mission edited successfully' });
        this.toggleModal.emit(false);
        this.updateMission.emit(mission);
        this.form.patchValue({
          files: null
        });
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