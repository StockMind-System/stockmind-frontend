import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-login', standalone: true, imports: [ReactiveFormsModule],
  template: `<form [formGroup]="form" (ngSubmit)="submit()"><h2>Iniciar sesión</h2><label>Correo<input type="email" formControlName="email"></label><label>Contraseña<input type="password" formControlName="password"></label>@if(error()){<p class="error">{{error()}}</p>}<button [disabled]="form.invalid || loading()">{{loading() ? 'Ingresando…' : 'Ingresar'}}</button></form>`,
  styles: [`form,label{display:grid;gap:.6rem}form{gap:1rem}input,button{padding:.75rem;border:1px solid #dce1ea;border-radius:.45rem}button{color:white;background:#304ffe;cursor:pointer}.error{color:#c62828}`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder); private readonly auth = inject(AuthService);
  private readonly router = inject(Router); private readonly route = inject(ActivatedRoute);
  readonly loading = signal(false); readonly error = signal('');
  readonly form = this.fb.nonNullable.group({ email: ['', [Validators.required, Validators.email]], password: ['', Validators.required] });
  submit(): void {
    if (this.form.invalid) return;
    this.loading.set(true); this.error.set('');
    this.auth.login(this.form.getRawValue()).pipe(finalize(() => this.loading.set(false))).subscribe({
      next: () => void this.router.navigateByUrl(this.route.snapshot.queryParamMap.get('returnUrl') ?? '/dashboard'),
      error: () => this.error.set('No se pudo iniciar sesión.'),
    });
  }
}
