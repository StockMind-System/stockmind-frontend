import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
@Component({ selector: 'app-reportes-page', standalone: true, imports: [PageHeaderComponent], template: `<section class="page"><app-page-header title="Reportes" /><div class="panel">Generación de reportes</div></section>`, changeDetection: ChangeDetectionStrategy.OnPush })
export class ReportesPage {}
