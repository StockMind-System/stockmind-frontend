import { ChangeDetectionStrategy, Component } from '@angular/core';
@Component({ selector: 'app-prediction-chart', standalone: true, template: `<div class="panel" role="img" aria-label="Gráfico de predicciones">Área reservada para el gráfico de predicciones</div>`, changeDetection: ChangeDetectionStrategy.OnPush })
export class PredictionChartComponent {}
