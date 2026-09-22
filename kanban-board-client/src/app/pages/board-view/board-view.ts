import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Dialog } from '@angular/cdk/dialog';

import { BoardDetailApi } from '../../api-services/boards/board-api.model';

import { ColumnForm } from './column-form/column-form';
import { BoardApiService } from '../../api-services/boards/board-api-service';
import { CardForm } from './card-form/card-form';
import { CardApiService } from '../../api-services/cards/card-api-service';
import { ColumnApiService } from '../../api-services/columns/column-api-service';
import { ConfirmDialog } from '../../shared/confirm-dialog/confirm-dialog';
import { CardApi } from '../../api-services/cards/card-api-model';
import { ColumnApi } from '../../api-services/columns/column-api-model';
import { DatePipe, UpperCasePipe } from '@angular/common';

// hasConflict nije (još) dio backend CardApi modela — čisto lokalno/UI polje,
// popuniš ga kad dodaš SignalR/refetch logiku za konflikte.
type CardWithConflict = CardApi & { hasConflict?: boolean };
type ColumnWithConflictCards = Omit<ColumnApi, 'cards'> & { cards: CardWithConflict[] };
type BoardViewModel = Omit<BoardDetailApi, 'columns'> & { columns: ColumnWithConflictCards[] };

@Component({
  selector: 'app-board-view',
  imports: [RouterLink,DatePipe, UpperCasePipe],
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
  board = signal<BoardViewModel | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;
    this.boardId = id;
    this.load();
  }

  tiltFor(id: string): number {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
    }
    return ((hash % 300) / 100) - 1.5;
  }

  load() {
    this.loading.set(true);
    this.boardApi.getById(this.boardId).subscribe({
      next: (board) => {
        // hasConflict inicijalno false dok se ne doda stvarna detekcija
        const withConflict: BoardViewModel = {
          ...board,
          columns: board.columns.map(col => ({
            ...col,
            cards: col.cards.map(card => ({ ...card, hasConflict: false }))
          }))
        };
        this.board.set(withConflict);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Board nije pronađen.');
        this.loading.set(false);
      }
    });
  }

  // Jedna metoda za create (column = null) i edit (postojeća kolona)
  openColumnForm(column: ColumnApi | null) {
    const ref = this.dialog.open<string | undefined>(ColumnForm, {
      data: column ? { boardId: this.boardId, column } : { boardId: this.boardId }
    });
    ref.closed.subscribe((result) => {
      if (result) this.load();
    });
  }

  confirmDeleteColumn(column: ColumnApi) {
    const ref = this.dialog.open<boolean>(ConfirmDialog, {
      data: {
        title: 'Obriši kolonu',
        message: 'Ovo će obrisati i sve kartice unutar kolone. Da li si siguran?'
      }
    });

    ref.closed.subscribe((confirmed) => {
      if (!confirmed) return;

      this.columnApi.delete(column.id).subscribe({
        next: () => this.load(),
        error: () => alert('Brisanje nije uspjelo. Pokušaj ponovo.')
      });
    });
  }

  // Jedna metoda za create (card = null) i edit (postojeća kartica)
  openCardForm(card: CardWithConflict | null, column: ColumnApi) {
    const ref = this.dialog.open<{ id: string; version?: number } | undefined>(CardForm, {
      data: card ? { columnId: column.id, card } : { columnId: column.id }
    });
    ref.closed.subscribe((result) => {
      if (result) this.load();
    });
  }

  confirmDeleteCard(card: CardWithConflict, event: Event) {
    event.stopPropagation(); // spriječi da klik na ✕ otvori i formu ispod

    const ref = this.dialog.open<boolean>(ConfirmDialog, {
      data: {
        title: 'Obriši karticu',
        message: 'Da li si siguran da želiš obrisati ovu karticu?'
      }
    });

    ref.closed.subscribe((confirmed) => {
      if (!confirmed) return;

      this.cardApi.delete(card.id).subscribe({
        next: () => this.load(),
        error: () => alert('Brisanje nije uspjelo. Pokušaj ponovo.')
      });
    });
  }
}