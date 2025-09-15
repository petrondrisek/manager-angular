import { Component, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { MissionsService } from './services/missions-service';
import { Mission } from './missions.types';
import { NotifyService } from '../shared/notify/services/notify';
import { Modal } from '../shared/modal/components/modal';
import { MissionAddForm } from './components/mission-add-form/mission-add-form';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MissionEditForm } from './components/mission-edit-form/mission-edit-form';
import { MatButtonToggleChange, MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule, DatePipe } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-list',
  imports: [
    Modal, 
    MissionAddForm, 
    MissionEditForm, 
    RouterLink, 
    MatPaginatorModule, 
    MatButtonToggleModule,
    MatButtonModule, 
    MatIconModule,
    MatTooltipModule,
    DatePipe,
    CommonModule
  ],
  templateUrl: './list.html'
})
export class List implements OnInit {
    private readonly missionsService = inject(MissionsService);
    private readonly notifyService = inject(NotifyService);
    private readonly router = inject(Router);
    public completed = signal(false);
    public missions: WritableSignal<Mission[]> = signal<Mission[]>([]);
    public lastVisits: WritableSignal<Date[]> = signal<Date[]>([]);
    public page = signal<number>(1);
    public limit = signal<number>(5);
    public limitOptions = [5, 10];
    public total = signal<number>(0);
    public filterTag = signal<string|null>(null);

    constructor(private route: ActivatedRoute) {}

    ngOnInit(): void {
      const routePage = this.route.snapshot.paramMap.get('page');
      if(routePage){
        this.page.set(Number(routePage));
        this.getMissions();
      }
      else this.router.navigate(['/mission', 1]);
    }

    getMissions() {
        this.missionsService.getMissionsByUser((this.page() - 1) * this.limit(), this.limit(), this.filterTag(), this.completed()).subscribe({
          next: (res) => {
            this.missions.set(res.items);
            this.missions.set(this.missions().map(m => ({ 
              ...m, 
              updatedAt: new Date(m.updatedAt), 
              lastChatMessageAt: m.lastChatMessageAt ? new Date(m.lastChatMessageAt) : null 
            })));
            this.total.set(res.totalCount);
            this.lastVisits.set(res.lastVisits.map(visit => new Date(visit)));
          },
          error: (err) => {
            console.log(err);
            this.notifyService.addNotification({ type: 'error', message: err.error.message ?? "Something went wrong" });
          }
        });
    }

    updateMission(mission: Mission) {
      this.missions.set(this.missions().map(m => m.id === mission.id ? mission : m));
    }
    
    handlePageEvent(event: any) {
      if(event.pageIndex !== event.previousPageIndex) this.page.set(event.pageIndex + 1);
      if(event.pageSize !== this.limit()) this.limit.set(event.pageSize);

      this.getMissions();
      this.router.navigate(['/mission', this.page()], {
        replaceUrl: true
      });
    }

    setCompleted(event: MatButtonToggleChange) {
      if(event.value === 'completed' && this.completed()) return;

      this.completed.set(event.value === 'completed');
      this.getMissions();
    }

    toggleComplete(mission: Mission) {
      let method = null;
      if(this.completed()) method = this.missionsService.unCompleteMission.bind(this.missionsService);
      else method = this.missionsService.completeMission.bind(this.missionsService);

      method(mission.id).subscribe({
        next: () => {
          this.getMissions();
        },
        error: (err) => {
          console.error(err);
          this.notifyService.addNotification({ type: 'error', message: err.error.message ?? 'Something went wrong' });
        }
      });
    }

    filterByTag(tag: string) {
      if(this.filterTag() === tag) this.filterTag.set(null);
      else this.filterTag.set(tag);

      this.getMissions();
    }
}
