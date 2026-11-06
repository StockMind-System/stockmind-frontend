import { effect, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService, AuthSession, LogoutReason } from './auth.service';

@Injectable({ providedIn: 'root' })
export class SessionActivityService {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly renewalThrottleMilliseconds = 60 * 1000;
  private initialized = false;
  private renewalInFlight = false;
  private signingOut = false;
  private lastRenewalAt = 0;
  private lastActivityRecordedAt = 0;
  private warningTimer: number | null = null;
  private expirationTimer: number | null = null;
  readonly showInactivityWarning = signal(false);

  constructor() {
    effect(() => {
      const session = this.auth.currentSession();
      this.clearTimers();
      this.showInactivityWarning.set(false);
      if (session) this.scheduleSessionTimers(session);
    });
  }

  start(): void {
    if (this.initialized) return;
    this.initialized = true;

    const activityOptions: AddEventListenerOptions = { passive: true };
    for (const eventName of ['pointerdown', 'pointermove', 'keydown', 'scroll', 'touchstart']) {
      window.addEventListener(eventName, this.handleActivity, activityOptions);
    }
    document.addEventListener('visibilitychange', this.handleVisibilityChange);
    window.addEventListener('storage', this.handleStorageChange);
  }

  continueSession(): void { this.requestRenewal(true); }

  closeVoluntarily(): void { this.closeSession('Voluntary'); }

  private readonly handleActivity = (): void => {
    if (!this.auth.isAuthenticated() || this.signingOut) return;
    if (this.showInactivityWarning()) return;

    this.requestRenewal(false);
  };

  private requestRenewal(force: boolean): void {
    if (!this.auth.isAuthenticated() || this.signingOut) return;

    const now = Date.now();
    if (now - this.lastActivityRecordedAt < 1000) return;
    this.lastActivityRecordedAt = now;
    if ((!force && now - this.lastRenewalAt < this.renewalThrottleMilliseconds) || this.renewalInFlight) return;

    this.lastRenewalAt = now;
    this.renewalInFlight = true;
    this.auth.recordActivity().pipe(
      finalize(() => { this.renewalInFlight = false; }),
    ).subscribe({ error: () => undefined });
  }

  private readonly handleVisibilityChange = (): void => {
    if (document.visibilityState === 'visible') this.handleActivity();
  };

  private readonly handleStorageChange = (event: StorageEvent): void => {
    if (event.key === this.auth.sessionStorageKey) {
      this.auth.syncFromStorage();
      if (!this.auth.isAuthenticated()) void this.router.navigate(['/auth/login']);
    }
  };

  private scheduleSessionTimers(session: AuthSession): void {
    const now = Date.now();
    const warningAt = Date.parse(session.inactivityWarningAtUtc);
    const idleExpiration = Date.parse(session.idleExpiresAtUtc);
    const tokenExpiration = Date.parse(session.expiresAtUtc);
    const absoluteExpiration = Date.parse(session.absoluteExpiresAtUtc);
    const expiresAt = Math.min(idleExpiration, tokenExpiration, absoluteExpiration);

    if (![warningAt, expiresAt].every(Number.isFinite)) {
      this.auth.expireSession();
      return;
    }

    if (warningAt <= now) {
      this.showInactivityWarning.set(true);
    } else {
      this.warningTimer = window.setTimeout(
        () => this.showInactivityWarning.set(true),
        warningAt - now,
      );
    }

    this.expirationTimer = window.setTimeout(
      () => this.closeSession('Inactivity'),
      Math.max(0, expiresAt - now),
    );
  }

  private clearTimers(): void {
    if (this.warningTimer !== null) window.clearTimeout(this.warningTimer);
    if (this.expirationTimer !== null) window.clearTimeout(this.expirationTimer);
    this.warningTimer = null;
    this.expirationTimer = null;
  }

  private closeSession(reason: LogoutReason): void {
    if (this.signingOut || !this.auth.isAuthenticated()) return;
    this.signingOut = true;
    this.auth.logout(reason).pipe(
      finalize(() => {
        this.clearTimers();
        this.showInactivityWarning.set(false);
        this.signingOut = false;
        const navigation = reason === 'Inactivity'
          ? { queryParams: { reason: 'inactivity' } }
          : undefined;
        void this.router.navigate(['/auth/login'], navigation);
      }),
    ).subscribe({ error: () => undefined });
  }
}
