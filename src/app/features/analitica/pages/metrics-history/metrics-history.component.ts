import { DatePipe, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NavigationService } from '../../../../core/services/navigation.service';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { ModelEvaluation } from '../../models/evaluation.model';
import { AnalyticsService } from '../../services/analytics.service';

@Component({
  selector: 'app-metrics-history',
  standalone: true,
  imports: [DatePipe, DecimalPipe, ReactiveFormsModule, PageHeaderComponent, PaginationComponent],
  template: `<section class="page">
    <app-page-header title="Historial de métricas" subtitle="Evaluaciones almacenadas del modelo analítico." />
    @if(permissions.hasAction('action-analytics-create')){<form class="panel form-grid" [formGroup]="form" (ngSubmit)="evaluate()"><div class="form-field"><label for="actual-values">Valores reales</label><input id="actual-values" formControlName="actual" placeholder="10, 12, 9, 14"></div><div class="form-field"><label for="predicted-values">Valores predichos</label><input id="predicted-values" formControlName="predicted" placeholder="11, 11, 10, 13"></div><div class="form-actions"><button class="button" [disabled]="form.invalid||evaluating()">{{evaluating()?'Evaluando…':'Calcular métricas'}}</button></div></form>}
    @if(error()){<p class="data-state data-state--error">{{error()}}</p>}
    @if(loading()){<p class="data-state">Cargando evaluaciones…</p>}
    @else if(!items().length){<p class="data-state">No hay evaluaciones registradas.</p>}
    @else{
      <div class="data-table-wrap"><table class="data-table"><thead><tr><th>Fecha</th><th>Modelo</th><th class="number">MAE</th><th class="number">RMSE</th><th class="number">WAPE</th><th class="number">R²</th></tr></thead><tbody>
        @for(item of items();track item.id){<tr><td>{{item.evaluatedAtUtc | date:'dd/MM/yyyy HH:mm'}}</td><td><strong>{{item.model}}</strong></td><td class="number">{{item.mae | number:'1.2-4'}}</td><td class="number">{{item.rmse | number:'1.2-4'}}</td><td class="number">{{item.wape === null ? 'No calculable' : ((item.wape | number:'1.2-4') + ' %')}}</td><td class="number">{{item.r2 === null ? '—' : (item.r2 | number:'1.2-4')}}</td></tr>}
      </tbody></table></div>
      <app-pagination [page]="page()" [pageSize]="pageSize()" [totalItems]="totalItems()" [totalPages]="totalPages()" controlId="evaluations-page-size" (pageChange)="load($event)" (pageSizeChange)="changePageSize($event)" />
    }
  </section>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MetricsHistoryComponent {
  private readonly api = inject(AnalyticsService);
  readonly permissions=inject(NavigationService); private readonly fb=inject(FormBuilder); readonly evaluating=signal(false);
  readonly form=this.fb.nonNullable.group({actual:['',Validators.required],predicted:['',Validators.required]});
  readonly items = signal<ModelEvaluation[]>([]); readonly page = signal(1); readonly pageSize = signal(10);
  readonly totalItems = signal(0); readonly totalPages = signal(0); readonly loading = signal(true); readonly error = signal('');
  constructor(){this.load(1);}
  load(page:number):void{this.loading.set(true);this.api.history(page,this.pageSize()).pipe(finalize(()=>this.loading.set(false))).subscribe({next:(response)=>{this.items.set(response.items);this.page.set(response.page);this.totalItems.set(response.totalItems);this.totalPages.set(response.totalPages);},error:()=>this.error.set('No se pudo cargar el historial de evaluaciones.')});}
  changePageSize(pageSize:number):void{this.pageSize.set(pageSize);this.load(1);}
  evaluate():void{const actual=this.parse(this.form.controls.actual.value);const predicted=this.parse(this.form.controls.predicted.value);if(!actual||!predicted||actual.length!==predicted.length){this.error.set('Ingresa listas numéricas de igual longitud separadas por comas.');return;}this.evaluating.set(true);this.error.set('');this.api.evaluate({yTrue:actual,yPred:predicted,model:'demand_model'}).pipe(finalize(()=>this.evaluating.set(false))).subscribe({next:()=>{this.form.reset();this.load(1);},error:()=>this.error.set('No se pudieron calcular las métricas.')});}
  private parse(value:string):number[]|null{const result=value.split(',').map(item=>Number(item.trim()));return result.length&&result.every(Number.isFinite)?result:null;}
}
