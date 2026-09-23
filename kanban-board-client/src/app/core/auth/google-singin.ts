import { Component, ElementRef, AfterViewInit, viewChild } from '@angular/core';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environments';

declare const google: any;

@Component({
  selector: 'app-google-signin',
  standalone: true,
  template: `<div #buttonContainer></div>`
})
export class GoogleSignin implements AfterViewInit {
  private buttonContainer = viewChild.required<ElementRef<HTMLDivElement>>('buttonContainer');

  constructor(private auth: AuthService) {}

  ngAfterViewInit(): void {
    google.accounts.id.initialize({
      client_id: environment.googleClientId,
      callback: (response: { credential: string }) => {
        this.auth.loginWithGoogle(response.credential);
      }
    });

    google.accounts.id.renderButton(this.buttonContainer().nativeElement, {
      type: 'standard',
      theme: 'outline',
      size: 'large',
      width: 330
    });
  }
}