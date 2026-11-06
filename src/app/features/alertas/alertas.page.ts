import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { OperationsApiService, ReplenishmentAlert } from '../../core/services/operations-api.service';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-alertas-page', standalone: true,
  imports: [DecimalPipe, PageHeaderComponent, PaginationComponent],
  template: `<section class="page"><app-page-header title="Planificación de reposición" subtitle="Clasificación ABC, stock de seguridad, punto de reposición y EOQ con revisión humana." />
    @if(error()){<p class="data-state data-state--error" role="alert">{{error()}}</p>}
    @if(loading()){<p class="data-state">Calculando reposición…</p>}@else if(!alerts().length){<p class="data-state">No hay productos que hayan alcanzado su punto de reposición.</p>}@else{
      <div class="data-table-wrap"><table class="data-table"><thead><tr><th>Producto</th><th>ABC</th><th class="number">Demanda anual</th><th class="number">Stock</th><th class="number">Seguridad</th><th class="number">ROP</th><th class="number">EOQ</th><th class="number">Sugerencia</th><th>Estado</th></tr></thead><tbody>
      @for(alert of alerts();track alert.id){<tr><td><strong>{{alert.sku}}</strong><br><span class="muted">{{alert.productName}}</span></td><td><strong>{{alert.abcClass}}</strong></td><td class="number">{{alert.annualDemand}}</td><td class="number">{{alert.currentStock}} / mín. {{alert.minimumStock}}</td><td class="number">{{alert.safetyStock}}</td><td class="number">{{alert.reorderPoint}}</td><td class="number">{{alert.eoq===null?'No calculable':(alert.eoq|number:'1.0-2')}}</td><td class="number"><strong>{{alert.suggestedQuantity}}</strong></td><td><span class="status-chip status-chip--warning">{{alert.status}}</span>@if(alert.missingInputs.length){<br><small class="muted">Falta: {{alert.missingInputs.join(', ')}}</small>}</td></tr>}
      </tbody></table></div><app-pagination [page]="page()" [pageSize]="pageSize()" [totalItems]="totalItems()" [totalPages]="totalPages()" controlId="alerts-page-size" (pageChange)="load($event)" (pageSizeChange)="changePageSize($event)" />
    }<p class="muted">Las cantidades son sugerencias; ninguna compra se crea ni ejecuta automáticamente.</p>
  </section>`, changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlertasPage {
  private readonly api=inject(OperationsApiService); readonly alerts=signal<ReplenishmentAlert[]>([]); readonly loading=signal(true); readonly error=signal('');
  readonly page=signal(1);readonly pageSize=signal(10);readonly totalItems=signal(0);readonly totalPages=signal(0);
  constructor(){this.load(1);} load(page:number):void{this.loading.set(true);this.api.listAlerts(page,this.pageSize()).pipe(finalize(()=>this.loading.set(false))).subscribe({next:r=>{this.alerts.set(r.items);this.page.set(r.page);this.totalItems.set(r.totalItems);this.totalPages.set(r.totalPages);},error:()=>this.error.set('No se pudo calcular la reposición desde el backend.')});}
  changePageSize(size:number):void{this.pageSize.set(size);this.load(1);}
}
