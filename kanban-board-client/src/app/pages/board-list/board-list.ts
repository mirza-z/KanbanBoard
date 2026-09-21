import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { BoardListItemApi } from '../../api-services/boards/board-api.model';
import { BoardApiService } from '../../api-services/boards/board-api-service';

@Component({
  selector: 'app-board-list',
  imports: [RouterLink],
  templateUrl: './board-list.html',
  styleUrl: './board-list.scss'
})
export class BoardList implements OnInit {
  private boardApi = inject(BoardApiService);

  boards = signal<BoardListItemApi[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  ngOnInit() {
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
}