import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { OperationsApiService, Product } from '../../../core/services/operations-api.service';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-productos-page',
  standalone: true,
  imports: [CurrencyPipe, ReactiveFormsModule, PageHeaderComponent],
  template: `
    <section class="page">
      <app-page-header title="Productos" subtitle="Catálogo y niveles de stock registrados en el backend." />
      <form class="panel form-grid" [formGroup]="form" (ngSubmit)="create()">
        <div class="form-field"><label for="sku">SKU</label><input id="sku" formControlName="sku" placeholder="HE-MAR-016"></div>
        <div class="form-field"><label for="name">Nombre</label><input id="name" formControlName="nombre" placeholder="Nombre del producto"></div>
        <div class="form-field"><label for="category">Categoría</label><input id="category" formControlName="categoriaId" placeholder="Opcional"></div>
        <div class="form-field"><label for="price">Precio (S/)</label><input id="price" type="number" min="0" step="0.01" formControlName="precio"></div>
        <div class="form-field"><label for="stock">Stock inicial</label><input id="stock" type="number" min="0" formControlName="stockActual"></div>
        <div class="form-field"><label for="minimum">Stock mínimo</label><input id="minimum" type="number" min="0" formControlName="stockMinimo"></div>
        <div class="form-actions"><button class="button" type="submit" [disabled]="form.invalid || saving()">{{ saving() ? 'Guardando…' : 'Agregar producto' }}</button></div>
      </form>
      @if (error()) { <p class="data-state data-state--error" role="alert">{{ error() }}</p> }
      @if (loading()) {
        <p class="data-state">Cargando productos…</p>
      } @else if (!products().length) {
        <p class="data-state">No hay productos registrados.</p>
      } @else {
        <div class="data-table-wrap"><table class="data-table">
          <thead><tr><th>SKU</th><th>Producto</th><th class="number">Precio</th><th class="number">Stock</th><th>Estado</th><th></th></tr></thead>
          <tbody>@for (product of products(); track product.id) {
            <tr><td><strong>{{ product.sku }}</strong></td><td>{{ product.nombre }}</td><td class="number">{{ product.precio | currency:'PEN':'symbol-narrow' }}</td><td class="number">{{ product.stockActual }} / mín. {{ product.stockMinimo }}</td><td><span class="status-chip" [class.status-chip--success]="product.stockActual > product.stockMinimo" [class.status-chip--warning]="product.stockActual <= product.stockMinimo">{{ product.stockActual <= product.stockMinimo ? 'Stock bajo' : 'Disponible' }}</span></td><td class="number"><button class="icon-button" type="button" (click)="remove(product)" [disabled]="deletingId() === product.id">{{ deletingId() === product.id ? 'Eliminando…' : 'Desactivar' }}</button></td></tr>
          }</tbody>
        </table></div>
      }
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductosPage {
  private readonly api = inject(OperationsApiService);
  private readonly fb = inject(FormBuilder);
  readonly products = signal<Product[]>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly deletingId = signal<string | null>(null);
  readonly error = signal('');
  readonly form = this.fb.nonNullable.group({
    sku: ['', Validators.required], nombre: ['', Validators.required], categoriaId: [''],
    precio: [0, [Validators.required, Validators.min(0)]], stockActual: [0, [Validators.required, Validators.min(0)]],
    stockMinimo: [0, [Validators.required, Validators.min(0)]],
  });

  constructor() { this.load(); }

  create(): void {
    if (this.form.invalid || this.saving()) return;
    this.saving.set(true); this.error.set('');
    const value = this.form.getRawValue();
    this.api.createProduct({ ...value, categoriaId: value.categoriaId.trim() || null }).pipe(finalize(() => this.saving.set(false))).subscribe({
      next: (product) => { this.products.update((items) => [...items, product]); this.form.reset({ sku: '', nombre: '', categoriaId: '', precio: 0, stockActual: 0, stockMinimo: 0 }); },
      error: () => this.error.set('No se pudo guardar el producto. Verifica que el SKU no esté repetido.'),
    });
  }

  remove(product: Product): void {
    if (!confirm(`¿Desactivar ${product.nombre}?`)) return;
    this.deletingId.set(product.id); this.error.set('');
    this.api.deleteProduct(product.id).pipe(finalize(() => this.deletingId.set(null))).subscribe({
      next: () => this.products.update((items) => items.filter((item) => item.id !== product.id)),
      error: () => this.error.set('No se pudo desactivar el producto.'),
    });
  }

  private load(): void {
    this.api.listProducts().pipe(finalize(() => this.loading.set(false))).subscribe({
      next: (products) => this.products.set(products),
      error: () => this.error.set('No se pudo conectar con el backend para cargar productos.'),
    });
  }
}
