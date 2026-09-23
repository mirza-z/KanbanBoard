import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { HttpErrorResponse } from '@angular/common/http';
import { BoardApiService } from '../../../api-services/boards/board-api-service';

export interface BoardFormData {
  board?: {
    id: string;
    title: string;
  };
}

@Component({
  selector: 'app-board-form',
  imports: [ReactiveFormsModule],
  templateUrl: './board-form.html',
  styleUrl: '../../../shared/modal/modal.scss'
})
export class BoardForm {
  private fb = inject(FormBuilder);
  private boardApi = inject(BoardApiService);
  data = inject<BoardFormData>(DIALOG_DATA, { optional: true }) ?? {};
  dialogRef = inject(DialogRef<string | undefined>);

  isEditMode = !!this.data.board;

  form = this.fb.nonNullable.group({
    title: [this.data.board?.title ?? '', [Validators.required, Validators.maxLength(100)]],
  });

  submitting = signal(false);
  serverErrors = signal<Record<string, string[]> | null>(null);
  conflictMessage = signal<string | null>(null);

  submit() {
    if (this.form.invalid) return;

    this.submitting.set(true);
    this.serverErrors.set(null);
    this.conflictMessage.set(null);

    const { title } = this.form.getRawValue();

    if (this.isEditMode) {
      const board = this.data.board!;
      this.boardApi.update(board.id, { title }).subscribe({
        next: () => this.dialogRef.close(board.id),
        error: (err: HttpErrorResponse) => this.handleError(err)
      });
    } else {
      this.boardApi.create({ title }).subscribe({
        next: (id) => this.dialogRef.close(id),
        error: (err: HttpErrorResponse) => this.handleError(err)
      });
    }
  }


  private handleError(err: HttpErrorResponse) {
    this.submitting.set(false);
    if (err.status === 400 && err.error?.errors) {
      this.serverErrors.set(err.error.errors);
    } else if (err.status === 409) {
      this.conflictMessage.set('Board sa ovim naslovom već postoji.');
    } else if (err.status === 403) {
      this.conflictMessage.set('Samo vlasnik može mijenjati ovaj board.');
    } else {
      this.conflictMessage.set('Nešto je pošlo po zlu. Pokušaj ponovo.');
    }
  }

  close() {
    this.dialogRef.close();
  }
}