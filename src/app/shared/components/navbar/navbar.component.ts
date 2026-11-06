import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { BrandMarkComponent } from '../brand-mark/brand-mark.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, BrandMarkComponent],
  template: `
    <header>
      <div class="mobile-brand"><app-brand-mark [compact]="true" /></div>
      <p class="breadcrumb">StockMind&nbsp;&nbsp;/&nbsp;&nbsp;<strong>{{ currentSection() }}</strong></p>
      <div class="spacer"></div>
      <span class="environment">DEMO LOCAL</span>
      <a class="notification" routerLink="/alertas" aria-label="Ver alertas de reposición" title="Alertas de reposición">
        <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 14.5h12l-1.5-2V8a4.5 4.5 0 0 0-9 0v4.5zM8 17h4"/></svg>
      </a>
      <span class="divider"></span>
      <span class="avatar">{{ initials }}</span>
      <span class="user-copy"><strong>{{ auth.user()?.name ?? 'Usuario' }}</strong><small>{{ roleLabel }}</small></span>
    </header>
  `,
  styles: [`
    header{height:56px;display:flex;align-items:center;gap:12px;padding:0 32px;border-bottom:1px solid var(--sm-border);background:#fff}.breadcrumb{margin:0;color:var(--sm-muted);font-size:12px}.breadcrumb strong{color:var(--sm-text);font-weight:600}.spacer{flex:1}.environment{padding:3px 8px;border:1px solid #fde68a;border-radius:var(--sm-radius-small);color:var(--sm-warning);background:var(--sm-warning-soft);font-size:9px;font-weight:700;letter-spacing:.08em}.notification{width:32px;height:32px;display:grid;place-items:center;border-radius:var(--sm-radius);color:var(--sm-muted)}.notification:hover{color:var(--sm-primary);background:var(--sm-background)}.notification svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round}.divider{width:1px;height:28px;background:var(--sm-border)}.avatar{width:30px;height:30px;display:grid;place-items:center;border-radius:50%;color:var(--sm-primary);background:var(--sm-primary-soft);font-size:10px;font-weight:700}.user-copy{display:grid;gap:1px}.user-copy strong{font-size:12px}.user-copy small{color:var(--sm-muted);font-size:10px}.mobile-brand{display:none}@media(max-width:800px){header{height:56px;padding:0 16px}.mobile-brand{display:block}.breadcrumb,.environment,.divider,.avatar,.user-copy{display:none}.notification{margin-left:auto}}
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavbarComponent {
  readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  readonly currentSection = signal(this.sectionFor(this.router.url));

  constructor() {
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe((event) => this.currentSection.set(this.sectionFor(event.urlAfterRedirects)));
  }

  get initials(): string { return (this.auth.user()?.name ?? 'Usuario').split(' ').slice(0, 2).map((part) => part[0]).join('').toUpperCase(); }
  get roleLabel(): string {
    if (this.auth.hasAnyRole(['ADMIN'])) return 'Administradora';
    if (this.auth.hasAnyRole(['ANALYST'])) return 'Analista';
    return 'Operador';
  }

  private sectionFor(url: string): string {
    const section = url.split('?')[0].split('/').filter(Boolean)[0] ?? 'dashboard';
    return ({ dashboard: 'Resumen', productos: 'Productos', ventas: 'Ventas', inventario: 'Inventario', predicciones: 'Pronósticos', alertas: 'Reposición', reportes: 'Indicadores', analitica: 'Analítica', usuarios: 'Usuarios', roles: 'Roles y permisos' } as Record<string, string>)[section] ?? 'Resumen';
  }
}
