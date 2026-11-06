import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { finalize, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User, UserRole } from '../models/user.model';
import { StorageService } from './storage.service';

export interface AuthSession {
  accessToken: string;
  expiresAtUtc: string;
  idleExpiresAtUtc: string;
  absoluteExpiresAtUtc: string;
  inactivityWarningAtUtc: string;
  user: User;
}

export type LogoutReason = 'Voluntary' | 'Inactivity';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly storage = inject(StorageService);
  readonly sessionStorageKey = 'stockmind.session';
  private readonly session = signal<AuthSession | null>(this.loadSession());
  readonly user = computed(() => this.session()?.user ?? null);
  readonly currentSession = this.session.asReadonly();
  readonly isAuthenticated = computed(() => Boolean(this.session()?.accessToken));
  get token(): string | null { return this.session()?.accessToken ?? null; }
  login(credentials: { email: string; password: string }) {
    return this.http.post<AuthSession>(`${environment.apiUrl}/auth/login`, credentials).pipe(
      tap((session) => {
        this.storeSession(session);
      }),
    );
  }
  logout(reason: LogoutReason = 'Voluntary') {
    return this.http.post<void>(`${environment.apiUrl}/auth/logout`, { reason }).pipe(
      finalize(() => this.expireSession()),
    );
  }
  recordActivity() {
    const tokenBeingRenewed = this.token;
    return this.http.post<AuthSession>(`${environment.apiUrl}/auth/activity`, {}).pipe(
      tap((session) => {
        if (this.token === tokenBeingRenewed) this.storeSession(session);
      }),
    );
  }
  expireSession(): void {
    this.storage.remove(this.sessionStorageKey);
    this.session.set(null);
  }
  syncFromStorage(): void { this.session.set(this.loadSession()); }
  hasAnyRole(roles: UserRole[]): boolean { return Boolean(this.user()?.roles.some((role) => roles.includes(role))); }

  private loadSession(): AuthSession | null {
    const session = this.storage.get<AuthSession>(this.sessionStorageKey);
    if (!session?.accessToken ||
        !session.expiresAtUtc ||
        !session.idleExpiresAtUtc ||
        !session.absoluteExpiresAtUtc ||
        !session.inactivityWarningAtUtc) return null;
    const tokenExpiration = Date.parse(session.expiresAtUtc);
    if (!Number.isFinite(tokenExpiration) || tokenExpiration <= Date.now()) {
      this.storage.remove(this.sessionStorageKey);
      return null;
    }
    return session;
  }

  private storeSession(session: AuthSession): void {
    this.storage.set(this.sessionStorageKey, session);
    this.session.set(session);
  }
}
