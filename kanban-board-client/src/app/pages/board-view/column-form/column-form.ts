import { Component, inject, input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { HttpErrorResponse } from '@angular/common/http';
import { ColumnApiService } from '../../../api-services/columns/column-api-service';


@Component({
  selector: 'app-column-form',
  imports: [ReactiveFormsModule],
  templateUrl: './column-form.html',
  styleUrl: '../../../shared/modal/modal.scss'
})
export class ColumnForm {
  private fb = inject(FormBuilder);
  private columnApi = inject(ColumnApiService);
  private data = inject<{ boardId: string }>(DIALOG_DATA);
  dialogRef = inject(DialogRef<string>); // vraća id nove kolone

  form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(100)]],
  });

  submitting = signal(false);
  serverErrors = signal<Record<string, string[]> | null>(null);
  conflictMessage = signal<string | null>(null);

  submit() {
    if (this.form.invalid) return;

    this.submitting.set(true);
    this.serverErrors.set(null);
    this.conflictMessage.set(null);

    this.columnApi.create({
      title: this.form.getRawValue().title,
      boardId: this.data.boardId,
    }).subscribe({
      next: (id) => {
        this.dialogRef.close(id);
      },
      error: (err: HttpErrorResponse) => {
        this.submitting.set(false);
        if (err.status === 400 && err.error?.errors) {
          this.serverErrors.set(err.error.errors);
        } else if (err.status === 409) {
          this.conflictMessage.set('Kolona sa ovim naslovom već postoji na ovom boardu.');
        } else if (err.status === 404) {
          this.conflictMessage.set('Board nije pronađen.');
        } else {
          this.conflictMessage.set('Nešto je pošlo po zlu. Pokušaj ponovo.');
        }
      }
    });
  }

  close() {
    this.dialogRef.close();
  }
}