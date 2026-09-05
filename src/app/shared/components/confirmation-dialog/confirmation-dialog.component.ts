import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-confirmation-dialog', standalone: true,
  template: `<section role="dialog" aria-modal="true"><h2>{{ title() }}</h2><p>{{ message() }}</p><footer><button (click)="cancelled.emit()">Cancelar</button><button class="danger" (click)="confirmed.emit()">Confirmar</button></footer></section>`,
  styles: [`section{padding:1.5rem;background:white;border-radius:.75rem}footer{display:flex;justify-content:flex-end;gap:.5rem}.danger{color:white;background:#c62828}`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmationDialogComponent {
  readonly title = input('Confirmar acción'); readonly message = input.required<string>();
  readonly confirmed = output<void>(); readonly cancelled = output<void>();
}
