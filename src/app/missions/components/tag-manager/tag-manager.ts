import { Component, effect, EventEmitter, Input, Output, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-tag-manager',
  templateUrl: './tag-manager.html',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatChipsModule,
    MatIconModule
  ]
})
export class TagManager {
  @Input() tags: string[] = [];
  @Output() tagsChange: EventEmitter<string[]> = new EventEmitter<string[]>();

  private readonly predefinedTags = ["New", "In Progress", "Completed", "Cancelled"];
  
  public currentTags = signal<string[]>([]);
  public predefinedTagControl = new FormControl<string>('');
  public customTagControl = new FormControl<string>('');

  constructor() {
    effect(() => {
      this.currentTags.set([...this.tags]);
    });

    effect(() => {
      this.tagsChange.emit([...this.currentTags()]);
    });
  }

  availablePredefinedTags() {
    return this.predefinedTags.filter(tag => !this.currentTags().includes(tag));
  }

  addPredefinedTag() {
    const selectedTag = this.predefinedTagControl.value;
    if (selectedTag && selectedTag.trim() && !this.currentTags().includes(selectedTag)) {
      this.currentTags.set([...this.currentTags(), selectedTag]);
      this.predefinedTagControl.setValue('');
    }
  }

  addCustomTag(event?: Event) {
    if (event) {
      event.preventDefault();
    }
    
    const customTag = this.customTagControl.value?.trim();
    if (customTag && !this.currentTags().includes(customTag)) {
      this.currentTags.set([...this.currentTags(), customTag]);
      this.customTagControl.setValue('');
    }
  }

  removeTag(tagToRemove: string) {
    this.currentTags.set(
      this.currentTags().filter(tag => tag !== tagToRemove)
    );
  }
}