import { Component, inject, OnDestroy, OnInit, signal, WritableSignal } from '@angular/core';
import { MissionDetailResponse } from '../../missions.types';
import { MissionsService } from '../../services/missions-service';
import { ActivatedRoute, Router } from '@angular/router';
import { NotifyService } from '../../../shared/notify/services/notify';
import { Chat } from '../../components/chat/chat';
import { DatePipe } from '@angular/common';
import { DownloadButton } from '../../../shared/file/components/download-button/download-button';

@Component({
  selector: 'app-detail',
  imports: [Chat, DatePipe, DownloadButton],
  templateUrl: './detail.html'
})
export class Detail implements OnInit, OnDestroy {
  private readonly missionsService = inject(MissionsService);
  private readonly notifyService = inject(NotifyService);
  private readonly router = inject(Router);
  public id = signal<string>('');
  public chatMessageLimit = 10;
  public detail: WritableSignal<MissionDetailResponse|null> = signal<MissionDetailResponse|null>(null);

  constructor(
    private readonly route: ActivatedRoute
  ){}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.id.set(id);
    }

    this.loadMission();
  }

  loadMission(): void {
    this.missionsService.getMission(this.id(), 0, this.chatMessageLimit).subscribe({
      next: (res) => {
        this.detail.set(res);
      },  
      error: (err) => {
        this.router.navigate(['/mission']);
        this.notifyService.addNotification({
          type: 'error',
          message: err.error.message ?? "Mission not found."
        });
      }
    });
  }

  ngOnDestroy(): void {
    this.missionsService.updateLastVisit(this.id()).subscribe({
      next: () => {},
      error: (err) => {
        console.error(err);
        this.notifyService.addNotification({ type: 'error', message: "Unable to update your last visit." });
      }
    });
  }
}