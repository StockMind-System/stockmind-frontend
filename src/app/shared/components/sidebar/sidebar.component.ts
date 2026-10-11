import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { BrandMarkComponent } from '../brand-mark/brand-mark.component';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, BrandMarkComponent],
  template: `
    <aside>
      <div class="brand"><app-brand-mark /></div>

      <button class="workspace" type="button">
        <span>Ferretería · Lima</span><span aria-hidden="true">⌄</span>
      </button>

      <nav aria-label="Navegación principal">
        @for (item of items; track item.path) {
          <a [routerLink]="item.path" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: item.path === '/dashboard' }">
            <span class="nav-icon" aria-hidden="true">
              @switch (item.icon) {
                @case ('grid') { <svg viewBox="0 0 20 20"><rect x="2" y="2" width="6" height="6" rx="1.5"/><rect x="12" y="2" width="6" height="6" rx="1.5"/><rect x="2" y="12" width="6" height="6" rx="1.5"/><rect x="12" y="12" width="6" height="6" rx="1.5"/></svg> }
                @case ('box') { <svg viewBox="0 0 20 20"><path d="M3 6.5 10 3l7 3.5v8L10 18l-7-3.5zM3 6.5 10 10l7-3.5M10 10v8"/></svg> }
                @case ('bars') { <svg viewBox="0 0 20 20"><path d="M3 17V10M10 17V6M17 17V2"/></svg> }
                @case ('bell') { <svg viewBox="0 0 20 20"><path d="M4 14.5h12l-1.5-2V8a4.5 4.5 0 0 0-9 0v4.5zM8 17h4"/></svg> }
                @case ('user') { <svg viewBox="0 0 20 20"><circle cx="10" cy="6" r="3"/><path d="M4 17c0-4 2.5-6 6-6s6 2 6 6"/></svg> }
                @default { <svg viewBox="0 0 20 20"><path d="M3 17V10M10 17V6M17 17V2"/></svg> }
              }
            </span>
            <span>{{ item.label }}</span>
          </a>
        }
      </nav>

      <a class="help" href="#ayuda">
        <strong>¿Necesitas ayuda?</strong>
        <small>Guía rápida del sistema ↗</small>
      </a>

      <button class="profile" type="button" (click)="logout()" title="Cerrar sesión">
        <span class="avatar">{{ initials }}</span>
        <span class="profile-copy">
          <strong>{{ auth.user()?.name ?? 'Dayana Armas' }}</strong>
          <small>Administradora</small>
        </span>
        <span class="logout" aria-hidden="true">↗</span>
      </button>
    </aside>
  `,
  styles: [`
    :host{display:block;min-height:100vh}aside{height:100%;min-height:100vh;display:flex;flex-direction:column;padding:26px 16px 24px;color:#fff;background:var(--sm-navy)}.brand{padding:0 8px}.workspace{height:44px;display:flex;align-items:center;justify-content:space-between;margin:35px 4px 14px;padding:0 14px;border:0;border-radius:8px;color:#fff;background:var(--sm-navy-soft);font-size:13px;font-weight:700}nav{display:grid;gap:6px}nav a{position:relative;min-height:42px;display:flex;align-items:center;gap:14px;padding:0 16px;border-radius:8px;color:#b8cbd1;font-size:14px}nav a::before{content:'';position:absolute;left:0;width:3px;height:28px;border-radius:2px;background:transparent}nav a:hover{color:#fff;background:rgb(41 66 75 / 60%)}nav a.active{color:#fff;background:var(--sm-navy-soft);font-weight:700}nav a.active::before{background:var(--sm-mint)}.nav-icon{width:20px;height:20px;color:#9bb2bb}.nav-icon svg{width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round}.active .nav-icon{color:var(--sm-mint)}.help{display:grid;gap:8px;margin:36px 4px 0;padding:18px 16px;border-radius:10px;background:var(--sm-navy-soft)}.help strong{font-size:13px}.help small{color:#b8cbd1;font-size:11px}.profile{width:100%;display:flex;align-items:center;gap:11px;margin-top:auto;padding:16px 8px 0;border:0;color:#fff;background:transparent;text-align:left}.avatar{width:38px;height:38px;display:grid;place-items:center;flex:0 0 auto;border-radius:50%;background:var(--sm-primary);font-size:12px;font-weight:700}.profile-copy{min-width:0;display:grid;gap:4px}.profile-copy strong{overflow:hidden;font-size:13px;text-overflow:ellipsis;white-space:nowrap}.profile-copy small{color:#b8cbd1;font-size:11px}.logout{margin-left:auto;color:#9bb2bb}.profile:hover .logout{color:#fff}
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarComponent {
  readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  readonly items = [
    { path: '/dashboard', label: 'Inicio', icon: 'grid' },
    { path: '/productos', label: 'Productos', icon: 'box' },
    { path: '/ventas', label: 'Ventas', icon: 'bars' },
    { path: '/inventario', label: 'Inventario', icon: 'box' },
    { path: '/predicciones', label: 'Pronósticos', icon: 'bars' },
    { path: '/alertas', label: 'Reposición', icon: 'bell' },
    { path: '/reportes', label: 'Indicadores', icon: 'bars' },
    { path: '/analitica', label: 'Analítica', icon: 'grid' },
    { path: '/usuarios', label: 'Usuarios y roles', icon: 'user' },
  ];

  get initials(): string {
    const name = this.auth.user()?.name ?? 'Dayana Armas';
    return name.split(' ').slice(0, 2).map((part) => part[0]).join('').toUpperCase();
  }

  logout(): void {
    this.auth.logout();
    void this.router.navigate(['/auth/login']);
  }
}
