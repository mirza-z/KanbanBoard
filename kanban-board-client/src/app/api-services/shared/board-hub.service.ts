import { inject, Injectable, signal } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { environment } from '../../../environments/environments';
import { AuthService } from '../../core/auth/auth.service';

const GUEST_NAME_KEY = 'kanban_guest_name';

export interface CursorUser {
  connectionId: string;
  color: string;
  displayName: string;
  x: number;
  y: number;
}

@Injectable({ providedIn: 'root' })
export class BoardHubService {
  private auth = inject(AuthService);
  private connection: signalR.HubConnection | null = null;
  private currentBoardId: string | null = null;

  myConnectionId = signal<string | null>(null);
  presentUsers = signal<Map<string, CursorUser>>(new Map());
  boardChanged = signal(0);

  private hubUrl = environment.apiUrl.replace(/\/api\/?$/, '') + '/hubs/board';

    getGuestName(): string | null {
        return localStorage.getItem(GUEST_NAME_KEY);
      }
    setGuestName(name: string) {
      localStorage.setItem(GUEST_NAME_KEY, name.trim());
    }

    private joinBoard(boardId: string) {
      return this.connection?.invoke('JoinBoard', boardId, this.getGuestName());
    }


    async connect(boardId: string): Promise<void> {
    this.currentBoardId = boardId;

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(this.hubUrl, {
        accessTokenFactory: () => this.auth.getToken() ?? ''
      })
      .withAutomaticReconnect()
      .build();

    this.connection.on('BoardChanged', () => {
      this.boardChanged.update(n => n + 1);
    });

    this.registerPresenceHandlers(); // registruj PRIJE start(), da ne promašiš prvi UserJoined

    this.connection.onreconnected(() => {
      if (this.currentBoardId) this.joinBoard(this.currentBoardId);
    });

    await this.connection.start();
    await this.joinBoard(boardId);
  }

  async disconnect(): Promise<void> {
    if (!this.connection) return;
    if (this.currentBoardId) {
      try {
        await this.connection.invoke('LeaveBoard', this.currentBoardId);
      } catch {}
    }
    await this.connection.stop();
    this.connection = null;
    this.currentBoardId = null;
    this.presentUsers.set(new Map()); // očisti kursore, inače ostanu "duhovi" pri sledećem ulasku
  }

  private registerPresenceHandlers() {
    this.connection!.on('UserJoined', (connectionId: string, color: string, displayName: string, isSelf: boolean) => {
      if (isSelf) {
        this.myConnectionId.set(connectionId);
        return;
      }
      this.presentUsers.update(map => {
        const next = new Map(map);
        next.set(connectionId, { connectionId, color, displayName, x: 0, y: 0 });
        return next;
      });
    });

    this.connection!.on('UserLeft', (connectionId: string) => {
      this.presentUsers.update(map => {
        const next = new Map(map);
        next.delete(connectionId);
        return next;
      });
    });

    this.connection!.on('CursorMoved', (connectionId: string, x: number, y: number) => {
      this.presentUsers.update(map => {
        const existing = map.get(connectionId);
        if (!existing) return map;
        const next = new Map(map);
        next.set(connectionId, { ...existing, x, y });
        return next;
      });
    });
  }

  updateCursorPosition(boardId: string, x: number, y: number) {
    this.connection?.invoke('UpdateCursorPosition', boardId, x, y);
  }
}