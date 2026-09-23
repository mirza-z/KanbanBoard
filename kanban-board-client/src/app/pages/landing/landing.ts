import { Component, effect, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { GoogleSignin } from '../../core/auth/google-singin';
import { AuthService } from '../../core/auth/auth.service';
import { environment } from '../../../environments/environments';

@Component({
  selector: 'app-landing',
  imports: [GoogleSignin, RouterLink],
  template: `
    <main class="landing">
      <h1>Kanban Board</h1>
      <p>Real-time kolaborativna tabla.</p>
      <app-google-signin />
      <a [routerLink]="['/board', demoBoardId]">Try a demo board</a>
    </main>
  `
})
export class Landing {
  demoBoardId = environment.demoBoardId;

  constructor() {
    const auth = inject(AuthService);
    const router = inject(Router);
    effect(() => {
      if (auth.isAuthenticated()) router.navigate(['/boards']);
    });
  }
}