import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
@Component({ selector: 'app-metrics-history', standalone: true, imports: [PageHeaderComponent], template: `<section class="page"><app-page-header title="Historial de métricas" /><div class="panel">Historial de evaluaciones del modelo</div></section>`, changeDetection: ChangeDetectionStrategy.OnPush })
export class MetricsHistoryComponent {}
