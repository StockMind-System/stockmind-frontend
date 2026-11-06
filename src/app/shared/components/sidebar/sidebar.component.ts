import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter, finalize } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { NavigationService } from '../../../core/services/navigation.service';
import { BrandMarkComponent } from '../brand-mark/brand-mark.component';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, BrandMarkComponent],
  template: `
    <aside>
      <div class="brand"><app-brand-mark /></div>
      <div class="workspace" aria-label="Negocio activo">
        <small>NEGOCIO ACTIVO</small><strong>Ferretería · Lima</strong>
      </div>

      <nav aria-label="Navegación principal">
        @if (loading()) {
          <p class="nav-state">Cargando menú…</p>
        } @else if (error()) {
          <button class="retry" type="button" (click)="loadNavigation()">Reintentar menú</button>
        } @else {
          @for (module of modules(); track module.id) {
            <section class="module">
              <button class="module-toggle" type="button"
                [attr.aria-expanded]="expandedModuleId() === module.id"
                [attr.aria-controls]="'module-' + module.id"
                (click)="toggleModule(module.id)">
                <span class="nav-icon" aria-hidden="true">
                  @switch (module.icon) {
                    @case ('grid') { <svg viewBox="0 0 20 20"><rect x="2" y="2" width="6" height="6" rx="1.5"/><rect x="12" y="2" width="6" height="6" rx="1.5"/><rect x="2" y="12" width="6" height="6" rx="1.5"/><rect x="12" y="12" width="6" height="6" rx="1.5"/></svg> }
                    @case ('box') { <svg viewBox="0 0 20 20"><path d="M3 6.5 10 3l7 3.5v8L10 18l-7-3.5zM3 6.5 10 10l7-3.5M10 10v8"/></svg> }
                    @case ('bell') { <svg viewBox="0 0 20 20"><path d="M4 14.5h12l-1.5-2V8a4.5 4.5 0 0 0-9 0v4.5zM8 17h4"/></svg> }
                    @case ('user') { <svg viewBox="0 0 20 20"><circle cx="10" cy="6" r="3"/><path d="M4 17c0-4 2.5-6 6-6s6 2 6 6"/></svg> }
                    @default { <svg viewBox="0 0 20 20"><path d="M3 17V10M10 17V6M17 17V2"/></svg> }
                  }
                </span>
                <span>{{ module.name }}</span>
                <svg class="chevron" viewBox="0 0 20 20" aria-hidden="true"><path d="m6 8 4 4 4-4"/></svg>
              </button>

              @if (expandedModuleId() === module.id) {
                <div class="module-content" [id]="'module-' + module.id">
                  @for (submodule of module.submodules; track submodule.id) {
                    <div class="submodule">
                      <p>{{ submodule.name }}</p>
                      @for (view of submodule.views; track view.id) {
                        <a [routerLink]="view.route" routerLinkActive="active"
                          [routerLinkActiveOptions]="{ exact: view.route === '/dashboard' }">
                          {{ view.name }}
                        </a>
                      }
                    </div>
                  }
                </div>
              }
            </section>
          }
        }
      </nav>

      <div class="profile">
        <span class="avatar">{{ initials }}</span>
        <span class="profile-copy"><strong>{{ auth.user()?.name ?? 'Usuario' }}</strong><small>{{ roleLabel }}</small></span>
        <button type="button" (click)="logout()" aria-label="Cerrar sesión" title="Cerrar sesión">↗</button>
      </div>
    </aside>
  `,
  styles: [`
    :host{display:block;height:100vh;min-height:0}aside{height:100%;min-height:0;display:flex;flex-direction:column;padding:16px 12px 12px;color:#fff;background:var(--sm-navy);overflow:hidden}.brand{flex:0 0 auto;padding:4px 8px 12px}.workspace{display:grid;flex:0 0 auto;gap:3px;margin:4px 0 12px;padding:9px 12px;border:1px solid rgb(255 255 255 / 12%);border-radius:var(--sm-radius);background:rgb(255 255 255 / 5%)}.workspace small{color:#9fb2c7;font-size:9px;font-weight:600;letter-spacing:.1em}.workspace strong{font-size:12px;font-weight:600}nav{min-height:0;display:flex;flex:1 1 auto;flex-direction:column;gap:2px;overflow:auto;scrollbar-width:thin}.module{flex:0 0 auto}.module-toggle{width:100%;min-height:36px;display:flex;align-items:center;gap:10px;padding:0 10px;border:0;border-radius:var(--sm-radius);color:#c6d2df;background:transparent;font-size:11px;font-weight:600;letter-spacing:.06em;text-align:left;text-transform:uppercase}.module-toggle:hover,.module-toggle[aria-expanded=true]{color:#fff;background:rgb(255 255 255 / 7%)}.nav-icon{width:16px;height:16px;color:#9fb2c7}.nav-icon svg{width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round}.chevron{width:15px;height:15px;margin-left:auto;fill:none;stroke:currentColor;stroke-width:1.7;transition:transform 140ms ease}.module-toggle[aria-expanded=true] .chevron{transform:rotate(180deg)}.module-content{display:grid;gap:2px;padding:3px 0 6px}.submodule{display:grid;gap:1px}.submodule p{margin:4px 0 2px;padding:0 10px 0 36px;color:#7f96ad;font-size:9px;font-weight:600;letter-spacing:.08em;text-transform:uppercase}.submodule a{position:relative;min-height:34px;display:flex;align-items:center;padding:0 10px 0 36px;border-radius:0;color:#bac8d7;font-size:12px}.submodule a::before{content:'';position:absolute;inset:0 auto 0 0;width:2px;background:transparent}.submodule a:hover{color:#fff;background:rgb(255 255 255 / 5%)}.submodule a.active{color:#fff;background:rgb(37 99 235 / 18%);font-weight:600}.submodule a.active::before{background:#60a5fa}.nav-state{margin:10px;color:#9fb2c7;font-size:12px}.retry{min-height:36px;border:1px solid rgb(255 255 255 / 18%);border-radius:var(--sm-radius);color:#fff;background:transparent}.profile{display:flex;align-items:center;flex:0 0 auto;gap:9px;margin-top:auto;padding:12px 6px 0;border-top:1px solid rgb(255 255 255 / 10%)}.avatar{width:32px;height:32px;display:grid;place-items:center;flex:0 0 auto;border-radius:50%;color:var(--sm-primary);background:#dbeafe;font-size:10px;font-weight:700}.profile-copy{min-width:0;display:grid;gap:1px}.profile-copy strong{overflow:hidden;font-size:12px;text-overflow:ellipsis;white-space:nowrap}.profile-copy small{color:#9fb2c7;font-size:10px}.profile button{width:30px;height:30px;margin-left:auto;border:0;border-radius:var(--sm-radius);color:#9fb2c7;background:transparent}.profile button:hover{color:#fff;background:rgb(255 255 255 / 8%)}
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarComponent {
  readonly auth = inject(AuthService);
  private readonly navigation = inject(NavigationService);
  readonly modules = this.navigation.modules;
  readonly expandedModuleId = signal<string | null>(null);
  readonly loading = signal(true);
  readonly error = signal(false);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    this.loadNavigation();
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe((event) => this.expandForRoute(event.urlAfterRedirects));
  }

  loadNavigation(): void {
    this.loading.set(true);
    this.error.set(false);
    this.navigation.getSidebar().pipe(
      finalize(() => this.loading.set(false)),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe({
      next: () => {
        this.expandForRoute(this.router.url);
      },
      error: () => this.error.set(true),
    });
  }

  toggleModule(moduleId: string): void {
    this.expandedModuleId.update((current) => current === moduleId ? null : moduleId);
  }

  get initials(): string { return (this.auth.user()?.name ?? 'Usuario').split(' ').slice(0, 2).map((part) => part[0]).join('').toUpperCase(); }
  get roleLabel(): string {
    if (this.auth.hasAnyRole(['ADMIN'])) return 'Administradora';
    if (this.auth.hasAnyRole(['ANALYST'])) return 'Analista';
    return 'Operador';
  }

  logout(): void {
    this.auth.logout().subscribe({
      next: () => void this.router.navigate(['/auth/login']),
      error: () => void this.router.navigate(['/auth/login']),
    });
  }

  private expandForRoute(url: string): void {
    const path = url.split('?')[0];
    const module = this.modules().find((item) =>
      item.submodules.some((submodule) => submodule.views.some((view) => view.route === path)));
    if (module) this.expandedModuleId.set(module.id);
    else if (!this.expandedModuleId()) this.expandedModuleId.set(this.modules()[0]?.id ?? null);
  }
}
