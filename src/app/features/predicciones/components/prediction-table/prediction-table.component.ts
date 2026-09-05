import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Prediction } from '../../models/prediction.model';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { DemandLevelBadgeComponent } from '../demand-level-badge/demand-level-badge.component';
@Component({
  selector: 'app-prediction-table', standalone: true, imports: [EmptyStateComponent, DemandLevelBadgeComponent],
  template: `@if(predictions().length){<table><thead><tr><th>Producto</th><th>Fecha</th><th>Demanda</th><th>Nivel</th></tr></thead><tbody>@for(item of predictions();track item.id){<tr><td>{{item.productId}}</td><td>{{item.date}}</td><td>{{item.predictedDemand}}</td><td><app-demand-level-badge [level]="item.demandLevel" /></td></tr>}</tbody></table>}@else{<app-empty-state title="Sin predicciones" />}`,
  styles: [`table{width:100%;border-collapse:collapse;background:white}th,td{text-align:left;padding:.8rem;border-bottom:1px solid #e4e8f0}`], changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PredictionTableComponent { readonly predictions = input.required<Prediction[]>(); }
