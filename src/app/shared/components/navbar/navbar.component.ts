import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { BrandMarkComponent } from '../brand-mark/brand-mark.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [BrandMarkComponent],
  template: `
    <header>
      <div class="mobile-brand"><app-brand-mark [compact]="true" /></div>
      <p class="breadcrumb">Espacio de trabajo&nbsp;&nbsp;/&nbsp;&nbsp;<strong>Inicio</strong></p>
      <div class="spacer"></div>
      <span class="status-chip status-chip--warning">Datos de ejemplo</span>
      <button class="notification" type="button" aria-label="Ver notificaciones">
        <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 14.5h12l-1.5-2V8a4.5 4.5 0 0 0-9 0v4.5zM8 17h4"/></svg>
        <i></i>
      </button>
      <span class="divider"></span>
      <span class="avatar">{{ initials }}</span>
      <span class="user-copy">
        <strong>{{ auth.user()?.name ?? 'Dayana Armas' }}</strong>
        <small>Administradora</small>
      </span>
    </header>
  `,
  styles: [`
    header{height:80px;display:flex;align-items:center;gap:16px;padding:0 32px;border-bottom:1px solid var(--sm-border);background:#fff}.breadcrumb{margin:0;color:var(--sm-muted);font-size:13px}.breadcrumb strong{color:var(--sm-text)}.spacer{flex:1}.notification{position:relative;width:40px;height:40px;display:grid;place-items:center;border:0;border-radius:8px;color:var(--sm-muted);background:transparent}.notification:hover{background:var(--sm-background)}.notification svg{width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round}.notification i{position:absolute;top:7px;right:7px;width:8px;height:8px;border:2px solid #fff;border-radius:50%;background:var(--sm-danger)}.divider{width:1px;height:32px;background:var(--sm-border)}.avatar{width:36px;height:36px;display:grid;place-items:center;border-radius:50%;color:var(--sm-primary);background:var(--sm-primary-soft);font-size:12px;font-weight:700}.user-copy{display:grid;gap:4px}.user-copy strong{font-size:13px}.user-copy small{color:var(--sm-muted);font-size:11px}.mobile-brand{display:none}@media(max-width:800px){header{height:72px;padding:0 20px}.mobile-brand{display:block}.breadcrumb,.status-chip,.divider,.avatar,.user-copy{display:none}.notification{margin-left:auto}}
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavbarComponent {
  readonly auth = inject(AuthService);

  get initials(): string {
    const name = this.auth.user()?.name ?? 'Dayana Armas';
    return name.split(' ').slice(0, 2).map((part) => part[0]).join('').toUpperCase();
  }
}
