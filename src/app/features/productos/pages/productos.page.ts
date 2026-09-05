import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
@Component({ selector: 'app-productos-page', standalone: true, imports: [PageHeaderComponent], template: `<section class="page"><app-page-header title="Productos" /><div class="panel">Gestión de productos</div></section>`, changeDetection: ChangeDetectionStrategy.OnPush })
export class ProductosPage {}
