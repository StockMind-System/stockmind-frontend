import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar', standalone: true,
  template: `<header><strong>StockMind</strong><span></span><small>{{ auth.user()?.name ?? 'Usuario' }}</small><button type="button" (click)="logout()">Salir</button></header>`,
  styles: [`header{height:64px;display:flex;align-items:center;gap:1rem;padding:0 1.5rem;color:#fff;background:#172033}span{flex:1}button{border:0;border-radius:.4rem;padding:.45rem .8rem;cursor:pointer}`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavbarComponent {
  readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  logout(): void { this.auth.logout(); void this.router.navigate(['/auth/login']); }
}
