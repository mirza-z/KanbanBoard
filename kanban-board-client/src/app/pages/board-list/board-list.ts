import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Dialog } from '@angular/cdk/dialog';

import { BoardListItemApi } from '../../api-services/boards/board-api.model';
import { BoardApiService } from '../../api-services/boards/board-api-service';
import { BoardForm } from './board-form/board-form';
import { ConfirmDialog } from '../../shared/confirm-dialog/confirm-dialog';
import { GoogleSignin } from '../../core/auth/google-singin';
import { AuthService } from '../../core/auth/auth.service';
import { DatePipe } from '@angular/common';


@Component({
  selector: 'app-board-list',
  imports: [RouterLink,  DatePipe],
  templateUrl: './board-list.html',
  styleUrl: './board-list.scss'
})
export class BoardList implements OnInit {
  private boardApi = inject(BoardApiService);
  private dialog = inject(Dialog);
  private auth = inject(AuthService);
  private router = inject(Router);
  user = this.auth.user;

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
        this.error.set('Failed to load boards.');
        this.loading.set(false);
      }
    });
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/']);
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
    event.stopPropagation(); 
    event.preventDefault();

    const ref = this.dialog.open<boolean>(ConfirmDialog, {
      data: {
        title: 'Delete board',
        message: 'This will permanently delete the board and all its columns and cards. Are you sure?'
      }
    });

    ref.closed.subscribe((confirmed) => {
      if (!confirmed) return;

      this.boardApi.delete(boardId).subscribe({
        next: () => this.load(),
        error: () => alert('Delete failed. Please try again.')
      });
    });
  }
}