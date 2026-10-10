import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Prediction } from '../../models/prediction.model';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
@Component({
  selector: 'app-prediction-table', standalone: true, imports: [EmptyStateComponent],
  template: `@if(predictions().length){<table><thead><tr><th>SKU</th><th>Corte</th><th>Horizonte</th><th>Método</th><th>Estado</th></tr></thead><tbody>@for(item of predictions();track item.id){<tr><td>{{item.sku}}</td><td>{{item.cutoffDate}}</td><td>{{item.horizonWeeks}} semanas</td><td>{{item.method}}</td><td>{{item.status}}</td></tr>}</tbody></table>}@else{<app-empty-state title="Sin predicciones" />}`,
  styles: [`table{width:100%;border-collapse:collapse;background:white}th,td{text-align:left;padding:.8rem;border-bottom:1px solid #e4e8f0}`], changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PredictionTableComponent { readonly predictions = input.required<Prediction[]>(); }
