import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Dialog } from '@angular/cdk/dialog';

import { BoardDetailApi } from '../../api-services/boards/board-api.model';
import { ColumnForm } from './column-form/column-form';
import { BoardApiService } from '../../api-services/boards/board-api-service';
import { CardForm } from './card-form/card-form';
import { CardApiService } from '../../api-services/cards/card-api-service';
import { ColumnApiService } from '../../api-services/columns/column-api-service';
import { ConfirmDialog } from '../../shared/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-board-view',
  imports: [],
  templateUrl: './board-view.html',
  styleUrl: './board-view.scss'
})
export class BoardView implements OnInit {
  private route = inject(ActivatedRoute);
  private boardApi = inject(BoardApiService);
  private dialog = inject(Dialog);
  private columnApi = inject(ColumnApiService);
  private cardApi = inject(CardApiService);

  boardId = '';
  board = signal<BoardDetailApi | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;
    this.boardId = id;
    this.load();
  }

  load() {
    this.loading.set(true);
    this.boardApi.getById(this.boardId).subscribe({
      next: (board) => {
        this.board.set(board);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Board nije pronađen.');
        this.loading.set(false);
      }
    });
  }

  openColumnForm() {
    const ref = this.dialog.open<string | undefined>(ColumnForm, {
      data: { boardId: this.boardId }
    });
    ref.closed.subscribe((newId) => {
      if (newId) this.load();
    });
  }

  editColumn(column: { id: string; title: string }) {
    const ref = this.dialog.open<string | undefined>(ColumnForm, {
      data: { boardId: this.boardId, column }
    });
    ref.closed.subscribe((result) => {
      if (result) this.load();
    });
  }

  deleteColumn(columnId: string) {
    const ref = this.dialog.open<boolean>(ConfirmDialog, {
      data: {
        title: 'Obriši kolonu',
        message: 'Ovo će obrisati i sve kartice unutar kolone. Da li si siguran?'
      }
    });

    ref.closed.subscribe((confirmed) => {
      if (!confirmed) return;

      this.columnApi.delete(columnId).subscribe({
        next: () => this.load(),
        error: () => alert('Brisanje nije uspjelo. Pokušaj ponovo.')
      });
    });
  }

  openCardForm(columnId: string) {
    const ref = this.dialog.open<{ id: string; version?: number } | undefined>(CardForm, {
      data: { columnId }
    });
    ref.closed.subscribe((result) => {
      if (result) this.load();
    });
  }

  editCard(columnId: string, card: { id: string; title: string; description: string | null; version: number }) {
    const ref = this.dialog.open<{ id: string; version?: number } | undefined>(CardForm, {
      data: { columnId, card }
    });
    ref.closed.subscribe((result) => {
      if (result) this.load();
    });
  }
  
  deleteCard(cardId: string) {
    const ref = this.dialog.open<boolean>(ConfirmDialog, {
      data: {
        title: 'Obriši karticu',
        message: 'Da li si siguran da želiš obrisati ovu karticu?'
      }
    });

    ref.closed.subscribe((confirmed) => {
      if (!confirmed) return;

      this.cardApi.delete(cardId).subscribe({
        next: () => this.load(),
        error: () => alert('Brisanje nije uspjelo. Pokušaj ponovo.')
      });
    });
  }
}