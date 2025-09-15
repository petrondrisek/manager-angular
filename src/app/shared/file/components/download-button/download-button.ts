import { Component, Input, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CommonModule } from '@angular/common';
import { DownloadService, FileInfo } from '../../services/download-service';

type DownloadState = 'idle' | 'loading' | 'downloading' | 'success' | 'error';

@Component({
  selector: 'app-file-download-button',
  imports: [CommonModule, MatButtonModule, MatIconModule, MatProgressBarModule, MatTooltipModule],
  templateUrl: './download-button.html',
  styleUrls: ['./download-button.scss']
})
export class DownloadButton {
  @Input() fileName!: string;
  @Input() displayName?: string;
  @Input() showProgress: boolean = true;
  @Input() showFileSize: boolean = true;
  @Input() loadFileInfo: boolean = true;
  @Input() variant: 'simple' | 'with-progress' | 'icon-only' = 'simple';

  private readonly fileService = inject(DownloadService);
  
  readonly state = signal<DownloadState>('idle');
  readonly progress = signal<number>(0);
  readonly fileInfo = signal<FileInfo | null>(null);
  readonly error = signal<string | null>(null);

  ngOnInit() {
    if (this.loadFileInfo && this.fileName) {
      this.loadFileInformation();
    }
  }

  private loadFileInformation() {
    this.state.set('loading');
    
    this.fileService.getFileInfo(this.fileName).subscribe({
      next: (info) => {
        this.fileInfo.set(info);
        this.state.set('idle');
      },
      error: (err) => {
        console.error('Error loading file information:', err);
        this.error.set('Error loading file information');
        this.state.set('error');
      }
    });
  }

  downloadFile() {
    if (!this.fileName) return;

    this.state.set('downloading');
    this.progress.set(0);
    this.error.set(null);

    if (this.showProgress) {
      // with progress bar
      this.fileService.downloadFileWithProgress(this.fileName).subscribe({
        next: (result) => {
          this.progress.set(result.progress);
          
          if (result.file) {
            const url = window.URL.createObjectURL(result.file);
            const link = document.createElement('a');
            link.href = url;
            link.download = this.fileName;
            link.click();
            
            // Cleanup
            window.URL.revokeObjectURL(url);
            this.state.set('success');
            
            setTimeout(() => {
              this.state.set('idle');
              this.progress.set(0);
            }, 2000);
          }
        },
        error: (err) => {
          console.error('Error downloading file:', err);
          this.error.set('Error downloading file');
          this.state.set('error');
          
          setTimeout(() => {
            this.state.set('idle');
            this.error.set(null);
          }, 3000);
        }
      });
    } else {
      // Simple
      this.fileService.downloadFile(this.fileName).subscribe({
        next: () => {
          this.state.set('success');
          setTimeout(() => this.state.set('idle'), 2000);
        },
        error: (err) => {
          console.error('Downloading error:', err);
          this.error.set('Error downloading file');
          this.state.set('error');
          setTimeout(() => {
            this.state.set('idle');
            this.error.set(null);
          }, 3000);
        }
      });
    }
  }

  get buttonColor(): string {
    switch (this.state()) {
      case 'success': return 'accent';
      case 'error': return 'warn';
      default: return 'primary';
    }
  }

  buttonIcon(): string {
    switch (this.state()) {
      case 'loading': return 'hourglass_empty';
      case 'downloading': return 'download';
      case 'success': return 'check_circle';
      case 'error': return 'error';
      default: return 'download';
    }
  }

  buttonText(): string {
    const name = this.displayName || this.fileName || 'File';
    
    switch (this.state()) {
      case 'loading': return 'Loading...';
      case 'downloading': return `Downloading ${name}`;
      case 'success': return 'Downloaded!';
      case 'error': return 'Error';
      default: return `Download ${name}`;
    }
  }

  tooltipText(): string {
    if (this.error()) return this.error()!;
    if (this.fileInfo()) {
      const info = this.fileInfo()!;
      return `${info.name} (${info.sizeFormatted}) - ${info.contentType}`;
    }
    return `Download ${this.fileName}`;
  }
}