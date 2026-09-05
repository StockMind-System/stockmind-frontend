import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
@Component({ selector: 'app-prediction-detail', standalone: true, imports: [PageHeaderComponent], template: `<section class="page"><app-page-header title="Detalle de predicción" /><div class="panel">Predicción {{ id() }}</div></section>`, changeDetection: ChangeDetectionStrategy.OnPush })
export class PredictionDetailComponent { readonly id = input.required<string>(); }
