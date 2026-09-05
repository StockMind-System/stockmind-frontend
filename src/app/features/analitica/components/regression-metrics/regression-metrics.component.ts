import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RegressionMetrics } from '../../models/evaluation.model';
@Component({ selector: 'app-regression-metrics', standalone: true, template: `<div class="panel">MAE: {{metrics().mae}} · RMSE: {{metrics().rmse}} · R²: {{metrics().r2}}</div>`, changeDetection: ChangeDetectionStrategy.OnPush })
export class RegressionMetricsComponent { readonly metrics = input.required<RegressionMetrics>(); }
