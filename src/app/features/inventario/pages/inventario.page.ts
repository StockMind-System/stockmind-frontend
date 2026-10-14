import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize, forkJoin } from 'rxjs';
import { InventoryMovement, OperationsApiService, Product } from '../../../core/services/operations-api.service';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-inventario-page', standalone: true,
  imports: [DatePipe, ReactiveFormsModule, PageHeaderComponent],
  template: `
    <section class="page">
      <app-page-header title="Inventario" subtitle="Movimientos de entrada, salida y ajuste guardados en el backend." />
      <form class="panel form-grid" [formGroup]="form" (ngSubmit)="register()">
        <div class="form-field"><label for="product">Producto</label><select id="product" formControlName="productId"><option value="">Selecciona un producto</option>@for (product of products(); track product.id) { <option [value]="product.id">{{ product.sku }} · {{ product.nombre }}</option> }</select></div>
        <div class="form-field"><label for="type">Tipo</label><select id="type" formControlName="type"><option value="Entrada">Entrada</option><option value="Salida">Salida</option><option value="Ajuste">Ajuste (nuevo saldo)</option></select></div>
        <div class="form-field"><label for="quantity">{{ form.controls.type.value === 'Ajuste' ? 'Nuevo saldo' : 'Cantidad' }}</label><input id="quantity" type="number" [min]="form.controls.type.value === 'Ajuste' ? 0 : 1" formControlName="quantity"></div>
        <div class="form-field"><label for="reason">Motivo</label><input id="reason" formControlName="reason" placeholder="Recepción, merma, conteo…"></div>
        <div class="form-actions"><button class="button" type="submit" [disabled]="form.invalid || invalidQuantity() || saving()">{{ saving() ? 'Registrando…' : 'Registrar movimiento' }}</button></div>
      </form>
      @if (error()) { <p class="data-state data-state--error" role="alert">{{ error() }}</p> }
      @if (loading()) { <p class="data-state">Cargando movimientos…</p> } @else if (!movements().length) { <p class="data-state">No hay movimientos registrados.</p> } @else {
        <div class="list-summary"><div><strong>Movimientos recientes</strong><small>Los cambios más nuevos aparecen primero.</small></div><span>Mostrando {{ recentMovements().length }} de {{ movements().length }}</span></div>
        <div class="data-table-wrap"><table class="data-table"><thead><tr><th>Fecha</th><th>Producto</th><th>Tipo</th><th class="number">Cantidad</th><th>Motivo</th></tr></thead><tbody>
          @for (movement of recentMovements(); track movement.id) { <tr><td>{{ movement.createdAtUtc | date:'dd/MM/yyyy HH:mm' }}</td><td>{{ productName(movement.productId) }}</td><td><span class="status-chip" [class.status-chip--success]="movement.type === 'Entrada'" [class.status-chip--warning]="movement.type !== 'Entrada'">{{ movement.type }}</span></td><td class="number">{{ movement.quantity }}</td><td>{{ movement.reason ?? 'Sin motivo' }}</td></tr> }
        </tbody></table></div>
      }
    </section>
  `,
  styles: [`
    .list-summary{display:flex;align-items:end;justify-content:space-between;gap:16px;margin:4px 2px -10px}.list-summary>div{display:grid;gap:5px}.list-summary strong{font-size:15px}.list-summary small,.list-summary>span{color:var(--sm-muted);font-size:11px}@media(max-width:600px){.list-summary{align-items:flex-start;flex-direction:column}.list-summary>span{display:none}}
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InventarioPage {
  private readonly api = inject(OperationsApiService); private readonly fb = inject(FormBuilder);
  readonly products = signal<Product[]>([]); readonly movements = signal<InventoryMovement[]>([]); readonly loading = signal(true); readonly saving = signal(false); readonly error = signal('');
  readonly recentMovements = computed(() => [...this.movements()].sort((a, b) => Date.parse(b.createdAtUtc) - Date.parse(a.createdAtUtc)).slice(0, 25));
  readonly form = this.fb.nonNullable.group({ productId: ['', Validators.required], type: ['Entrada' as InventoryMovement['type'], Validators.required], quantity: [1, [Validators.required, Validators.min(0)]], reason: ['', Validators.required] });
  constructor() { this.load(); }
  register(): void {
    if (this.form.invalid || this.saving() || this.invalidQuantity()) return;
    const value = this.form.getRawValue(); this.saving.set(true); this.error.set('');
    this.api.registerMovement(value.productId, value.type, value.quantity, value.reason).pipe(finalize(() => this.saving.set(false))).subscribe({ next: () => { this.form.reset({ productId: '', type: 'Entrada', quantity: 1, reason: '' }); this.loadMovements(); }, error: () => this.error.set('No se pudo registrar el movimiento.') });
  }
  invalidQuantity(): boolean { return this.form.controls.type.value !== 'Ajuste' && this.form.controls.quantity.value < 1; }
  productName(id: string): string { const product = this.products().find((item) => item.id === id); return product ? `${product.sku} · ${product.nombre}` : id; }
  private load(): void { forkJoin({ products: this.api.listProducts(), movements: this.api.listInventory() }).pipe(finalize(() => this.loading.set(false))).subscribe({ next: ({ products, movements }) => { this.products.set(products); this.movements.set(movements); }, error: () => this.error.set('No se pudo cargar el inventario desde el backend.') }); }
  private loadMovements(): void { this.api.listInventory().subscribe({ next: (movements) => this.movements.set(movements), error: () => this.error.set('El movimiento se registró, pero no se pudo actualizar el historial.') }); }
}
