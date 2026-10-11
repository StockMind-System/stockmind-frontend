import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="welcome-chip">Bienvenido a StockMind</div>
    <h2>Tu operación, bajo control.</h2>
    <p class="intro">Ingresa con el correo asignado por tu administrador.</p>

    <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
      <label for="email">Correo electrónico</label>
      <input id="email" type="email" formControlName="email" autocomplete="email" placeholder="nombre@empresa.com">
      @if (form.controls.email.touched && form.controls.email.invalid) {
        <small class="field-error">Ingresa un correo electrónico válido.</small>
      }

      <div class="password-heading">
        <label for="password">Contraseña</label>
        <a class="text-link" routerLink="/auth/recuperar">¿Olvidaste tu contraseña?</a>
      </div>
      <div class="password-field">
        <input id="password" [type]="showPassword() ? 'text' : 'password'" formControlName="password" autocomplete="current-password" placeholder="Ingresa tu contraseña">
        <button type="button" class="visibility-button" (click)="showPassword.update((value) => !value)" [attr.aria-label]="showPassword() ? 'Ocultar contraseña' : 'Mostrar contraseña'" [attr.aria-pressed]="showPassword()">
          @if (showPassword()) {
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 3l18 18M10.6 10.7a2 2 0 0 0 2.7 2.7M9.9 4.2A10.5 10.5 0 0 1 12 4c5.5 0 9 5.1 9 5.1a13.8 13.8 0 0 1-2.2 2.7M6.2 6.2A14.3 14.3 0 0 0 3 9.1S6.5 14.2 12 14.2c1 0 2-.2 2.8-.5"/></svg>
          } @else {
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 12s3.5-5.2 9-5.2 9 5.2 9 5.2-3.5 5.2-9 5.2S3 12 3 12Z"/><circle cx="12" cy="12" r="2.4"/></svg>
          }
        </button>
      </div>
      @if (form.controls.password.touched && form.controls.password.invalid) {
        <small class="field-error">La contraseña es obligatoria.</small>
      }

      @if (error()) { <p class="form-error" role="alert">{{ error() }}</p> }

      <button class="button submit" type="submit" [disabled]="form.invalid || loading()">
        {{ loading() ? 'Ingresando…' : 'Iniciar sesión' }}
      </button>
    </form>

    <div class="access-help">
      <p>¿Necesitas acceso? Contacta al administrador.</p>
      <strong>Acceso por rol · Información protegida</strong>
    </div>
  `,
  styles: [`
    :host{display:block;width:100%}.welcome-chip{width:max-content;max-width:100%;padding:7px 12px;border-radius:7px;color:var(--sm-primary);background:var(--sm-primary-soft);font-size:12px;font-weight:700}h2{margin:clamp(30px,6vh,56px) 0 0;color:var(--sm-text);font-size:clamp(26px,2.4vw,32px);line-height:1.25}.intro{margin:14px 0 0;color:var(--sm-muted);font-size:15px;line-height:1.5}form{display:grid;margin-top:clamp(36px,7vh,70px)}label{color:var(--sm-muted);font-size:13px;font-weight:700}.password-heading{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-top:26px}.text-link{color:var(--sm-primary);font-size:13px;font-weight:700;text-align:right}input{width:100%;height:46px;margin-top:10px;padding:0 14px;border:1px solid var(--sm-border);border-radius:8px;color:var(--sm-text);background:#fff}input::placeholder{color:#91a0a6}.password-field{position:relative}.password-field input{padding-right:54px}.visibility-button{position:absolute;right:3px;bottom:3px;width:40px;height:40px;display:grid;place-items:center;padding:0;border:0;border-radius:7px;color:var(--sm-muted);background:transparent}.visibility-button:hover{color:var(--sm-primary);background:var(--sm-primary-soft)}.visibility-button svg{width:21px;height:21px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}.field-error{margin-top:7px;color:var(--sm-danger)}.form-error{margin:16px 0 0;padding:12px;border-radius:8px;color:var(--sm-danger);background:var(--sm-danger-soft);font-size:13px}.submit{width:100%;margin-top:clamp(34px,6vh,66px)}.access-help{margin-top:clamp(30px,5vh,52px);padding-top:clamp(24px,4vh,38px);border-top:1px solid var(--sm-border)}.access-help p{margin:0;color:var(--sm-muted);font-size:13px}.access-help strong{display:block;margin-top:clamp(22px,4vh,42px);color:var(--sm-primary);font-size:12px}@media(max-width:560px){h2{font-size:26px}.password-heading{align-items:flex-start;flex-direction:column;gap:8px}.text-link{text-align:left}.access-help strong{line-height:1.45}}@media(max-height:820px) and (min-width:1101px){h2{margin-top:28px}form{margin-top:32px}.submit{margin-top:30px}.access-help{margin-top:26px;padding-top:22px}.access-help strong{margin-top:20px}}
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly loading = signal(false);
  readonly error = signal('');
  readonly showPassword = signal(false);
  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set('');
    this.auth.login(this.form.getRawValue()).pipe(finalize(() => this.loading.set(false))).subscribe({
      next: () => void this.router.navigateByUrl(this.route.snapshot.queryParamMap.get('returnUrl') ?? '/dashboard'),
      error: () => this.error.set('No pudimos iniciar sesión. Revisa tus datos e inténtalo nuevamente.'),
    });
  }
}
