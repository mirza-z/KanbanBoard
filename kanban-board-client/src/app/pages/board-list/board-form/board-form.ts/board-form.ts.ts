// pages/board-list/board-form/board-form.ts
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DialogRef } from '@angular/cdk/dialog';

import { HttpErrorResponse } from '@angular/common/http';
import { BoardApiService } from '../../../../api-services/boards/board-api-service';

@Component({
  selector: 'app-board-form',
  imports: [ReactiveFormsModule],
  templateUrl: './board-form.html',
  styleUrl: '../../../../shared/modal/modal.scss'
})
export class BoardForm {
  private fb = inject(FormBuilder);
  private boardApi = inject(BoardApiService);
  dialogRef = inject(DialogRef<string>); // vraća id novog boarda kad se zatvori uspješno

  form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(100)]],
    ownerId: ['', [Validators.required, Validators.maxLength(100)]],
  });

  submitting = signal(false);
  serverErrors = signal<Record<string, string[]> | null>(null);
  conflictMessage = signal<string | null>(null);

  submit() {
    if (this.form.invalid) return;

    this.submitting.set(true);
    this.serverErrors.set(null);
    this.conflictMessage.set(null);

    this.boardApi.create(this.form.getRawValue()).subscribe({
      next: (id) => {
        this.dialogRef.close(id);
      },
      error: (err: HttpErrorResponse) => {
        this.submitting.set(false);
        if (err.status === 400 && err.error?.errors) {
          this.serverErrors.set(err.error.errors);
        } else if (err.status === 409) {
          this.conflictMessage.set('Board sa ovim naslovom i vlasnikom već postoji.');
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