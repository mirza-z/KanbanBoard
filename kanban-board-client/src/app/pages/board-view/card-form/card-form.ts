import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { HttpErrorResponse } from '@angular/common/http';
import { CardApiService } from '../../../api-services/cards/card-api-service';


@Component({
  selector: 'app-card-form',
  imports: [ReactiveFormsModule],
  templateUrl: './card-form.html',
  styleUrl: '../../../shared/modal/modal.scss'
})
export class CardForm {
  private fb = inject(FormBuilder);
  private cardApi = inject(CardApiService);
  private data = inject<{ columnId: string }>(DIALOG_DATA);
  dialogRef = inject(DialogRef<string>); // vraća id nove kartice

  form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(100)]],
    description: ['', [Validators.maxLength(500)]],
  });

  submitting = signal(false);
  serverErrors = signal<Record<string, string[]> | null>(null);
  conflictMessage = signal<string | null>(null);

  submit() {
    if (this.form.invalid) return;

    this.submitting.set(true);
    this.serverErrors.set(null);
    this.conflictMessage.set(null);

    const raw = this.form.getRawValue();

    this.cardApi.create({
      title: raw.title,
      description: raw.description || null,
      columnId: this.data.columnId,
    }).subscribe({
      next: (id) => {
        this.dialogRef.close(id);
      },
      error: (err: HttpErrorResponse) => {
        this.submitting.set(false);
        if (err.status === 400 && err.error?.errors) {
          this.serverErrors.set(err.error.errors);
        } else if (err.status === 404) {
          this.conflictMessage.set('Kolona nije pronađena.');
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