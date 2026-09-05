import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { PredictionTableComponent } from '../../components/prediction-table/prediction-table.component';
@Component({ selector: 'app-prediction-list', standalone: true, imports: [PageHeaderComponent, PredictionTableComponent], template: `<section class="page"><app-page-header title="Predicciones" /><app-prediction-table [predictions]="[]" /></section>`, changeDetection: ChangeDetectionStrategy.OnPush })
export class PredictionListComponent {}
