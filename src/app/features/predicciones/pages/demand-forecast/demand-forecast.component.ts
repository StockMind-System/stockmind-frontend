import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { PredictionChartComponent } from '../../components/prediction-chart/prediction-chart.component';
@Component({ selector: 'app-demand-forecast', standalone: true, imports: [PageHeaderComponent, PredictionChartComponent], template: `<section class="page"><app-page-header title="Pronóstico de demanda" /><app-prediction-chart /></section>`, changeDetection: ChangeDetectionStrategy.OnPush })
export class DemandForecastComponent {}
