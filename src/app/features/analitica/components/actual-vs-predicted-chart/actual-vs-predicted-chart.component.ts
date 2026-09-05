import { ChangeDetectionStrategy, Component } from '@angular/core';
@Component({ selector: 'app-actual-vs-predicted-chart', standalone: true, template: `<div class="panel" role="img" aria-label="Valores reales frente a predichos">Área reservada para valores reales vs. predichos</div>`, changeDetection: ChangeDetectionStrategy.OnPush })
export class ActualVsPredictedChartComponent {}
