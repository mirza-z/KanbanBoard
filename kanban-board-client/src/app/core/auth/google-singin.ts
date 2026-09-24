import { Component, ElementRef, AfterViewInit, OnDestroy, viewChild } from '@angular/core';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environments';

declare const google: any;

@Component({
  selector: 'app-google-signin',
  standalone: true,
  template: `<div #buttonContainer class="gsi-container"></div>`,
  styles: [`
    :host { display: block; width: 100%; }
    .gsi-container { width: 100%; min-height: 44px; }
  `]
})
export class GoogleSignin implements AfterViewInit, OnDestroy {
  private buttonContainer = viewChild.required<ElementRef<HTMLDivElement>>('buttonContainer');

  private resizeObserver?: ResizeObserver;
  private lastWidth = 0;
  private resizeTimer?: ReturnType<typeof setTimeout>;

  constructor(private auth: AuthService) {}

  ngAfterViewInit(): void {
    google.accounts.id.initialize({
      client_id: environment.googleClientId,
      callback: (response: { credential: string }) => {
        this.auth.loginWithGoogle(response.credential);
      }
    });

    const el = this.buttonContainer().nativeElement;
    this.render(el);

    this.resizeObserver = new ResizeObserver(() => {
      clearTimeout(this.resizeTimer);
      this.resizeTimer = setTimeout(() => this.render(el), 150);
    });
    this.resizeObserver.observe(el);
  }

  private render(el: HTMLDivElement): void {
    // GSI dozvoljava širinu od 200 do 400 px
    const width = Math.max(200, Math.min(400, Math.floor(el.clientWidth)));
    if (width === this.lastWidth) return;
    this.lastWidth = width;

    google.accounts.id.renderButton(el, {
      type: 'standard',
      theme: 'outline',
      size: 'large',
      width
    });
  }

  ngOnDestroy(): void {
    clearTimeout(this.resizeTimer);
    this.resizeObserver?.disconnect();
  }
}