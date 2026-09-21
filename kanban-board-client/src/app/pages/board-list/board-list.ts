import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Dialog } from '@angular/cdk/dialog';

import { BoardListItemApi } from '../../api-services/boards/board-api.model';
import { BoardApiService } from '../../api-services/boards/board-api-service';
import { BoardForm } from './board-form/board-form.ts/board-form.ts';


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
    const ref = this.dialog.open<string>(BoardForm);
    ref.closed.subscribe((newId) => {
      if (newId) this.load(); // refetch listu ako je board stvarno kreiran
    });
  }
}