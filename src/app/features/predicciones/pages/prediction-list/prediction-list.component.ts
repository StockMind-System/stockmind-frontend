import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { PredictionTableComponent } from '../../components/prediction-table/prediction-table.component';
import { Prediction } from '../../models/prediction.model';
import { PredictionService } from '../../services/prediction.service';
@Component({ selector: 'app-prediction-list', standalone: true, imports: [PageHeaderComponent, PredictionTableComponent], template: `<section class="page"><app-page-header title="Predicciones" subtitle="Resultados almacenados por el backend; generar nuevos pronósticos requiere el servicio analítico." />@if(error()){<p class="data-state data-state--error" role="alert">{{error()}}</p>}@if(loading()){<p class="data-state">Cargando predicciones…</p>}@else{<app-prediction-table [predictions]="predictions()" />}</section>`, changeDetection: ChangeDetectionStrategy.OnPush })
export class PredictionListComponent {
  private readonly service = inject(PredictionService);
  readonly predictions = signal<Prediction[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');
  constructor() { this.service.list().pipe(finalize(() => this.loading.set(false))).subscribe({ next: (items) => this.predictions.set(items), error: () => this.error.set('No se pudieron cargar las predicciones almacenadas.') }); }
}
