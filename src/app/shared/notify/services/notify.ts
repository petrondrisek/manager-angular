import { Injectable, signal, WritableSignal } from '@angular/core';
import { Notification } from '../types/Notification';

@Injectable({
  providedIn: 'root'
})
export class NotifyService {
  public notifications: WritableSignal<Notification[]> = signal([]);

  constructor() { }

  addNotification(notification: Notification) {
      if(!notification.id) 
        notification.id = btoa(Date.now().toString());

      if(!notification.duration) 
        notification.duration = 5000;

      this.notifications.set([...this.notifications(), notification]);

      setTimeout(() => {
        this.notifications.set(this.notifications().filter(n => n.id !== notification.id));
      }, notification.duration);
  }

  removeNotification(id: string) {
    this.notifications.set(this.notifications().filter(n => n.id !== id));
  }
}
