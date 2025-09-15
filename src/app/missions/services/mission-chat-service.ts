import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { MissionChat } from '../missions.types';
import { BACKEND_URL } from '../../app.config';

@Injectable({
  providedIn: 'root'
})
export class MissionChatService {
  private hubConnection!: signalR.HubConnection;

  // Connection
  async startConnection(token: string): Promise<void> {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${BACKEND_URL}/missionChatHub`, {
        accessTokenFactory: () => token,
        transport: signalR.HttpTransportType.WebSockets
      })
      .build();

    return this.hubConnection.start();
  }
  
  async joinMission(missionId: string): Promise<void> {
    if (!this.hubConnection) {
      throw new Error('Connection not established');
    }

    return this.hubConnection.invoke("JoinMissionGroup", missionId);
  }

  // Send events
  async sendMessage(missionId: string, message: string): Promise<void> {
    if (!this.hubConnection) {
      throw new Error('Connection not established');
    }

    return this.hubConnection.invoke("SendMessageToMission", missionId, message);
  }

  async deleteMessage(missionId: string, messageId: string): Promise<void> {
    if (!this.hubConnection) {
      throw new Error('Connection not established');
    }

    return this.hubConnection.invoke("DeleteMessage", missionId, messageId);
  }

  // Receive events
  onMessageReceived(callback: (message: MissionChat) => void) {
    if (!this.hubConnection) {
      throw new Error('Connection not established');
    }

    this.hubConnection.on("ReceiveMessage", callback);
  }

  onMessageDeleted(callback: (messageId: string) => void) {
    if (!this.hubConnection) {
      throw new Error('Connection not established');
    }

    this.hubConnection.on("DeleteMessage", callback);
  }

  // Leave
  async leaveMission(missionId: string): Promise<void> {
    if (!this.hubConnection) {
      throw new Error('Connection not established');
    }

    return this.hubConnection.invoke("LeaveMissionGroup", missionId);
  }
}
