import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-metric-card',
  standalone: true,
  template: `<article [attr.data-tone]="tone()"><span>{{ label() }}</span><strong>{{ value() }}</strong>@if (hint()) {<small>{{ hint() }}</small>}</article>`,
  styles: [`article{min-height:122px;display:grid;align-content:center;gap:10px;padding:20px;border:1px solid var(--sm-border);border-radius:12px;background:#fff}span{color:var(--sm-muted);font-size:13px;font-weight:700}strong{color:var(--sm-text);font-size:29px;line-height:1.05}small{color:var(--sm-primary);font-size:12px}article[data-tone=warning] small{color:var(--sm-warning)}article[data-tone=info] small{color:var(--sm-blue)}article[data-tone=analytic] small{color:var(--sm-purple)}@media(max-width:540px){article{min-height:122px;padding:20px}}`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MetricCardComponent {
  readonly label = input.required<string>();
  readonly value = input.required<string | number>();
  readonly hint = input('');
  readonly tone = input<'primary' | 'warning' | 'info' | 'analytic'>('primary');
}
