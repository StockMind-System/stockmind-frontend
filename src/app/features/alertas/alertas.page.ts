import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { finalize, forkJoin } from 'rxjs';
import { OperationsApiService, Product, ReplenishmentAlert } from '../../core/services/operations-api.service';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-alertas-page', standalone: true, imports: [DatePipe, PageHeaderComponent],
  template: `<section class="page"><app-page-header title="Alertas de reposición" subtitle="Productos cuyo stock alcanzó o bajó del mínimo configurado." />
    @if (error()) { <p class="data-state data-state--error" role="alert">{{ error() }}</p> }
    @if (loading()) { <p class="data-state">Calculando alertas…</p> } @else if (!alerts().length) { <p class="data-state">No hay productos que requieran reposición.</p> } @else {
      <div class="data-table-wrap"><table class="data-table"><thead><tr><th>Producto</th><th class="number">Stock actual</th><th class="number">Stock mínimo</th><th class="number">Sugerencia</th><th>Estado</th><th>Generada</th></tr></thead><tbody>
      @for (alert of alerts(); track alert.id) { <tr><td><strong>{{ product(alert.productId)?.sku ?? alert.productId }}</strong><br><span class="muted">{{ product(alert.productId)?.nombre ?? 'Producto' }}</span></td><td class="number">{{ product(alert.productId)?.stockActual ?? '—' }}</td><td class="number">{{ product(alert.productId)?.stockMinimo ?? '—' }}</td><td class="number"><strong>{{ alert.suggestedQuantity }}</strong></td><td><span class="status-chip status-chip--warning">{{ alert.status }}</span></td><td>{{ alert.createdAtUtc | date:'dd/MM/yyyy HH:mm' }}</td></tr> }
      </tbody></table></div>
    }
    <p class="muted">Las cantidades son sugerencias para revisión humana; esta pantalla no genera compras automáticas.</p>
  </section>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlertasPage {
  private readonly api = inject(OperationsApiService); readonly alerts = signal<ReplenishmentAlert[]>([]); readonly products = signal<Product[]>([]); readonly loading = signal(true); readonly error = signal('');
  constructor() { forkJoin({ alerts: this.api.listAlerts(), products: this.api.listProducts() }).pipe(finalize(() => this.loading.set(false))).subscribe({ next: ({ alerts, products }) => { this.alerts.set(alerts); this.products.set(products); }, error: () => this.error.set('No se pudieron cargar las alertas desde el backend.') }); }
  product(id: string): Product | undefined { return this.products().find((item) => item.id === id); }
}
