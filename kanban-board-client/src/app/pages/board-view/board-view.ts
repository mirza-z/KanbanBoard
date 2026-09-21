import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { BoardDetailApi } from '../../api-services/boards/board-api.model';
import { BoardApiService } from '../../api-services/boards/board-api-service';

@Component({
  selector: 'app-board-view',
  imports: [],
  templateUrl: './board-view.html',
  styleUrl: './board-view.scss'
})
export class BoardView implements OnInit {
  private route = inject(ActivatedRoute);
  private boardApi = inject(BoardApiService);

  board = signal<BoardDetailApi | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    this.boardApi.getById(id).subscribe({
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
}