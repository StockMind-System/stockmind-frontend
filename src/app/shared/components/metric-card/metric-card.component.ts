import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-metric-card',
  standalone: true,
  template: `<article [attr.data-tone]="tone()"><span>{{ label() }}</span><strong>{{ value() }}</strong>@if (hint()) {<small>{{ hint() }}</small>}</article>`,
  styles: [`article{min-height:108px;display:grid;align-content:center;gap:6px;padding:16px;border:1px solid var(--sm-border);border-radius:var(--sm-radius);background:#fff;box-shadow:var(--sm-shadow)}span{color:var(--sm-muted);font-size:12px;font-weight:500}strong{color:var(--sm-text);font-family:"Noto Serif",Georgia,serif;font-size:26px;line-height:32px}small{color:var(--sm-primary);font-size:11px}article[data-tone=warning]{border-top:2px solid var(--sm-warning)}article[data-tone=warning] small{color:var(--sm-warning)}article[data-tone=info]{border-top:2px solid var(--sm-blue)}article[data-tone=info] small{color:var(--sm-blue)}article[data-tone=analytic]{border-top:2px solid var(--sm-purple)}article[data-tone=analytic] small{color:var(--sm-purple)}@media(max-width:540px){article{min-height:104px;padding:16px}}`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MetricCardComponent {
  readonly label = input.required<string>();
  readonly value = input.required<string | number>();
  readonly hint = input('');
  readonly tone = input<'primary' | 'warning' | 'info' | 'analytic'>('primary');
}
