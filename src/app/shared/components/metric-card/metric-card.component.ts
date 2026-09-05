import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-metric-card', standalone: true,
  template: `<article><span>{{ label() }}</span><strong>{{ value() }}</strong>@if (hint()) {<small>{{ hint() }}</small>}</article>`,
  styles: [`article{display:grid;gap:.4rem;padding:1rem;background:white;border:1px solid #e4e8f0;border-radius:.75rem}span,small{color:#687087}strong{font-size:1.7rem}`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MetricCardComponent { readonly label = input.required<string>(); readonly value = input.required<string | number>(); readonly hint = input(''); }
