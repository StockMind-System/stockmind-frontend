import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-empty-state', standalone: true,
  template: `<section><strong>{{ title() }}</strong><p>{{ message() }}</p><ng-content /></section>`,
  styles: [`section{text-align:center;padding:2.5rem;color:#687087}strong{color:#172033}p{margin:.5rem 0 1rem}`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmptyStateComponent { readonly title = input('Sin resultados'); readonly message = input('No hay información para mostrar.'); }
