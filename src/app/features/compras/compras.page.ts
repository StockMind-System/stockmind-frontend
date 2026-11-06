import { CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize, forkJoin } from 'rxjs';
import { NavigationService } from '../../core/services/navigation.service';
import { OperationsApiService, Product, Purchase } from '../../core/services/operations-api.service';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-compras-page', standalone: true,
  imports: [CurrencyPipe, DatePipe, ReactiveFormsModule, PageHeaderComponent, PaginationComponent],
  template: `<section class="page">
    <app-page-header title="Compras" subtitle="Registra solicitudes, apruébalas y confirma la recepción física por separado." />
    @if (permissions.hasAction('action-purchases-create')) {
      <form class="panel form-grid" [formGroup]="form" (ngSubmit)="create()">
        <div class="form-field"><label for="supplier">Proveedor</label><input id="supplier" formControlName="supplier"></div>
        <div class="form-field"><label for="document">Documento</label><input id="document" formControlName="documentNumber" placeholder="OC-0001"></div>
        <div class="form-field"><label for="purchase-product">Producto</label><select id="purchase-product" formControlName="productId"><option value="">Selecciona</option>@for(product of products();track product.id){<option [value]="product.id">{{product.sku}} · {{product.nombre}}</option>}</select></div>
        <div class="form-field"><label for="purchase-quantity">Cantidad</label><input id="purchase-quantity" type="number" min="1" formControlName="quantity"></div>
        <div class="form-field"><label for="unit-cost">Costo unitario</label><input id="unit-cost" type="number" min="0" step="0.01" formControlName="unitCost"></div>
        <div class="form-actions"><button class="button" [disabled]="form.invalid || saving()">{{saving()?'Guardando…':'Registrar compra'}}</button></div>
      </form>
    }
    @if(error()){<p class="data-state data-state--error" role="alert">{{error()}}</p>}
    @if(loading()){<p class="data-state">Cargando compras…</p>}@else if(!purchases().length){<p class="data-state">No hay compras registradas.</p>}@else{
      <div class="data-table-wrap"><table class="data-table"><thead><tr><th>Fecha</th><th>Documento</th><th>Proveedor</th><th>Detalle</th><th class="number">Total</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>
      @for(item of purchases();track item.id){<tr><td>{{item.createdAtUtc|date:'dd/MM/yyyy HH:mm'}}</td><td><strong>{{item.documentNumber}}</strong></td><td>{{item.supplier}}</td><td>{{describe(item)}}</td><td class="number">{{item.total|currency:'PEN':'symbol-narrow'}}</td><td><span class="status-chip" [class.status-chip--success]="item.status==='Received'" [class.status-chip--warning]="item.status==='Pending'">{{status(item.status)}}</span></td><td>
        @if(item.status==='Pending' && permissions.hasAction('action-purchases-review')){<button class="icon-button" type="button" (click)="review(item,true)">Aprobar</button><button class="icon-button" type="button" (click)="review(item,false)">Rechazar</button>}
        @if(item.status==='Approved' && permissions.hasAction('action-purchases-receive')){<button class="icon-button" type="button" (click)="receive(item)">Confirmar recepción</button>}
      </td></tr>}
      </tbody></table></div><app-pagination [page]="page()" [pageSize]="pageSize()" [totalItems]="totalItems()" [totalPages]="totalPages()" controlId="purchase-page-size" (pageChange)="load($event)" (pageSizeChange)="changePageSize($event)" />
    }
    <p class="muted">La aprobación no modifica existencias. El stock aumenta únicamente al confirmar la recepción.</p>
  </section>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComprasPage {
  readonly permissions = inject(NavigationService); private readonly api=inject(OperationsApiService); private readonly fb=inject(FormBuilder);
  readonly products=signal<Product[]>([]); readonly purchases=signal<Purchase[]>([]); readonly loading=signal(true); readonly saving=signal(false); readonly error=signal('');
  readonly page=signal(1); readonly pageSize=signal(10); readonly totalItems=signal(0); readonly totalPages=signal(0);
  readonly form=this.fb.nonNullable.group({supplier:['',Validators.required],documentNumber:['',Validators.required],productId:['',Validators.required],quantity:[1,[Validators.required,Validators.min(1)]],unitCost:[0,[Validators.required,Validators.min(0)]]});
  constructor(){forkJoin({products:this.api.listProducts(1,100),purchases:this.api.listPurchases(1,10)}).pipe(finalize(()=>this.loading.set(false))).subscribe({next:({products,purchases})=>{this.products.set(products.items);this.setPage(purchases);},error:()=>this.error.set('No se pudo cargar el módulo de compras.')});}
  create():void{if(this.form.invalid||this.saving())return;const v=this.form.getRawValue();this.saving.set(true);this.api.createPurchase(v.supplier,v.documentNumber,v.productId,v.quantity,v.unitCost).pipe(finalize(()=>this.saving.set(false))).subscribe({next:()=>{this.form.reset({supplier:'',documentNumber:'',productId:'',quantity:1,unitCost:0});this.load(1);},error:()=>this.error.set('No se pudo registrar la compra. Verifica que el documento no esté duplicado.')});}
  review(item:Purchase,approve:boolean):void{const reason=prompt(approve?'Motivo de aprobación (opcional)':'Motivo del rechazo')??'';const request=approve?this.api.approvePurchase(item.id,reason):this.api.rejectPurchase(item.id,reason);request.subscribe({next:()=>this.load(this.page()),error:()=>this.error.set('No se pudo actualizar el estado de la compra.')});}
  receive(item:Purchase):void{if(!confirm(`¿Confirmar la recepción de ${item.documentNumber}?`))return;this.api.receivePurchase(item.id).subscribe({next:()=>this.load(this.page()),error:()=>this.error.set('No se pudo confirmar la recepción.')});}
  load(page:number):void{this.loading.set(true);this.api.listPurchases(page,this.pageSize()).pipe(finalize(()=>this.loading.set(false))).subscribe({next:r=>this.setPage(r),error:()=>this.error.set('No se pudo actualizar el historial de compras.')});}
  changePageSize(size:number):void{this.pageSize.set(size);this.load(1);} describe(item:Purchase):string{return item.details.map(d=>`${d.quantity} × ${this.productName(d.productId)}`).join(', ');} productName(id:string):string{return this.products().find(p=>p.id===id)?.nombre??id;}
  status(value:Purchase['status']):string{return ({Pending:'Pendiente',Approved:'Aprobada',Rejected:'Rechazada',Received:'Recibida'} as const)[value];}
  private setPage(r:import('../../core/services/operations-api.service').PagedResponse<Purchase>):void{this.purchases.set(r.items);this.page.set(r.page);this.totalItems.set(r.totalItems);this.totalPages.set(r.totalPages);}
}
