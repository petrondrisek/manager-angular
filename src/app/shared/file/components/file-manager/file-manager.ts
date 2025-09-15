import { Component, effect, EventEmitter, Input, OnChanges, Output, signal, SimpleChanges } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-file-manager',
  templateUrl: './file-manager.html',
  imports: [MatButtonModule, MatIcon, CommonModule]
})
export class FileManager implements OnChanges {
  @Input() storedFiles: string[] = [];
  @Output() storedFilesChange: EventEmitter<string[]> = new EventEmitter<string[]>();
  @Output() newFilesChange: EventEmitter<FileList | null> = new EventEmitter<FileList | null>();

  public currentStoredFiles = signal<string[]>([]);
  public newFiles = signal<File[]>([]);

  constructor() {
    effect(() => {
      this.currentStoredFiles.set([...this.storedFiles]);
    });

    effect(() => {
      this.storedFilesChange.emit([...this.currentStoredFiles()]);
    });

    effect(() => {
      const files = this.newFiles();
      if (files.length === 0) {
        this.newFilesChange.emit(null);
      } else {
        const dt = new DataTransfer();
        files.forEach(file => dt.items.add(file));
        this.newFilesChange.emit(dt.files);
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['storedFiles']) {
      this.currentStoredFiles.set([...this.storedFiles]);
      this.newFiles.set([]);
    }
  }

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const filesArray = Array.from(input.files);
      this.newFiles.set([...this.newFiles(), ...filesArray]);
      input.value = '';
    }
  }

  removeStoredFile(fileName: string) {
    this.currentStoredFiles.set(
      this.currentStoredFiles().filter(file => file !== fileName)
    );
  }

  removeNewFile(fileToRemove: File) {
    this.newFiles.set(
      this.newFiles().filter(file => file !== fileToRemove)
    );
  }

  getFileName(filePath: string): string {
    return filePath.split('/').pop() || filePath;
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }
}