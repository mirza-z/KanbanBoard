import { Injectable, signal } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { environment } from '../../../environments/environments';

@Injectable({ providedIn: 'root' })
export class BoardHubService {
  private connection: signalR.HubConnection | null = null;
  private currentBoardId: string | null = null;

  boardChanged = signal(0);

  private hubUrl = environment.apiUrl.replace(/\/api\/?$/, '') + '/hubs/board';

  async connect(boardId: string): Promise<void> {
    this.currentBoardId = boardId;

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(this.hubUrl)
      .withAutomaticReconnect()
      .build();

    this.connection.on('BoardChanged', () => {
      this.boardChanged.update(n => n + 1);
    });

    this.connection.onreconnected(() => {
      if (this.currentBoardId) {
        this.connection?.invoke('JoinBoard', this.currentBoardId);
      }
    });

    await this.connection.start();
    await this.connection.invoke('JoinBoard', boardId);
  }

  async disconnect(): Promise<void> {
    if (!this.connection) return;

    if (this.currentBoardId) {
      try {
        await this.connection.invoke('LeaveBoard', this.currentBoardId);
      } catch {
      }
    }

    await this.connection.stop();
    this.connection = null;
    this.currentBoardId = null;
  }
}