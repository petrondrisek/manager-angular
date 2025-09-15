import { Component, computed, effect, ElementRef, inject, Input, OnDestroy, OnInit, signal, ViewChild, WritableSignal, AfterViewInit } from '@angular/core';
import { NotifyService } from '../../../shared/notify/services/notify';
import { MissionChat } from '../../missions.types';
import { AuthService } from '../../../auth/services/auth-service';
import { MissionChatService } from '../../services/mission-chat-service';
import { CookieService } from '../../../shared/cookies/services/cookie-service';
import { COOKIE_AUTH_TOKEN } from '../../../auth/auth.const';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MissionsService } from '../../services/missions-service';
import { DatePipe, NgClass } from '@angular/common';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-chat',
  imports: [ReactiveFormsModule, MatButtonModule, DatePipe, NgClass, MatIcon],
  templateUrl: './chat.html'
})
export class Chat implements OnInit, OnDestroy, AfterViewInit {
  @Input() offset!: number;
  @Input() missionId!: string;
  @Input() chatMessages!: MissionChat[];

  private readonly authService = inject(AuthService);
  private readonly notifyService = inject(NotifyService);
  private readonly missionService = inject(MissionsService);
  private readonly missionChatService = inject(MissionChatService);
  private readonly cookieService = inject(CookieService);
  
  public user = this.authService.loggedUser;
  public connected = signal<boolean>(false);
  public pending = signal<boolean>(false);
  public loadingMore = signal<boolean>(false);
  public loadOffset = signal<number>(0);
  public notMoreMessages = signal<boolean>(false);
  public messages: WritableSignal<MissionChat[]> = signal<MissionChat[]>([]);
  public shouldScrollToBottom = signal<boolean>(true);
  public selectedMessage = signal<MissionChat|null>(null);

  // Smooth scroll
  private isLoadingMessages = false;
  private scrollAnchor: { messageId?: string; offsetFromTop?: number } | null = null;
  private resizeObserver: ResizeObserver | null = null;

  public sortedMessages = computed(() => {
    return [...this.messages()]
      .map(m => ({ ...m, createdAt: new Date(m.createdAt) }))
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  });

  public form = new FormGroup({ 
    message: new FormControl<string>(
      "", 
      [
        Validators.required, 
        Validators.minLength(5),
        Validators.maxLength(500)
      ]
    ) 
  });

  @ViewChild('chatContainer') private chatContainer!: ElementRef<HTMLDivElement>;
  @ViewChild('messageInput') private messageInput!: ElementRef<HTMLTextAreaElement>;

  constructor() {
    effect(() => {
      if(this.connected()) {
        this.missionChatService.onMessageReceived((message: MissionChat) => this.onNewMessage(message));
        this.missionChatService.onMessageDeleted((messageId: string) => this.onMessageDeleted(messageId));
      }
    });

    effect(() => {
      if (this.shouldScrollToBottom() && this.messages().length > 0 && !this.isLoadingMessages) {
        this.requestAnimationFrame(() => this.scrollToBottom());
      }
    });
  }

  ngAfterViewInit() {
    this.scrollToBottom();
    this.setupResizeObserver();
  }

  private setupResizeObserver() {
    if ('ResizeObserver' in window && this.chatContainer) {
      this.resizeObserver = new ResizeObserver(() => {
        if (this.shouldScrollToBottom() && !this.isLoadingMessages) {
          this.requestAnimationFrame(() => this.scrollToBottom());
        }
      });
      
      this.resizeObserver.observe(this.chatContainer.nativeElement);
    }
  }

  private requestAnimationFrame(callback: () => void) {
    if (typeof requestAnimationFrame !== 'undefined') {
      requestAnimationFrame(callback);
    } else {
      setTimeout(callback, 16); // only for browsers that don't support requestAnimationFrame
    }
  }

  async ngOnInit(): Promise<void> {
    this.loadOffset.set(this.offset);
    this.messages.set([...this.chatMessages].reverse());

    const token = this.cookieService.getCookie(COOKIE_AUTH_TOKEN);
    if (!token) 
      return this.notifyService.addNotification({ type: 'error', message: 'You must be logged in to join missions.' });

    try {
      this.missionChatService.startConnection(token).then(
        () => this.missionChatService.joinMission(this.missionId).then(
            () => this.connected.set(true)
          ).catch(err => this.notifyService.addNotification({ type: 'error', message: err }))
      ).catch(err => this.notifyService.addNotification({ type: 'error', message: err }));
    } catch (e: any) {
      this.notifyService.addNotification({ type: 'error', message: 'Unexpected error during connecting chat ...' });
      throw e;
    }
  }

  ngOnChanges() {
    if (this.chatMessages) {
      this.messages.set([...this.chatMessages].reverse());
    }
  }

  onNewMessage(message: MissionChat) {
    const wasAtBottom = this.isAtBottom();
    
    this.messages.set([...this.messages(), message]);
    
    if (message.user.id === this.user()?.id || wasAtBottom) {
      this.shouldScrollToBottom.set(true);
    }
  }

  onMessageDeleted(messageId: string) {
    this.messages.set(this.messages().filter(m => m.id !== messageId));
  }

  sendMessage() {
    if (!this.form.valid) return;
    
    this.pending.set(true);
    this.shouldScrollToBottom.set(true);

    try {
      this.missionChatService.sendMessage(this.missionId, this.form.value.message ?? "").then(() => {
        this.pending.set(false);
        this.form.reset();
        this.resetTextareaHeight();
      }).catch(err => {
        this.notifyService.addNotification({ type: 'error', message: err })
        this.pending.set(false);
      });

    } catch (e: any) {
      this.notifyService.addNotification({ type: 'error', message: 'Message could not be sent, please try again later.' });
      this.pending.set(false);
      throw e;
    }
  }

  deleteMessage(messageId: string) {
    try {
      this.missionChatService.deleteMessage(this.missionId, messageId);
      this.selectedMessage.set(null);
    } catch (e: any) {
      this.notifyService.addNotification({ type: 'error', message: 'Message could not be deleted, please try again later.' });
      throw e;
    }
  }

  loadMoreMessages() {
    if(this.notMoreMessages() || this.loadingMore()) return;
    
    this.loadingMore.set(true);
    this.isLoadingMessages = true;
    
    this.preserveScrollPosition();

    this.missionService.getMission(this.missionId, this.loadOffset(), this.offset).subscribe({
      next: (res) => {
        if(res.chat.length) {
          const newMessages = res.chat.reverse();
          this.messages.set([...newMessages, ...this.messages()]);
          
          this.requestAnimationFrame(() => {
            this.requestAnimationFrame(() => {
              this.restoreScrollPosition();
              this.isLoadingMessages = false;
            });
          });
        } else {
          this.notMoreMessages.set(true);
          this.isLoadingMessages = false;
        }

        this.loadOffset.set(this.loadOffset() + this.offset);
        this.loadingMore.set(false);
      },
      error: (err) => {
        this.notifyService.addNotification({ type: 'error', message: err.error.message ?? 'Loading more messages failed, please try again later' });
        this.loadingMore.set(false);
        this.isLoadingMessages = false;
      }
    });
  }

  private preserveScrollPosition() {
    if (!this.chatContainer) return;
    
    const container = this.chatContainer.nativeElement;
    const messageElements = container.querySelectorAll('[data-message-id]');
    
    for (let i = 0; i < messageElements.length; i++) {
      const element = messageElements[i] as HTMLElement;
      const rect = element.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      
      if (rect.top >= containerRect.top) {
        this.scrollAnchor = {
          messageId: element.getAttribute('data-message-id') || undefined,
          offsetFromTop: rect.top - containerRect.top
        };
        break;
      }
    }
    
    if (!this.scrollAnchor) {
      this.scrollAnchor = {
        offsetFromTop: container.scrollTop
      };
    }
  }

  private restoreScrollPosition() {
    if (!this.chatContainer || !this.scrollAnchor) return;
    
    const container = this.chatContainer.nativeElement;
    
    if (this.scrollAnchor.messageId) {
      const targetElement = container.querySelector(`[data-message-id="${this.scrollAnchor.messageId}"]`) as HTMLElement;
      
      if (targetElement) {
        const containerRect = container.getBoundingClientRect();
        const targetRect = targetElement.getBoundingClientRect();
        const currentOffset = targetRect.top - containerRect.top;
        const desiredOffset = this.scrollAnchor.offsetFromTop || 0;
        const scrollAdjustment = currentOffset - desiredOffset;
        
        container.scrollTop += scrollAdjustment;
      }
    } else if (this.scrollAnchor.offsetFromTop !== undefined) {
      container.scrollTop = this.scrollAnchor.offsetFromTop;
    }
    
    this.scrollAnchor = null;
  }

  resetTextareaHeight() {
    if (this.messageInput) {
      this.messageInput.nativeElement.style.height = 'auto';
    }
  }

  setSelectedMessage(message: MissionChat) {
    if(this.user()?.id !== message.user.id) return;
    this.selectedMessage.set(this.selectedMessage() === message ? null : message);
  }

  scrollToBottom(smooth: boolean = true) {
    if (!this.chatContainer) return;
    
    const element = this.chatContainer.nativeElement;
    
    if (smooth) {
      element.scrollTo({
        top: element.scrollHeight,
        behavior: 'smooth'
      });
    } else {
      element.scrollTop = element.scrollHeight;
    }
  }

  autoResize(event: Event) {
    const textarea = event.target as HTMLTextAreaElement;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 128) + 'px';
  }

  onScroll(event: Event) {
    if (this.isLoadingMessages) return;
    
    const element = event.target as HTMLDivElement;
    const { scrollTop, scrollHeight, clientHeight } = element;
    
    if (scrollTop === 0 && !this.notMoreMessages() && !this.loadingMore()) {
      this.loadMoreMessages();
    }
    
    const isAtBottom = this.isAtBottom();
    this.shouldScrollToBottom.set(isAtBottom);
  }

  private isAtBottom(): boolean {
    if (!this.chatContainer) return false;
    
    const element = this.chatContainer.nativeElement;
    const { scrollTop, scrollHeight, clientHeight } = element;
    return scrollHeight - scrollTop <= clientHeight + 50;
  }

  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  ngOnDestroy(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    
    try {
      this.missionChatService.leaveMission(this.missionId);
    } catch (e: any) {
      this.notifyService.addNotification({ type: 'warning', message: 'Leaving chat failed ...' });
      throw e;
    }
  }

  get message() { return this.form.get('message'); }
}