import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ClassificationMetrics } from '../../models/evaluation.model';
@Component({ selector: 'app-classification-metrics', standalone: true, template: `<div class="panel">Accuracy: {{metrics().accuracy}} · Precision: {{metrics().precision}} · F1: {{metrics().f1Score}}</div>`, changeDetection: ChangeDetectionStrategy.OnPush })
export class ClassificationMetricsComponent { readonly metrics = input.required<ClassificationMetrics>(); }
