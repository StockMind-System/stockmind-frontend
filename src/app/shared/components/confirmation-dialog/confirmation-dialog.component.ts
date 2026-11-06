import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-confirmation-dialog', standalone: true,
  template: `
    <div class="confirmation-backdrop" (click)="cancelled.emit()">
      <section role="alertdialog" aria-modal="true" aria-labelledby="confirmation-title" aria-describedby="confirmation-message" (click)="$event.stopPropagation()">
        <span class="warning-icon" aria-hidden="true">!</span>
        <div class="copy"><h2 id="confirmation-title">{{ title() }}</h2><p id="confirmation-message">{{ message() }}</p></div>
        <footer><button class="secondary" type="button" (click)="cancelled.emit()">{{ cancelLabel() }}</button><button class="danger" type="button" (click)="confirmed.emit()">{{ confirmLabel() }}</button></footer>
      </section>
    </div>
  `,
  styles: [`
    .confirmation-backdrop{position:absolute;z-index:20;inset:0;display:grid;place-items:center;padding:20px;background:rgb(15 23 42 / 38%);backdrop-filter:blur(2px)}section{width:min(410px,100%);display:grid;grid-template-columns:auto 1fr;gap:14px;padding:20px;border-radius:var(--sm-radius-large);background:#fff;box-shadow:0 12px 32px rgb(15 23 42 / 20%)}.warning-icon{width:38px;height:38px;display:grid;place-items:center;border-radius:50%;color:var(--sm-warning);background:var(--sm-warning-soft);font-size:20px;font-weight:700}.copy{min-width:0}.copy h2{margin:1px 0 7px;color:var(--sm-text);font-size:18px}.copy p{margin:0;color:var(--sm-muted);font-size:12px;line-height:1.5}footer{grid-column:1/-1;display:flex;justify-content:flex-end;gap:8px;margin-top:4px}.secondary,.danger{min-height:36px;padding:0 13px;border-radius:var(--sm-radius);font-weight:600}.secondary{border:1px solid var(--sm-border-strong);color:var(--sm-primary);background:#fff}.danger{border:1px solid var(--sm-danger);color:#fff;background:var(--sm-danger)}.danger:hover{background:#b91c1c}
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmationDialogComponent {
  readonly title = input('Confirmar acción'); readonly message = input.required<string>();
  readonly confirmLabel = input('Confirmar'); readonly cancelLabel = input('Cancelar');
  readonly confirmed = output<void>(); readonly cancelled = output<void>();
}
