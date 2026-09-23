import { Routes } from '@angular/router';
import { BoardList } from './pages/board-list/board-list';
import { BoardView } from './pages/board-view/board-view';
import { Landing } from './pages/landing/landing';
import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  { path: '', component: Landing, pathMatch: 'full' },
  { path: 'boards', component: BoardList, canActivate: [authGuard] },
  { path: 'board/:id', component: BoardView },   // otvoreno, share link
  { path: '**', redirectTo: '' },
];