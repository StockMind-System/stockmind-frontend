import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RegressionMetrics } from '../../models/evaluation.model';
@Component({ selector: 'app-regression-metrics', standalone: true, template: `<div class="panel">MAE: {{metrics().mae}} · RMSE: {{metrics().rmse}} · WAPE: {{metrics().wape === null ? 'No calculable' : metrics().wape + '%'}} · R²: {{metrics().r2 === null ? 'No calculable' : metrics().r2}} @if(metrics().reason){<small>{{metrics().reason}}</small>}</div>`, changeDetection: ChangeDetectionStrategy.OnPush })
export class RegressionMetricsComponent { readonly metrics = input.required<RegressionMetrics>(); }
