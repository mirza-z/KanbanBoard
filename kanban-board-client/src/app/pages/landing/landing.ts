import { Component, effect, inject } from '@angular/core';
import { Router } from '@angular/router';
import { GoogleSignin } from '../../core/auth/google-singin';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-landing',
  imports: [GoogleSignin],
  template: `
    <main class="landing">
      <h1>Kanban Board</h1>
      <app-google-signin />
    </main>
  `
})
export class Landing {
  constructor() {
    const auth = inject(AuthService);
    const router = inject(Router);
    effect(() => {
      if (auth.isAuthenticated()) router.navigate(['/boards']);
    });
  }
}