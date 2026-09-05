import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-loading-spinner', standalone: true,
  template: `<div role="status"><i></i><span>{{ label() }}</span></div>`,
  styles: [`div{display:flex;align-items:center;justify-content:center;gap:.6rem;padding:2rem}i{width:24px;height:24px;border:3px solid #dce1ea;border-top-color:#304ffe;border-radius:50%;animation:spin .8s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoadingSpinnerComponent { readonly label = input('Cargando…'); }
