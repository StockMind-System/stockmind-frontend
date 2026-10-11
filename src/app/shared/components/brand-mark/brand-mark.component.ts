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
    :host{display:inline-flex;align-items:center;gap:10px}.mark{width:36px;height:36px;display:flex;align-items:flex-end;gap:3px;padding:8px;border-radius:9px;background:var(--sm-primary)}.mark.compact{width:28px;height:28px;padding:6px;border-radius:7px}.mark i{width:4px;border-radius:1px;background:#fff}.mark i:nth-child(1){height:9px}.mark i:nth-child(2){height:15px}.mark i:nth-child(3){height:20px}.compact i:nth-child(1){height:7px}.compact i:nth-child(2){height:11px}.compact i:nth-child(3){height:15px}.copy{display:grid;gap:2px}.copy strong{font-size:21px;line-height:1;color:inherit}.copy small{color:#a8c2c9;font-size:8px;font-weight:700;letter-spacing:.08em;text-transform:uppercase}
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BrandMarkComponent {
  readonly compact = input(false);
  readonly showName = input(true);
}
