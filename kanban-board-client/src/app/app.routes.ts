import { Routes } from '@angular/router';
import { BoardList } from './pages/board-list/board-list';
import { BoardView } from './pages/board-view/board-view';

export const routes: Routes = [
  { path: '', redirectTo: 'boards', pathMatch: 'full' },
  { path: 'boards', component: BoardList },
  { path: 'board/:id', component: BoardView },
];