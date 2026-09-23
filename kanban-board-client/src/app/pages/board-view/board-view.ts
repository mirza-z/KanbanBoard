import { Component, ElementRef, OnInit, afterNextRender, effect, inject, signal, viewChild } from '@angular/core';
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
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { BoardHubService } from '../../api-services/shared/board-hub.service';
import { fromEvent } from 'rxjs';
import { sampleTime, map } from 'rxjs/operators';
import { AuthService } from '../../core/auth/auth.service';
import { GuestNameDialog } from '../../shared/guest-name-dialog/guest-name-dialog';

// hasConflict nije (još) dio backend CardApi modela — čisto lokalno/UI polje,
// popuniš ga kad dodaš SignalR/refetch logiku za konflikte.
type CardWithConflict = CardApi & { hasConflict?: boolean };
type ColumnWithConflictCards = Omit<ColumnApi, 'cards'> & { cards: CardWithConflict[] };
type BoardViewModel = Omit<BoardDetailApi, 'columns'> & { columns: ColumnWithConflictCards[] };

@Component({
  selector: 'app-board-view',
  imports: [RouterLink,DatePipe, UpperCasePipe, DragDropModule],
  templateUrl: './board-view.html',
  styleUrl: './board-view.scss'
})
export class BoardView implements OnInit {
  private route = inject(ActivatedRoute);
  private boardApi = inject(BoardApiService);
  private dialog = inject(Dialog);
  private columnApi = inject(ColumnApiService);
  private cardApi = inject(CardApiService);
  boardHub = inject(BoardHubService);
  private boardContainerRef = viewChild.required<ElementRef<HTMLElement>>('boardContainer');
  private auth = inject(AuthService);
  private destroyed = false;

  boardId = '';
  board = signal<BoardViewModel | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);
  reorderMode = signal(false);

  linkCopied = signal(false);

    constructor() {
    effect(() => {
      const changeCount = this.boardHub.boardChanged();
      if (changeCount > 0) {
        this.load();
      }
    });
    afterNextRender(() => {
      this.setupCursorTracking();
    });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;
    this.boardId = id;
    this.load();
    this.joinHub();
  }

  ngOnDestroy() {
      this.destroyed = true;
      this.boardHub.disconnect();
    }

    private joinHub() {
    if (this.auth.isAuthenticated() || this.boardHub.getGuestName()) {
      this.boardHub.connect(this.boardId);
      return;
    }

    const ref = this.dialog.open<string>(GuestNameDialog, { disableClose: true });
    ref.closed.subscribe((name) => {
      if (this.destroyed) return; 
      if (name) this.boardHub.setGuestName(name);
      this.boardHub.connect(this.boardId);
    });
  }

  private setupCursorTracking() {
  const container = this.boardContainerRef().nativeElement as HTMLElement;

  fromEvent<MouseEvent>(container, 'mousemove')
    .pipe(
      sampleTime(50),
      map(event => {
        const rect = container.getBoundingClientRect();
        return {
          x: (event.clientX - rect.left) / rect.width,
          y: (event.clientY - rect.top) / rect.height,
        };
      })
    )
    .subscribe(({ x, y }) => {
      this.boardHub.updateCursorPosition(this.boardId, x, y);
    });
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

  onCardDropped(event: CdkDragDrop<CardWithConflict[]>, targetColumn: ColumnWithConflictCards) {
  const card = event.item.data as CardWithConflict;

  // Isti container = samo reordering unutar iste kolone
  if (event.previousContainer === event.container) {
    if (event.previousIndex === event.currentIndex) return; // nije se pomjerila
    moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
  } else {
    // Prebacivanje u drugu kolonu
    transferArrayItem(
      event.previousContainer.data,
      event.container.data,
      event.previousIndex,
      event.currentIndex
    );
  }

  // board() signal treba novi objekat da Angular primijeti promjenu (immutability)
  this.board.update(b => b ? { ...b } : b);

  this.cardApi.move(card.id, {
      targetColumnId: targetColumn.id,
      targetIndex: event.currentIndex,
      version: card.version
    }).subscribe({
      next: (response) => {
        card.version = response.version;
        card.hasConflict = false;
        this.board.update(b => b ? { ...b } : b);
      },
      error: (err) => {
        if (err.status === 409) {
          card.hasConflict = true;
        }
        this.load();
      }
    });
  }

  startReorder() {
    this.reorderMode.set(true);
  }

  cancelReorder() {
    this.reorderMode.set(false);
    this.load();
  }

  confirmReorder() {
    const b = this.board();
    if (!b) return;
    const columnIds = b.columns.map(c => c.id);

    this.boardApi.reorderColumns(this.boardId, columnIds).subscribe({
      next: () => this.reorderMode.set(false),
      error: () => {
        alert('Reorder nije uspio. Pokušaj ponovo.');
        this.reorderMode.set(false);
        this.load();
      }
    });
  }

  onColumnDropped(event: CdkDragDrop<ColumnWithConflictCards[]>) {
    if (event.previousIndex === event.currentIndex) return;
    moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    this.board.update(b => b ? { ...b } : b);
  }

  async copyShareLink() {
    const url = `${location.origin}/board/${this.boardId}`;
    try {
      await navigator.clipboard.writeText(url);
      this.linkCopied.set(true);
      setTimeout(() => this.linkCopied.set(false), 2000);
    } catch {
      // clipboard API nije dostupan (npr. nesiguran kontekst), prikaži link ručno
      prompt('Kopiraj link:', url);
    }
  }
}