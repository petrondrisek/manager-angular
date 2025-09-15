import { Component } from '@angular/core';
import { NotifyService } from '../../services/notify';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-notify',
  imports: [CommonModule],
  templateUrl: './notify.html'
})
export class Notify {
  constructor(
    public readonly notifyService: NotifyService
  ){}

  close(id: string | undefined) {
    if(!id) return;
    
    this.notifyService.removeNotification(id);
  }
}
