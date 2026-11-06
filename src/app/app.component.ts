import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SessionActivityService } from './core/services/session-activity.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <router-outlet />
    @if (sessionActivity.showInactivityWarning()) {
      <section class="session-warning" role="alertdialog" aria-live="assertive" aria-labelledby="session-warning-title">
        <div>
          <strong id="session-warning-title">Tu sesión está por cerrarse</strong>
          <p>La sesión se cerrará pronto. ¿Deseas continuar?</p>
        </div>
        <div class="session-warning__actions">
          <button class="button" type="button" (click)="sessionActivity.continueSession()">Sí</button>
          <button class="session-warning__close" type="button" (click)="sessionActivity.closeVoluntarily()">Cerrar sesión</button>
        </div>
      </section>
    }
  `,
  styles: [`
    .session-warning{position:fixed;z-index:1000;right:24px;bottom:24px;width:min(440px,calc(100vw - 32px));display:flex;align-items:center;justify-content:space-between;gap:20px;padding:16px;border:1px solid #fde68a;border-left:3px solid var(--sm-warning);border-radius:var(--sm-radius);color:var(--sm-text);background:var(--sm-warning-soft);box-shadow:var(--sm-shadow-medium)}
    .session-warning strong{display:block;font-size:13px}.session-warning p{margin:4px 0 0;color:var(--sm-warning);font-size:12px}.session-warning__actions{display:flex;align-items:center;gap:8px;flex:0 0 auto}.session-warning__close{min-height:36px;padding:0 12px;border:1px solid #fecaca;border-radius:var(--sm-radius);color:var(--sm-danger);background:#fff;font-size:13px;font-weight:600}.session-warning__close:hover{background:var(--sm-danger-soft)}@media(max-width:560px){.session-warning{right:16px;bottom:16px;align-items:stretch;flex-direction:column}.session-warning__actions{display:grid;grid-template-columns:1fr 1fr}.session-warning__actions button{width:100%}}
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  readonly sessionActivity = inject(SessionActivityService);

  constructor() { this.sessionActivity.start(); }
}
