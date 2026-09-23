import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthUser, GoogleLoginResponse } from './auth.model';
import { environment } from '../../../environments/environments';

const STORAGE_KEY = 'kanban_auth';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly _user = signal<AuthUser | null>(this.loadStoredUser());
  private readonly _token = signal<string | null>(localStorage.getItem(STORAGE_KEY + '_token'));

  readonly user = this._user.asReadonly();
  readonly isAuthenticated = computed(() => this._token() !== null);

  constructor(private http: HttpClient) {}

  loginWithGoogle(idToken: string) {
    return this.http
      .post<GoogleLoginResponse>(`${environment.apiUrl}/auth/google-login`, { idToken })
      .subscribe({
        next: (res) => this.setSession(res),
        error: (err) => console.error('Google login failed', err)
      });
  }

  logout(): void {
    this._token.set(null);
    this._user.set(null);
    localStorage.removeItem(STORAGE_KEY + '_token');
    localStorage.removeItem(STORAGE_KEY + '_user');
  }

  getToken(): string | null {
    return this._token();
  }

  private setSession(res: GoogleLoginResponse): void {
    const user: AuthUser = { ownerId: res.ownerId, email: res.email, name: res.name };
    this._token.set(res.token);
    this._user.set(user);
    localStorage.setItem(STORAGE_KEY + '_token', res.token);
    localStorage.setItem(STORAGE_KEY + '_user', JSON.stringify(user));
  }

  private loadStoredUser(): AuthUser | null {
    const raw = localStorage.getItem(STORAGE_KEY + '_user');
    return raw ? JSON.parse(raw) : null;
  }
}