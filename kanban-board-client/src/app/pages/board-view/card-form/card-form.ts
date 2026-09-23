import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { HttpErrorResponse } from '@angular/common/http';
import { CardApiService } from '../../../api-services/cards/card-api-service';


export interface CardFormData {
  columnId: string;       // uvijek treba, za create i kontekst
  card?: {                // prisutno samo u edit modu
    id: string;
    title: string;
    description: string | null;
    version: number;
  };
}

@Component({
  selector: 'app-card-form',
  imports: [ReactiveFormsModule],
  templateUrl: './card-form.html',
  styleUrl: '../../../shared/modal/modal.scss'
})
export class CardForm {
  private fb = inject(FormBuilder);
  private cardApi = inject(CardApiService);
  data = inject<CardFormData>(DIALOG_DATA);
  dialogRef = inject(DialogRef<{ id: string; version?: number } | undefined>);

  isEditMode = !!this.data.card;

  form = this.fb.nonNullable.group({
    title: [this.data.card?.title ?? '', [Validators.required, Validators.maxLength(100)]],
    description: [this.data.card?.description ?? '', [Validators.maxLength(500)]],
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

    if (this.isEditMode) {
      const card = this.data.card!;
      this.cardApi.update(card.id, {
        title: raw.title,
        description: raw.description || null,
        version: card.version,
      }).subscribe({
        next: (newVersion) => {
          this.dialogRef.close({ id: card.id, version: newVersion });
        },
        error: (err: HttpErrorResponse) => this.handleError(err)
      });
    } else {
      this.cardApi.create({
        title: raw.title,
        description: raw.description || null,
        columnId: this.data.columnId,
      }).subscribe({
        next: (id) => {
          this.dialogRef.close({ id });
        },
        error: (err: HttpErrorResponse) => this.handleError(err)
      });
    }
  }

  private handleError(err: HttpErrorResponse) {
    this.submitting.set(false);
    if (err.status === 400 && err.error?.errors) {
      this.serverErrors.set(err.error.errors);
    } else if (err.status === 409) {
      this.conflictMessage.set('This card was changed by someone else in the meantime. Close the form and refresh the board.');
    } else if (err.status === 404) {
      this.conflictMessage.set('Card or column not found.');
    } else {
      this.conflictMessage.set('Something went wrong. Please try again.');
    }
  }

  close() {
    this.dialogRef.close();
  }
}