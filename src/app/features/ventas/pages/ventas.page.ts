import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize, forkJoin } from 'rxjs';
import { OperationsApiService, Product, Sale } from '../../../core/services/operations-api.service';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-ventas-page', standalone: true,
  imports: [DatePipe, ReactiveFormsModule, PageHeaderComponent],
  template: `
    <section class="page">
      <app-page-header title="Ventas" subtitle="Registro simple de ventas y consulta del historial." />
      <form class="panel form-grid" [formGroup]="form" (ngSubmit)="create()">
        <div class="form-field"><label for="product">Producto</label><select id="product" formControlName="productId" (change)="syncPrice()"><option value="">Selecciona un producto</option>@for (product of products(); track product.id) { <option [value]="product.id">{{ product.sku }} · {{ product.nombre }} ({{ product.stockActual }})</option> }</select></div>
        <div class="form-field"><label for="quantity">Cantidad</label><input id="quantity" type="number" min="1" formControlName="quantity"></div>
        <div class="form-field"><label for="unitPrice">Precio unitario (S/)</label><input id="unitPrice" type="number" min="0" step="0.01" formControlName="unitPrice"></div>
        <div class="form-actions"><button class="button" type="submit" [disabled]="form.invalid || saving() || exceedsStock()">{{ saving() ? 'Registrando…' : 'Registrar venta' }}</button></div>
      </form>
      @if (exceedsStock()) { <p class="data-state data-state--error">La cantidad supera el stock informado por el backend.</p> }
      @if (error()) { <p class="data-state data-state--error" role="alert">{{ error() }}</p> }
      @if (loading()) { <p class="data-state">Cargando ventas…</p> } @else if (!sales().length) { <p class="data-state">Aún no hay ventas registradas.</p> } @else {
        <div class="list-summary"><div><strong>Historial reciente</strong><small>Las ventas más nuevas aparecen primero.</small></div><span>Mostrando {{ recentSales().length }} de {{ sales().length }}</span></div>
        <div class="data-table-wrap"><table class="data-table"><thead><tr><th>Fecha</th><th>Documento</th><th>Detalle</th><th class="number">Total</th></tr></thead><tbody>
          @for (sale of recentSales(); track sale.id) { <tr><td>{{ sale.createdAtUtc | date:'dd/MM/yyyy HH:mm' }}</td><td><span class="document-id">{{ sale.id }}</span></td><td>{{ describe(sale) }}</td><td class="number"><strong>{{ money(sale.total) }}</strong></td></tr> }
        </tbody></table></div>
      }
    </section>
  `,
  styles: [`
    .list-summary{display:flex;align-items:end;justify-content:space-between;gap:16px;margin:4px 2px -10px}.list-summary>div{display:grid;gap:5px}.list-summary strong{font-size:15px}.list-summary small,.list-summary>span{color:var(--sm-muted);font-size:11px}.document-id{display:block;max-width:190px;overflow:hidden;color:var(--sm-muted);font-family:ui-monospace,monospace;font-size:11px;text-overflow:ellipsis;white-space:nowrap}@media(max-width:600px){.list-summary{align-items:flex-start;flex-direction:column}.list-summary>span{display:none}}
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VentasPage {
  private readonly api = inject(OperationsApiService); private readonly fb = inject(FormBuilder);
  readonly products = signal<Product[]>([]); readonly sales = signal<Sale[]>([]); readonly loading = signal(true); readonly saving = signal(false); readonly error = signal('');
  readonly recentSales = computed(() => [...this.sales()].sort((a, b) => Date.parse(b.createdAtUtc) - Date.parse(a.createdAtUtc)).slice(0, 25));
  readonly form = this.fb.nonNullable.group({ productId: ['', Validators.required], quantity: [1, [Validators.required, Validators.min(1)]], unitPrice: [0, [Validators.required, Validators.min(0)]] });
  constructor() { forkJoin({ products: this.api.listProducts(), sales: this.api.listSales() }).pipe(finalize(() => this.loading.set(false))).subscribe({ next: ({ products, sales }) => { this.products.set(products); this.sales.set(sales); }, error: () => this.error.set('No se pudo cargar la información desde el backend.') }); }
  syncPrice(): void { const product = this.selectedProduct(); if (product) this.form.controls.unitPrice.setValue(product.precio); }
  exceedsStock(): boolean { const product = this.selectedProduct(); return Boolean(product && this.form.controls.quantity.value > product.stockActual); }
  create(): void {
    const value = this.form.getRawValue(); const product = this.selectedProduct();
    if (this.form.invalid || !product || this.exceedsStock() || this.saving()) return;
    this.saving.set(true); this.error.set('');
    this.api.createSale(value.productId, value.quantity, value.unitPrice).pipe(finalize(() => this.saving.set(false))).subscribe({ next: (sale) => { this.sales.update((items) => [sale, ...items]); this.products.update((items) => items.map((item) => item.id === value.productId ? { ...item, stockActual: item.stockActual - value.quantity } : item)); this.form.reset({ productId: '', quantity: 1, unitPrice: 0 }); }, error: () => this.error.set('No se pudo registrar la venta. Revisa los datos e inténtalo nuevamente.') });
  }
  describe(sale: Sale): string { return sale.details.map((detail) => `${detail.quantity} × ${this.productName(detail.productId)}`).join(', '); }
  money(value: number): string { return new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(value); }
  private selectedProduct(): Product | undefined { return this.products().find((item) => item.id === this.form.controls.productId.value); }
  private productName(id: string): string { return this.products().find((item) => item.id === id)?.nombre ?? id; }
}
