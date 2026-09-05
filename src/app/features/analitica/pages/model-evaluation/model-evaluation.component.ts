import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { ModelSummaryComponent } from '../../components/model-summary/model-summary.component';
@Component({ selector: 'app-model-evaluation', standalone: true, imports: [PageHeaderComponent, ModelSummaryComponent], template: `<section class="page"><app-page-header title="Evaluación del modelo" /><app-model-summary /></section>`, changeDetection: ChangeDetectionStrategy.OnPush })
export class ModelEvaluationComponent {}
