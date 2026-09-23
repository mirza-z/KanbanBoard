import { Component, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { DialogRef } from '@angular/cdk/dialog';

@Component({
  selector: 'app-guest-name-dialog',
  imports: [ReactiveFormsModule],
  styleUrl: '../modal/modal.scss',
  template: `
    <div class="modal-card">
      <div class="modal-header">
        <h2>Kako da te zovemo?</h2>
      </div>
      <form (submit)="$event.preventDefault(); submit()">
        <div class="field">
          <label for="guestName">Tvoje ime</label>
          <input id="guestName" type="text" [formControl]="name" maxlength="30" cdkFocusInitial />
        </div>
        <div class="modal-actions">
          <button type="button" class="btn-secondary" (click)="skip()">Preskoči</button>
          <button type="submit" class="btn-primary" [disabled]="name.invalid">Uđi</button>
        </div>
      </form>
    </div>
  `
})
export class GuestNameDialog {
  private dialogRef = inject(DialogRef<string | undefined>);
  name = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.maxLength(30)]
  });

  submit() {
    const value = this.name.value.trim();
    if (value) this.dialogRef.close(value);
  }

  skip() {
    this.dialogRef.close();
  }
}