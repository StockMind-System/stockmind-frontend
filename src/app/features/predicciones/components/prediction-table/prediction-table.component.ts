import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Prediction } from '../../models/prediction.model';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { DatePipe, DecimalPipe } from '@angular/common';
@Component({
  selector: 'app-prediction-table', standalone: true, imports: [DatePipe, DecimalPipe, EmptyStateComponent],
  template: `@if(predictions().length){<div class="data-table-wrap"><table class="data-table"><thead><tr><th>SKU</th><th>Corte</th><th>Método seleccionado</th><th>Pronóstico semanal</th><th>Versiones</th><th>Estado</th></tr></thead><tbody>@for(item of predictions();track item.id){<tr><td><strong>{{item.sku}}</strong></td><td>{{item.cutoffDate|date:'dd/MM/yyyy':'UTC'}}</td><td>{{item.method}}</td><td><ol>@for(week of item.forecasts;track week.weekStart){<li>{{week.weekStart|date:'dd/MM':'UTC'}}: <strong>{{week.predictedDemand|number:'1.0-2'}} {{item.unit}}</strong></li>}</ol></td><td><small>Modelo: {{item.modelVersion}}<br>Datos: {{item.datasetVersion}}</small></td><td><span class="status-chip status-chip--success">{{item.status}}</span></td></tr>}</tbody></table></div>}@else{<app-empty-state title="Sin predicciones" />}`,
  styles: [`ol{min-width:170px;margin:0;padding-left:18px}li+li{margin-top:4px}small{color:var(--sm-muted);line-height:1.5}`], changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PredictionTableComponent { readonly predictions = input.required<Prediction[]>(); }
