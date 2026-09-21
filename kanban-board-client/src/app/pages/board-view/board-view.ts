import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Dialog } from '@angular/cdk/dialog';

import { BoardDetailApi } from '../../api-services/boards/board-api.model';
import { ColumnForm } from './column-form/column-form';
import { BoardApiService } from '../../api-services/boards/board-api-service';
import { CardForm } from './card-form/card-form';

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
    const ref = this.dialog.open<string>(ColumnForm, {
      data: { boardId: this.boardId }
    });
    ref.closed.subscribe((newId) => {
      if (newId) this.load();
    });
  }
  openCardForm(columnId: string) {
    const ref = this.dialog.open<string>(CardForm, {
      data: { columnId }
    });
    ref.closed.subscribe((newId) => {
      if (newId) this.load();
    });
  }
}