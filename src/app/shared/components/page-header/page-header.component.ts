import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-page-header', standalone: true,
  template: `<header><div><h1>{{ title() }}</h1>@if (subtitle()) {<p>{{ subtitle() }}</p>}</div><ng-content /></header>`,
  styles: [`header{display:flex;align-items:center;justify-content:space-between;gap:1rem}h1{margin:0;font-size:1.6rem}p{margin:.3rem 0 0;color:#687087}`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageHeaderComponent { readonly title = input.required<string>(); readonly subtitle = input(''); }
