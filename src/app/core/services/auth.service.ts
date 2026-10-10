import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User, UserRole } from '../models/user.model';
import { StorageService } from './storage.service';

interface AuthSession { accessToken: string; expiresAtUtc: string; user: User; }

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly storage = inject(StorageService);
  private readonly sessionKey = 'stockmind.session';
  private readonly session = signal<AuthSession | null>(this.storage.get<AuthSession>(this.sessionKey));
  readonly user = computed(() => this.session()?.user ?? null);
  readonly isAuthenticated = computed(() => Boolean(this.session()?.accessToken));
  get token(): string | null { return this.session()?.accessToken ?? null; }
  login(credentials: { email: string; password: string }) {
    return this.http.post<AuthSession>(`${environment.apiUrl}/auth/login`, credentials).pipe(
      tap((session) => { this.storage.set(this.sessionKey, session); this.session.set(session); }),
    );
  }
  logout(): void { this.storage.remove(this.sessionKey); this.session.set(null); }
  hasAnyRole(roles: UserRole[]): boolean { return Boolean(this.user()?.roles.some((role) => roles.includes(role))); }
}
