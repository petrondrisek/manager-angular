import { Component, inject, Input, signal, WritableSignal, OnDestroy, ElementRef, ViewChild, HostListener } from '@angular/core';
import { ModalService } from '../services/modal-service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-modal',
  imports: [MatButtonModule, MatIconModule, MatTooltipModule],
  templateUrl: './modal.html',
  styleUrl: './modal.scss',
})
export class Modal implements OnDestroy {
  @Input() type: 'icon' | 'fab' | 'filled' | 'extended-fab' = 'filled';
  @Input() buttonIcon?: string = 'edit';
  @Input() buttonText?: string = '';
  @Input() modalTitle?: string = '';
  @Input() closeOnOverlayClick: boolean = true;
  @Input() closeOnEscape: boolean = true;
  @Input() maxWidth?: string = '90vw';
  @Input() maxHeight?: string = '90vh';

  @ViewChild('modalArea') modalArea?: ElementRef<HTMLElement>;
  @ViewChild('modalContent') modalContent?: ElementRef<HTMLElement>;

  private readonly modalService = inject(ModalService);
  private _isModalOpen: WritableSignal<boolean> = signal(false);
  private originalBodyOverflow: string = '';
  private focusedElementBeforeOpen?: HTMLElement;

  ngOnDestroy() {
    if (this.isModalOpen) {
      this.restoreBodyScroll();
    }
  }

  @HostListener('document:keydown.escape', ['$event'])
  onEscapeKey(event: Event) {
    if (this.closeOnEscape && this.isModalOpen) {
      event.preventDefault();
      this.closeModal();
    }
  }

  public openModal(): void {
    this.focusedElementBeforeOpen = document.activeElement as HTMLElement;
    this.preventBodyScroll();
    this.isModalOpen = true;
    
    setTimeout(() => {
      this.focusModal();
    }, 250);
  }

  public closeModal(): void {
    this.isModalOpen = false;
    this.restoreBodyScroll();
    
    setTimeout(() => {
      if (this.focusedElementBeforeOpen) {
        this.focusedElementBeforeOpen.focus();
      }
    }, 200);
  }

  public toggleModal(open?: boolean): void {
    const shouldOpen = open !== undefined ? open : !this.isModalOpen;
    if (shouldOpen) {
      this.openModal();
    } else {
      this.closeModal();
    }
  }

  public onOverlayClick(event: MouseEvent): void {
    if (this.closeOnOverlayClick) {
      const target = event.target as HTMLElement;
      if (target.classList.contains('modal')) {
        this.closeModal();
      }
    }
  }

  public onModalAreaClick(event: MouseEvent): void {
    event.stopPropagation();
  }

  private preventBodyScroll(): void {
    this.originalBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.body.classList.add('modal-open');
  }

  private restoreBodyScroll(): void {
    document.body.style.overflow = this.originalBodyOverflow;
    document.body.classList.remove('modal-open');
  }

  private focusModal(): void {
    if (this.modalArea?.nativeElement) {
      const focusableElements = this.modalArea.nativeElement.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      if (focusableElements.length > 0) {
        (focusableElements[0] as HTMLElement).focus();
      } else {
        this.modalArea.nativeElement.focus();
      }
    }
  }

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if (!this.isModalOpen) return;

    // Trap focus within modal
    if (event.key === 'Tab') {
      this.trapFocus(event);
    }
  }

  private trapFocus(event: KeyboardEvent): void {
    if (!this.modalArea?.nativeElement) return;

    const focusableElements = this.modalArea.nativeElement.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstElement) {
        event.preventDefault();
        lastElement?.focus();
      }
    } else {
      // Tab
      if (document.activeElement === lastElement) {
        event.preventDefault();
        firstElement?.focus();
      }
    }
  }

  public get isModalOpen(): boolean {
    return this._isModalOpen();
  }

  public set isModalOpen(value: boolean) {
    this._isModalOpen.set(value);
    this.modalService.isModalOpen.set(value);
  }
}