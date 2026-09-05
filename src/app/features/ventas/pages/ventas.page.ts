import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
@Component({ selector: 'app-ventas-page', standalone: true, imports: [PageHeaderComponent], template: `<section class="page"><app-page-header title="Ventas" /><div class="panel">Historial de ventas</div></section>`, changeDetection: ChangeDetectionStrategy.OnPush })
export class VentasPage {}
