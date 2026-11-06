import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-page-header',
  standalone: true,
  template: `<header><div><h1>{{ title() }}</h1>@if (subtitle()) {<p>{{ subtitle() }}</p>}</div><ng-content /></header>`,
  styles: [`header{display:flex;align-items:center;justify-content:space-between;gap:24px}h1{margin:0;color:var(--sm-text);font-size:30px;font-weight:700;line-height:40px}p{margin:4px 0 0;color:var(--sm-muted);font-size:13px;line-height:20px}@media(max-width:600px){header{align-items:flex-start;flex-direction:column;gap:16px}h1{font-size:24px;line-height:32px}}`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageHeaderComponent {
  readonly title = input.required<string>();
  readonly subtitle = input('');
}
