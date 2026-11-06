import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize, forkJoin } from 'rxjs';
import { NavigationService } from '../../../core/services/navigation.service';
import { InventoryMovement, OperationsApiService, Product } from '../../../core/services/operations-api.service';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-inventario-page', standalone: true,
  imports: [DatePipe, ReactiveFormsModule, PageHeaderComponent, PaginationComponent],
  template: `
    <section class="page">
      <app-page-header title="Control de stock" subtitle="Actualiza las existencias cuando recibes mercadería, registras una merma o corriges el saldo después de un conteo." />
      @if (permissions.hasAction('action-inventory-create')) {
        <form class="panel form-grid" [formGroup]="form" (ngSubmit)="register()">
          <div class="movement-guide">
            <strong>¿Qué movimiento debes registrar?</strong>
            <p><b>Entrada</b> aumenta el stock por una recepción. <b>Salida</b> descuenta una merma o retiro que no proviene de una venta. <b>Ajuste</b> reemplaza el saldo con la cantidad contada físicamente.</p>
          </div>
          <div class="form-field"><label for="product">Producto</label><select id="product" formControlName="productId"><option value="">Selecciona un producto</option>@for (product of products(); track product.id) { <option [value]="product.id">{{ product.sku }} · {{ product.nombre }}</option> }</select></div>
          <div class="form-field"><label for="type">Tipo de cambio</label><select id="type" formControlName="type"><option value="Entrada">Entrada · recepción</option><option value="Salida">Salida · merma o retiro</option><option value="Ajuste">Ajuste · saldo contado</option></select></div>
          <div class="form-field"><label for="quantity">{{ form.controls.type.value === 'Ajuste' ? 'Nuevo saldo' : 'Cantidad' }}</label><input id="quantity" type="number" [min]="form.controls.type.value === 'Ajuste' ? 0 : 1" formControlName="quantity"></div>
          <div class="form-field"><label for="reason">Motivo</label><input id="reason" formControlName="reason" placeholder="Recepción, merma, conteo…"></div>
          <div class="form-actions"><button class="button" type="submit" [disabled]="form.invalid || invalidQuantity() || saving()">{{ saving() ? 'Registrando…' : 'Registrar movimiento' }}</button></div>
        </form>
      }
      @if (error()) { <p class="data-state data-state--error" role="alert">{{ error() }}</p> }
      @if (loading()) { <p class="data-state">Cargando movimientos…</p> } @else if (!movements().length) { <p class="data-state">No hay movimientos registrados.</p> } @else {
        <div class="list-summary"><div><strong>Historial de cambios de stock</strong><small>Permite saber cuándo, cuánto y por qué cambió cada producto.</small></div><span>{{ totalItems() }} registros</span></div>
        <div class="data-table-wrap"><table class="data-table"><thead><tr><th>Fecha</th><th>Producto</th><th>Tipo</th><th class="number">Cantidad</th><th>Motivo</th></tr></thead><tbody>
          @for (movement of movements(); track movement.id) { <tr><td>{{ movement.createdAtUtc | date:'dd/MM/yyyy HH:mm' }}</td><td>{{ productName(movement.productId) }}</td><td><span class="status-chip" [class.status-chip--success]="movement.type === 'Entrada'" [class.status-chip--warning]="movement.type !== 'Entrada'">{{ movement.type }}</span></td><td class="number">{{ movement.quantity }}</td><td>{{ movement.reason ?? 'Sin motivo' }}</td></tr> }
        </tbody></table></div>
        <app-pagination [page]="page()" [pageSize]="pageSize()" [totalItems]="totalItems()" [totalPages]="totalPages()" controlId="inventory-page-size" (pageChange)="loadMovements($event)" (pageSizeChange)="changePageSize($event)" />
      }
    </section>
  `,
  styles: [`
    .movement-guide{grid-column:1/-1;padding:14px 16px;border-left:4px solid var(--sm-primary);border-radius:8px;background:var(--sm-primary-soft)}.movement-guide strong{font-size:13px}.movement-guide p{margin:6px 0 0;color:var(--sm-muted);font-size:12px;line-height:1.6}.movement-guide b{color:var(--sm-text)}.list-summary{display:flex;align-items:end;justify-content:space-between;gap:16px;margin:4px 2px -10px}.list-summary>div{display:grid;gap:5px}.list-summary strong{font-size:15px}.list-summary small,.list-summary>span{color:var(--sm-muted);font-size:11px}@media(max-width:600px){.list-summary{align-items:flex-start;flex-direction:column}.list-summary>span{display:none}}
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InventarioPage {
  readonly permissions = inject(NavigationService);
  private readonly api = inject(OperationsApiService); private readonly fb = inject(FormBuilder);
  readonly products = signal<Product[]>([]); readonly movements = signal<InventoryMovement[]>([]); readonly loading = signal(true); readonly saving = signal(false); readonly error = signal('');
  readonly page = signal(1); readonly pageSize = signal(10); readonly totalItems = signal(0); readonly totalPages = signal(0);
  readonly form = this.fb.nonNullable.group({ productId: ['', Validators.required], type: ['Entrada' as InventoryMovement['type'], Validators.required], quantity: [1, [Validators.required, Validators.min(0)]], reason: ['', Validators.required] });
  constructor() { this.load(); }
  register(): void {
    if (this.form.invalid || this.saving() || this.invalidQuantity()) return;
    const value = this.form.getRawValue(); this.saving.set(true); this.error.set('');
    this.api.registerMovement(value.productId, value.type, value.quantity, value.reason).pipe(finalize(() => this.saving.set(false))).subscribe({ next: () => { this.form.reset({ productId: '', type: 'Entrada', quantity: 1, reason: '' }); this.loadMovements(1); }, error: () => this.error.set('No se pudo registrar el movimiento.') });
  }
  invalidQuantity(): boolean { return this.form.controls.type.value !== 'Ajuste' && this.form.controls.quantity.value < 1; }
  productName(id: string): string { const product = this.products().find((item) => item.id === id); return product ? `${product.sku} · ${product.nombre}` : id; }
  private load(): void { forkJoin({ products: this.api.listProducts(1, 100), movements: this.api.listInventory(1, 10) }).pipe(finalize(() => this.loading.set(false))).subscribe({ next: ({ products, movements }) => { this.products.set(products.items); this.setMovements(movements); }, error: () => this.error.set('No se pudo cargar el control de stock desde el backend.') }); }
  loadMovements(page: number): void { this.loading.set(true); this.api.listInventory(page, this.pageSize()).pipe(finalize(() => this.loading.set(false))).subscribe({ next: (response) => this.setMovements(response), error: () => this.error.set('No se pudo actualizar el historial.') }); }
  changePageSize(pageSize: number): void { this.pageSize.set(pageSize); this.loadMovements(1); }
  private setMovements(response: import('../../../core/services/operations-api.service').PagedResponse<InventoryMovement>): void { this.movements.set(response.items); this.page.set(response.page); this.totalItems.set(response.totalItems); this.totalPages.set(response.totalPages); }
}
