import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="welcome-chip">Bienvenido a StockMind</div>

    @if (!submitted()) {
      <h2>Recupera tu acceso.</h2>
      <p class="intro">Te enviaremos las instrucciones a tu correo.</p>

      <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
        <label for="recovery-email">Correo electrónico</label>
        <input id="recovery-email" type="email" formControlName="email" autocomplete="email" placeholder="nombre@empresa.com">
        @if (form.controls.email.touched && form.controls.email.invalid) {
          <small class="field-error">Ingresa un correo electrónico válido.</small>
        }

        <button class="button submit" type="submit">Enviar enlace de recuperación</button>
        <p class="privacy-note">Si el correo está registrado, recibirás un enlace seguro.</p>
      </form>
    } @else {
      <div class="success-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24"><path d="m5 12 4 4L19 6"/></svg>
      </div>
      <h2>Revisa tu correo.</h2>
      <p class="intro">Si <strong>{{ form.controls.email.value }}</strong> está registrado, recibirás instrucciones para restablecer tu contraseña.</p>
      <button class="resend" type="button" (click)="submitted.set(false)">Usar otro correo</button>
    }

    <a class="back-link" routerLink="/auth/login">
      <span aria-hidden="true">←</span> Volver al inicio de sesión
    </a>
  `,
  styles: [`
    :host{display:block;width:100%}.welcome-chip{width:max-content;max-width:100%;padding:7px 12px;border-radius:7px;color:var(--sm-primary);background:var(--sm-primary-soft);font-size:12px;font-weight:700}h2{margin:clamp(34px,7vh,62px) 0 0;color:var(--sm-text);font-size:clamp(26px,2.4vw,32px);line-height:1.25}.intro{margin:14px 0 0;color:var(--sm-muted);font-size:15px;line-height:1.55}.intro strong{color:var(--sm-text)}form{display:grid;margin-top:clamp(40px,8vh,76px)}label{color:var(--sm-muted);font-size:13px;font-weight:700}input{width:100%;height:46px;margin-top:10px;padding:0 14px;border:1px solid var(--sm-border);border-radius:8px;color:var(--sm-text);background:#fff}input::placeholder{color:#91a0a6}.field-error{margin-top:7px;color:var(--sm-danger)}.submit{width:100%;margin-top:32px}.privacy-note{margin:16px 0 0;color:var(--sm-muted);font-size:12px}.back-link{min-height:42px;display:flex;align-items:center;justify-content:center;gap:8px;margin-top:clamp(46px,9vh,88px);border:1px solid var(--sm-border);border-radius:8px;color:var(--sm-text);font-size:14px;font-weight:700}.back-link:hover{border-color:var(--sm-primary);color:var(--sm-primary);background:var(--sm-primary-soft)}.success-icon{width:56px;height:56px;display:grid;place-items:center;margin-top:clamp(44px,8vh,78px);border-radius:50%;color:var(--sm-success);background:var(--sm-success-soft)}.success-icon svg{width:28px;height:28px;fill:none;stroke:currentColor;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}.resend{margin-top:28px;padding:0;border:0;color:var(--sm-primary);background:transparent;font-weight:700}@media(max-width:560px){h2{font-size:26px}.back-link{margin-top:42px}}@media(max-height:820px) and (min-width:1101px){h2{margin-top:30px}form{margin-top:36px}.back-link{margin-top:38px}.success-icon{margin-top:36px}}
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ForgotPasswordComponent {
  private readonly formBuilder = inject(FormBuilder);
  readonly submitted = signal(false);
  readonly form = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitted.set(true);
  }
}
