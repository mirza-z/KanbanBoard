import { Component, effect, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { GoogleSignin } from '../../core/auth/google-singin';
import { AuthService } from '../../core/auth/auth.service';
import { environment } from '../../../environments/environments';

interface PreviewCard {
  id: string;
  text: string;
  tilt: number;
  hot?: boolean;
}

interface PreviewColumn {
  title: string;
  cards: PreviewCard[];
}

interface PreviewCursor {
  name: string;
  color: string;
  left: string;
  top: string;
}

@Component({
  selector: 'app-landing',
  imports: [GoogleSignin, RouterLink],
  templateUrl: './landing.html',
  styleUrl: './landing.scss'
})
export class Landing {
  readonly demoBoardId = environment.demoBoardId;

  // Static hero board, purely decorative
  readonly columns: PreviewColumn[] = [
    {
      title: 'To do',
      cards: [
        { id: '#014', text: 'Write README with a GIF', tilt: -1.2 },
        { id: '#015', text: 'Configure CORS for production', tilt: 0.8 },
        { id: '#016', text: 'Rotate the database password', tilt: -0.4 }
      ]
    },
    {
      title: 'In progress',
      cards: [
        { id: '#011', text: 'Redesign the landing page', tilt: 1.1, hot: true },
        { id: '#012', text: 'Reset demo board every hour', tilt: -0.9 }
      ]
    },
    {
      title: 'Done',
      cards: [
        { id: '#008', text: 'Google sign-in', tilt: 0.6 },
        { id: '#009', text: 'Live cursors', tilt: -1 },
        { id: '#010', text: 'Drag and drop', tilt: 0.3 }
      ]
    }
  ];

  readonly cursors: PreviewCursor[] = [
    { name: 'John', color: 'var(--teal)', left: '36%', top: '34%' },
    { name: 'Guest 482', color: 'var(--rust)', left: '74%', top: '62%' }
  ];

  constructor() {
    const auth = inject(AuthService);
    const router = inject(Router);
    effect(() => {
      if (auth.isAuthenticated()) router.navigate(['/boards']);
    });
  }
}