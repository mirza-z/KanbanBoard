import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { HttpErrorResponse } from '@angular/common/http';
import { ColumnApiService } from '../../../api-services/columns/column-api-service';


export interface ColumnFormData {
  boardId: string;
  column?: {
    id: string;
    title: string;
  };
}

@Component({
  selector: 'app-column-form',
  imports: [ReactiveFormsModule],
  templateUrl: './column-form.html',
  styleUrl: '../../../shared/modal/modal.scss'
})
export class ColumnForm {
  private fb = inject(FormBuilder);
  private columnApi = inject(ColumnApiService);
  data = inject<ColumnFormData>(DIALOG_DATA);
  dialogRef = inject(DialogRef<string | undefined>);

  isEditMode = !!this.data.column;

  form = this.fb.nonNullable.group({
    title: [this.data.column?.title ?? '', [Validators.required, Validators.maxLength(100)]],
  });

  submitting = signal(false);
  serverErrors = signal<Record<string, string[]> | null>(null);
  conflictMessage = signal<string | null>(null);

  submit() {
    if (this.form.invalid) return;

    this.submitting.set(true);
    this.serverErrors.set(null);
    this.conflictMessage.set(null);

    const title = this.form.getRawValue().title;

    if (this.isEditMode) {
      const column = this.data.column!;
      this.columnApi.update(column.id, { title }).subscribe({
        next: () => this.dialogRef.close(column.id),
        error: (err: HttpErrorResponse) => this.handleError(err)
      });
    } else {
      this.columnApi.create({ title, boardId: this.data.boardId }).subscribe({
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
      this.conflictMessage.set('A column with this title already exists on this board.');
    } else if (err.status === 404) {
      this.conflictMessage.set('Board not found.');
    } else {
      this.conflictMessage.set('Something went wrong. Please try again.');
    }
  }

  close() {
    this.dialogRef.close();
  }
}