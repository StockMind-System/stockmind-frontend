import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { NavigationService } from '../../../core/services/navigation.service';
import { OperationsApiService, Product } from '../../../core/services/operations-api.service';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-productos-page',
  standalone: true,
  imports: [CurrencyPipe, ReactiveFormsModule, PageHeaderComponent, PaginationComponent],
  template: `
    <section class="page">
      <app-page-header title="Productos" subtitle="Crea productos y define su precio y stock mínimo. Las entradas, mermas y ajustes se registran en Control de stock." />
      @if (permissions.hasAction('action-products-create')) {
        <form class="panel form-grid" [formGroup]="form" (ngSubmit)="create()">
          <div class="form-field"><label for="sku">SKU automático</label><input id="sku" [value]="generatedSku() || 'Completa nombre y categoría'" readonly aria-live="polite"></div>
          <div class="form-field"><label for="name">Nombre</label><input id="name" formControlName="nombre" placeholder="Nombre del producto"></div>
          <div class="form-field"><label for="category">Categoría</label><input id="category" formControlName="categoriaId" placeholder="Ej. cat-herramientas"></div>
          <div class="form-field"><label for="price">Precio (S/)</label><input id="price" type="number" min="0" step="0.01" formControlName="precio"></div>
          <div class="form-field"><label for="stock">Stock inicial</label><input id="stock" type="number" min="0" formControlName="stockActual"></div>
          <div class="form-field"><label for="minimum">Stock mínimo</label><input id="minimum" type="number" min="1" step="1" formControlName="stockMinimo"></div>
          <div class="form-field"><label for="lead-time">Plazo de reposición (días)</label><input id="lead-time" type="number" min="1" formControlName="leadTimeDays"></div>
          <div class="form-field"><label for="order-cost">Costo por pedido (S/)</label><input id="order-cost" type="number" min="0.01" step="0.01" formControlName="orderingCost"></div>
          <div class="form-field"><label for="holding-cost">Costo anual de mantener una unidad (S/)</label><input id="holding-cost" type="number" min="0.01" step="0.01" formControlName="annualHoldingCost"></div>
          <div class="form-field"><label for="service-level">Nivel de servicio</label><select id="service-level" formControlName="serviceLevel"><option [ngValue]="0.9">90 %</option><option [ngValue]="0.95">95 %</option><option [ngValue]="0.99">99 %</option></select></div>
          <div class="form-actions"><button class="button" type="submit" [disabled]="form.invalid || saving()">{{ saving() ? 'Guardando…' : 'Agregar producto' }}</button></div>
        </form>
      }
      @if (error()) { <p class="data-state data-state--error" role="alert">{{ error() }}</p> }
      @if (loading()) {
        <p class="data-state">Cargando productos…</p>
      } @else if (!products().length) {
        <p class="data-state">No hay productos registrados.</p>
      } @else {
        <div class="data-table-wrap"><table class="data-table">
          <thead><tr><th>SKU</th><th>Producto</th><th class="number">Precio</th><th class="number">Stock</th><th>Estado</th><th></th></tr></thead>
          <tbody>@for (product of products(); track product.id) {
            <tr><td><strong>{{ product.sku }}</strong></td><td>{{ product.nombre }}</td><td class="number">{{ product.precio | currency:'PEN':'symbol-narrow' }}</td><td class="number">{{ product.stockActual }} / mín. {{ product.stockMinimo }}</td><td><span class="status-chip" [class.status-chip--success]="product.stockActual > product.stockMinimo" [class.status-chip--warning]="product.stockActual <= product.stockMinimo">{{ product.stockActual <= product.stockMinimo ? 'Stock bajo' : 'Disponible' }}</span></td><td class="number">@if (permissions.hasAction('action-products-deactivate')) { <button class="icon-button" type="button" (click)="remove(product)" [disabled]="deletingId() === product.id">{{ deletingId() === product.id ? 'Eliminando…' : 'Desactivar' }}</button> }</td></tr>
          }</tbody>
        </table></div>
        <app-pagination [page]="page()" [pageSize]="pageSize()" [totalItems]="totalItems()" [totalPages]="totalPages()" controlId="products-page-size" (pageChange)="load($event)" (pageSizeChange)="changePageSize($event)" />
      }
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductosPage {
  readonly permissions = inject(NavigationService);
  private readonly api = inject(OperationsApiService);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  readonly products = signal<Product[]>([]);
  readonly page = signal(1); readonly pageSize = signal(10); readonly totalItems = signal(0); readonly totalPages = signal(0);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly deletingId = signal<string | null>(null);
  readonly error = signal('');
  readonly generatedSku = signal('');
  private loadRequestId = 0;
  private skuNumber: number | null = null;
  readonly form = this.fb.nonNullable.group({
    nombre: ['', Validators.required], categoriaId: ['', Validators.required],
    precio: [0, [Validators.required, Validators.min(0)]], stockActual: [0, [Validators.required, Validators.min(0)]],
    stockMinimo: [1, [Validators.required, Validators.min(1)]],
    leadTimeDays: [7, [Validators.required, Validators.min(1)]],
    orderingCost: [25, [Validators.required, Validators.min(0.01)]],
    annualHoldingCost: [5, [Validators.required, Validators.min(0.01)]],
    serviceLevel: [0.95, [Validators.required, Validators.min(0.01), Validators.max(0.999)]],
  });

  constructor() {
    this.form.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.updateSkuPreview());
    this.load();
  }

  create(): void {
    if (this.form.invalid || this.saving()) return;
    this.saving.set(true); this.error.set('');
    const value = this.form.getRawValue();
    this.api.createProduct({ ...value, sku: this.generatedSku(), categoriaId: value.categoriaId.trim() }).pipe(finalize(() => this.saving.set(false))).subscribe({
      next: (product) => {
        this.skuNumber = null;
        this.form.reset({ nombre: '', categoriaId: '', precio: 0, stockActual: 0, stockMinimo: 1, leadTimeDays: 7, orderingCost: 25, annualHoldingCost: 5, serviceLevel: 0.95 });
        this.load(1, product);
      },
      error: () => this.error.set('No se pudo guardar el producto. Verifica que el SKU no esté repetido.'),
    });
  }

  remove(product: Product): void {
    if (!confirm(`¿Desactivar ${product.nombre}?`)) return;
    this.deletingId.set(product.id); this.error.set('');
    this.api.deleteProduct(product.id).pipe(finalize(() => this.deletingId.set(null))).subscribe({
      next: () => this.load(this.products().length === 1 && this.page() > 1 ? this.page() - 1 : this.page()),
      error: () => this.error.set('No se pudo desactivar el producto.'),
    });
  }

  load(page = this.page(), createdProduct?: Product): void {
    const requestId = ++this.loadRequestId;
    this.loading.set(true);
    this.error.set('');
    this.api.listProducts(page, this.pageSize()).pipe(finalize(() => {
      if (requestId === this.loadRequestId) this.loading.set(false);
    })).subscribe({
      next: (response) => {
        if (requestId !== this.loadRequestId) return;
        const items = createdProduct
          ? [createdProduct, ...response.items.filter((item) => item.id !== createdProduct.id)].slice(0, this.pageSize())
          : response.items;
        this.products.set(items);
        this.page.set(response.page);
        this.totalItems.set(response.totalItems);
        this.totalPages.set(response.totalPages);
      },
      error: () => {
        if (requestId === this.loadRequestId)
          this.error.set('No se pudo conectar con el backend para cargar productos.');
      },
    });
  }
  changePageSize(pageSize: number): void { this.pageSize.set(pageSize); this.load(1); }

  private updateSkuPreview(): void {
    const name = this.form.controls.nombre.value.trim();
    const category = this.form.controls.categoriaId.value.trim();
    if (!name || !category) {
      this.skuNumber = null;
      this.generatedSku.set('');
      return;
    }

    this.skuNumber ??= this.randomSkuNumber();
    this.generatedSku.set(`${this.prefix(category.replace(/^cat-/i, ''), 2, 'PR')}-${this.prefix(name, 3, 'PRO')}-${this.skuNumber}`);
  }

  private prefix(value: string, length: number, fallback: string): string {
    const normalized = value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    return normalized ? normalized.slice(0, length).padEnd(length, 'X') : fallback;
  }

  private randomSkuNumber(): number {
    const value = new Uint32Array(1);
    crypto.getRandomValues(value);
    return 100 + value[0] % 900;
  }
}
