import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Dialog } from '@angular/cdk/dialog';

import { BoardListItemApi } from '../../api-services/boards/board-api.model';
import { BoardApiService } from '../../api-services/boards/board-api-service';
import { BoardForm } from './board-form/board-form.ts/board-form';
import { ConfirmDialog } from '../../shared/confirm-dialog/confirm-dialog';


@Component({
  selector: 'app-board-list',
  imports: [RouterLink],
  templateUrl: './board-list.html',
  styleUrl: './board-list.scss'
})
export class BoardList implements OnInit {
  private boardApi = inject(BoardApiService);
  private dialog = inject(Dialog);

  boards = signal<BoardListItemApi[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.boardApi.getAll().subscribe({
      next: (result) => {
        this.boards.set(result.items);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Greška pri učitavanju boardova.');
        this.loading.set(false);
      }
    });
  }

  openCreateForm() {
    const ref = this.dialog.open<string | undefined>(BoardForm);
    ref.closed.subscribe((newId) => {
      if (newId) this.load();
    });
  }

  editBoard(board: { id: string; title: string; ownerId: string }, event: Event) {
    event.stopPropagation();
    event.preventDefault();

    const ref = this.dialog.open<string | undefined>(BoardForm, {
      data: { board }
    });
    ref.closed.subscribe((result) => {
      if (result) this.load();
    });
  }

  deleteBoard(boardId: string, event: Event) {
    event.stopPropagation(); // spriječi da klik na dugme aktivira i routerLink navigaciju
    event.preventDefault();

    const ref = this.dialog.open<boolean>(ConfirmDialog, {
      data: {
        title: 'Obriši board',
        message: 'Ovo će trajno obrisati board i sve kolone i kartice unutar njega. Da li si siguran?'
      }
    });

    ref.closed.subscribe((confirmed) => {
      if (!confirmed) return;

      this.boardApi.delete(boardId).subscribe({
        next: () => this.load(),
        error: () => alert('Brisanje nije uspjelo. Pokušaj ponovo.')
      });
    });
  }
}