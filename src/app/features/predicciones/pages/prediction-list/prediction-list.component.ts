import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { PredictionTableComponent } from '../../components/prediction-table/prediction-table.component';
import { Prediction } from '../../models/prediction.model';
import { PredictionService } from '../../services/prediction.service';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { NavigationService } from '../../../../core/services/navigation.service';
import { OperationsApiService, Product } from '../../../../core/services/operations-api.service';
@Component({ selector: 'app-prediction-list', standalone: true, imports: [PageHeaderComponent, PredictionTableComponent, PaginationComponent], template: `<section class="page"><app-page-header title="Predicciones" subtitle="Pronóstico semanal con comparación temporal entre XGBoost y promedio móvil de cuatro semanas." />
@if(permissions.hasAction('action-forecast-create')){<div class="panel form-grid"><div class="form-field"><label for="forecast-product">Producto</label><select id="forecast-product" (change)="selectedProductId.set($any($event.target).value)"><option value="">Selecciona un producto</option>@for(product of products();track product.id){<option [value]="product.id">{{product.sku}} · {{product.nombre}}</option>}</select></div><div class="form-actions"><button class="button" type="button" [disabled]="!selectedProductId()||generating()" (click)="generate()">{{generating()?'Generando…':'Generar pronóstico de 4 semanas'}}</button></div></div>}
@if(error()){<p class="data-state data-state--error" role="alert">{{error()}}</p>}@if(loading()){<p class="data-state">Cargando predicciones…</p>}@else{<app-prediction-table [predictions]="predictions()" />@if(totalItems()){<app-pagination [page]="page()" [pageSize]="pageSize()" [totalItems]="totalItems()" [totalPages]="totalPages()" controlId="forecast-page-size" (pageChange)="load($event)" (pageSizeChange)="changePageSize($event)" />}}</section>`, changeDetection: ChangeDetectionStrategy.OnPush })
export class PredictionListComponent {
  private readonly service = inject(PredictionService);
  readonly permissions = inject(NavigationService); private readonly operations = inject(OperationsApiService);
  readonly predictions = signal<Prediction[]>([]);
  readonly products = signal<Product[]>([]); readonly selectedProductId = signal(''); readonly generating = signal(false);
  readonly loading = signal(true);
  readonly error = signal('');
  readonly page = signal(1); readonly pageSize = signal(10); readonly totalItems = signal(0); readonly totalPages = signal(0);
  constructor() { this.load(1); this.operations.listProducts(1,100).subscribe({next:r=>this.products.set(r.items),error:()=>this.error.set('No se pudo cargar el catálogo de productos.')}); }
  load(page: number): void { this.loading.set(true); this.service.list(page, this.pageSize()).pipe(finalize(() => this.loading.set(false))).subscribe({ next: (response) => { this.predictions.set(response.items); this.page.set(response.page); this.totalItems.set(response.totalItems); this.totalPages.set(response.totalPages); }, error: () => this.error.set('No se pudieron cargar las predicciones almacenadas.') }); }
  changePageSize(pageSize: number): void { this.pageSize.set(pageSize); this.load(1); }
  generate():void{const id=this.selectedProductId();if(!id||this.generating())return;this.generating.set(true);this.error.set('');this.service.generate(id).pipe(finalize(()=>this.generating.set(false))).subscribe({next:()=>this.load(1),error:()=>this.error.set('No se pudo generar el pronóstico. Verifica que analytics esté iniciado.')});}
}
