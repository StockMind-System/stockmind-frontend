import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-brand-mark',
  standalone: true,
  template: `
    <span class="mark" [class.compact]="compact()" aria-hidden="true">
      <i></i><i></i><i></i>
    </span>
    @if (showName()) {
      <span class="copy">
        <strong>StockMind</strong>
        @if (!compact()) { <small>Ventas e inventarios</small> }
      </span>
    }
  `,
  styles: [`
    :host{display:inline-flex;align-items:center;gap:10px}.mark{width:34px;height:34px;display:flex;align-items:flex-end;gap:3px;padding:7px;border:1px solid rgb(255 255 255 / 12%);border-radius:var(--sm-radius);background:var(--sm-primary)}.mark.compact{width:28px;height:28px;padding:6px;border-radius:var(--sm-radius)}.mark i{width:4px;border-radius:1px 1px 0 0;background:#fff}.mark i:nth-child(1){height:9px}.mark i:nth-child(2){height:15px}.mark i:nth-child(3){height:20px}.compact i:nth-child(1){height:7px}.compact i:nth-child(2){height:11px}.compact i:nth-child(3){height:15px}.copy{display:grid;gap:2px}.copy strong{font-family:"Noto Serif",Georgia,serif;font-size:20px;line-height:1;color:inherit}.copy small{color:#bfcede;font-size:8px;font-weight:600;letter-spacing:.1em;text-transform:uppercase}
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BrandMarkComponent {
  readonly compact = input(false);
  readonly showName = input(true);
}
