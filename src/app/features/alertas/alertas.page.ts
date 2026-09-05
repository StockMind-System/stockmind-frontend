import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
@Component({ selector: 'app-alertas-page', standalone: true, imports: [PageHeaderComponent], template: `<section class="page"><app-page-header title="Alertas" /><div class="panel">Centro de alertas</div></section>`, changeDetection: ChangeDetectionStrategy.OnPush })
export class AlertasPage {}
