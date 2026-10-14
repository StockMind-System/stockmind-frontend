import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { BrandMarkComponent } from '../brand-mark/brand-mark.component';

interface NavigationItem { path: string; label: string; icon: 'grid' | 'box' | 'bars' | 'bell' | 'user'; phase?: string; }

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, NgTemplateOutlet, BrandMarkComponent],
  template: `
    <aside>
      <div class="brand"><app-brand-mark /></div>

      <div class="workspace" aria-label="Negocio activo">
        <small>NEGOCIO ACTIVO</small><strong>Ferretería · Lima</strong>
      </div>

      <nav aria-label="Navegación principal">
        <section>
          <p>OPERACIÓN</p>
          @for (item of operationItems; track item.path) { <ng-container *ngTemplateOutlet="navItem; context: { $implicit: item }" /> }
        </section>
        <section>
          <p>CONTROL</p>
          @for (item of controlItems; track item.path) { <ng-container *ngTemplateOutlet="navItem; context: { $implicit: item }" /> }
        </section>
        <section class="future">
          <p>FASE 2</p>
          @for (item of futureItems; track item.path) { <ng-container *ngTemplateOutlet="navItem; context: { $implicit: item }" /> }
        </section>
        @if (auth.hasAnyRole(['ADMIN'])) {
          <section>
            <p>ADMINISTRACIÓN</p>
            @for (item of adminItems; track item.path) { <ng-container *ngTemplateOutlet="navItem; context: { $implicit: item }" /> }
          </section>
        }
      </nav>

      <ng-template #navItem let-item>
        <a [routerLink]="item.path" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: item.path === '/dashboard' }">
          <span class="nav-icon" aria-hidden="true">
            @switch (item.icon) {
              @case ('grid') { <svg viewBox="0 0 20 20"><rect x="2" y="2" width="6" height="6" rx="1.5"/><rect x="12" y="2" width="6" height="6" rx="1.5"/><rect x="2" y="12" width="6" height="6" rx="1.5"/><rect x="12" y="12" width="6" height="6" rx="1.5"/></svg> }
              @case ('box') { <svg viewBox="0 0 20 20"><path d="M3 6.5 10 3l7 3.5v8L10 18l-7-3.5zM3 6.5 10 10l7-3.5M10 10v8"/></svg> }
              @case ('bell') { <svg viewBox="0 0 20 20"><path d="M4 14.5h12l-1.5-2V8a4.5 4.5 0 0 0-9 0v4.5zM8 17h4"/></svg> }
              @case ('user') { <svg viewBox="0 0 20 20"><circle cx="10" cy="6" r="3"/><path d="M4 17c0-4 2.5-6 6-6s6 2 6 6"/></svg> }
              @default { <svg viewBox="0 0 20 20"><path d="M3 17V10M10 17V6M17 17V2"/></svg> }
            }
          </span>
          <span>{{ item.label }}</span>
          @if (item.phase) { <small class="phase">{{ item.phase }}</small> }
        </a>
      </ng-template>

      <div class="profile">
        <span class="avatar">{{ initials }}</span>
        <span class="profile-copy"><strong>{{ auth.user()?.name ?? 'Usuario' }}</strong><small>{{ roleLabel }}</small></span>
        <button type="button" (click)="logout()" aria-label="Cerrar sesión" title="Cerrar sesión">↗</button>
      </div>
    </aside>
  `,
  styles: [`
    :host{display:block;min-height:100vh}aside{height:100%;min-height:100vh;display:flex;flex-direction:column;padding:24px 14px 18px;color:#fff;background:var(--sm-navy);overflow-y:auto}.brand{padding:0 10px}.workspace{display:grid;gap:5px;margin:27px 4px 18px;padding:12px 14px;border:1px solid rgb(255 255 255 / 8%);border-radius:8px;background:var(--sm-navy-soft)}.workspace small{color:#91aab3;font-size:9px;font-weight:800;letter-spacing:.1em}.workspace strong{font-size:13px}nav{display:grid;gap:17px}nav section>p{margin:0 0 6px;padding:0 14px;color:#77939d;font-size:9px;font-weight:800;letter-spacing:.12em}nav a{position:relative;min-height:38px;display:flex;align-items:center;gap:12px;padding:0 13px;border-radius:7px;color:#b8cbd1;font-size:13px}nav a::before{content:'';position:absolute;left:0;width:3px;height:24px;border-radius:2px;background:transparent}nav a:hover{color:#fff;background:rgb(41 66 75 / 60%)}nav a.active{color:#fff;background:var(--sm-navy-soft);font-weight:700}nav a.active::before{background:var(--sm-mint)}.nav-icon{width:18px;height:18px;color:#91aab3}.nav-icon svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round}.active .nav-icon{color:var(--sm-mint)}.phase{margin-left:auto;padding:3px 5px;border-radius:5px;color:#b7a9e7;background:rgb(118 98 189 / 18%);font-size:8px;font-weight:800}.future a{opacity:.78}.profile{display:flex;align-items:center;gap:10px;margin-top:auto;padding:18px 8px 0;border-top:1px solid rgb(255 255 255 / 8%)}.avatar{width:35px;height:35px;display:grid;place-items:center;flex:0 0 auto;border-radius:50%;background:var(--sm-primary);font-size:11px;font-weight:700}.profile-copy{min-width:0;display:grid;gap:3px}.profile-copy strong{overflow:hidden;font-size:12px;text-overflow:ellipsis;white-space:nowrap}.profile-copy small{color:#91aab3;font-size:10px}.profile button{width:31px;height:31px;margin-left:auto;border:0;border-radius:6px;color:#9bb2bb;background:transparent}.profile button:hover{color:#fff;background:var(--sm-navy-soft)}
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarComponent {
  readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  readonly operationItems: NavigationItem[] = [
    { path: '/dashboard', label: 'Resumen', icon: 'grid' },
    { path: '/ventas', label: 'Ventas', icon: 'bars' },
    { path: '/productos', label: 'Productos', icon: 'box' },
    { path: '/inventario', label: 'Inventario', icon: 'box' },
  ];
  readonly controlItems: NavigationItem[] = [
    { path: '/alertas', label: 'Reposición', icon: 'bell' },
    { path: '/reportes', label: 'Indicadores', icon: 'bars' },
  ];
  readonly futureItems: NavigationItem[] = [
    { path: '/predicciones', label: 'Pronósticos', icon: 'bars', phase: 'DEMO' },
    { path: '/analitica', label: 'Analítica', icon: 'grid', phase: 'PRÓX.' },
  ];
  readonly adminItems: NavigationItem[] = [{ path: '/usuarios', label: 'Usuarios y roles', icon: 'user' }];

  get initials(): string { return (this.auth.user()?.name ?? 'Usuario').split(' ').slice(0, 2).map((part) => part[0]).join('').toUpperCase(); }
  get roleLabel(): string {
    if (this.auth.hasAnyRole(['ADMIN'])) return 'Administradora';
    if (this.auth.hasAnyRole(['ANALYST'])) return 'Analista';
    return 'Operador';
  }
  logout(): void { this.auth.logout(); void this.router.navigate(['/auth/login']); }
}
