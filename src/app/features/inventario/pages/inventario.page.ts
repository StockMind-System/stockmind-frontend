import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
@Component({ selector: 'app-inventario-page', standalone: true, imports: [PageHeaderComponent], template: `<section class="page"><app-page-header title="Inventario" /><div class="panel">Control de inventario</div></section>`, changeDetection: ChangeDetectionStrategy.OnPush })
export class InventarioPage {}
