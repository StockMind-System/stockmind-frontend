import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { finalize, forkJoin } from 'rxjs';
import { OperationsApiService, Product, ReplenishmentAlert, ReportSummary, Sale } from '../../../core/services/operations-api.service';
import { AuthService } from '../../../core/services/auth.service';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { MetricCardComponent } from '../../../shared/components/metric-card/metric-card.component';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [RouterLink, PageHeaderComponent, MetricCardComponent],
  template: `
    <section class="page dashboard">
      <div class="heading-block">
        <p class="eyebrow">Resumen operativo</p>
        <app-page-header [title]="'Buen día, ' + firstName()" subtitle="Aquí tienes lo más importante para continuar la operación.">
          <a class="button new-sale" routerLink="/ventas"><span aria-hidden="true">＋</span>Registrar venta</a>
        </app-page-header>
      </div>

      @if (error()) {
        <p class="data-state data-state--error" role="alert">{{ error() }}</p>
      }

      @if (loading()) {
        <p class="data-state">Cargando el resumen de tu negocio…</p>
      } @else {
        @if (lowStockCount() > 0) {
          <aside class="attention-banner" aria-label="Acción recomendada">
            <span class="attention-icon" aria-hidden="true">!</span>
            <div>
              <strong>{{ lowStockCount() }} productos necesitan reposición</strong>
              <p>Empieza por los productos agotados o por debajo de su stock mínimo.</p>
            </div>
            <a class="secondary-button" routerLink="/alertas">Revisar reposición <span aria-hidden="true">→</span></a>
          </aside>
        }

        <div class="metrics" aria-label="Cifras principales">
          <app-metric-card label="Ventas registradas" [value]="(summary()?.sales ?? 0).toString()" hint="Historial disponible" />
          <app-metric-card label="Ingresos por ventas" [value]="revenueLabel()" hint="Total acumulado" />
          <app-metric-card label="Productos por reponer" [value]="lowStockCount().toString()" hint="Requieren una decisión" tone="warning" />
        </div>

        <div class="operations-grid">
          <article class="panel priorities">
            <header class="panel-heading">
              <div><p class="section-kicker">Primero</p><h2>Productos que requieren atención</h2></div>
              <a routerLink="/alertas">Ver todos</a>
            </header>
            @if (!priorities().length) {
              <p class="empty-copy">No hay alertas de reposición pendientes.</p>
            } @else {
              <ol>
                @for (item of priorities(); track item.id; let position = $index) {
                  <li>
                    <span class="priority-number">{{ position + 1 }}</span>
                    <div class="priority-copy">
                      <strong>{{ item.name }}</strong>
                      <small>{{ item.sku }} · Stock actual: {{ item.stock }} · Mínimo: {{ item.minimum }}</small>
                    </div>
                    <div class="suggestion"><small>Compra sugerida</small><strong>{{ item.suggested }} un.</strong></div>
                  </li>
                }
              </ol>
            }
          </article>

          <aside class="panel quick-actions">
            <div><p class="section-kicker">Después</p><h2>Acciones frecuentes</h2><p>Continúa con una tarea concreta.</p></div>
            <nav aria-label="Acciones frecuentes">
              <a routerLink="/ventas"><span>01</span><div><strong>Registrar una venta</strong><small>Descuenta stock automáticamente</small></div><b aria-hidden="true">→</b></a>
              <a routerLink="/inventario"><span>02</span><div><strong>Actualizar inventario</strong><small>Entrada, salida o ajuste</small></div><b aria-hidden="true">→</b></a>
              <a routerLink="/productos"><span>03</span><div><strong>Gestionar productos</strong><small>Precios y niveles mínimos</small></div><b aria-hidden="true">→</b></a>
            </nav>
          </aside>
        </div>

        <section class="recent-sales">
          <header class="panel-heading"><div><p class="section-kicker">Seguimiento</p><h2>Últimas ventas</h2></div><a routerLink="/ventas">Ver historial</a></header>
          @if (!recentSales().length) {
            <p class="data-state">Todavía no hay ventas registradas.</p>
          } @else {
            <div class="data-table-wrap">
              <table class="data-table">
                <thead><tr><th>Fecha</th><th>Productos vendidos</th><th class="number">Unidades</th><th class="number">Total</th></tr></thead>
                <tbody>
                  @for (sale of recentSales(); track sale.id) {
                    <tr><td>{{ sale.date }}</td><td><strong>{{ sale.description }}</strong></td><td class="number">{{ sale.units }}</td><td class="number"><strong>{{ sale.total }}</strong></td></tr>
                  }
                </tbody>
              </table>
            </div>
          }
        </section>

        <footer class="page-footer"><span>Datos de demostración conectados al backend</span><span>Actualizado {{ updatedAt() }}</span></footer>
      }
    </section>
  `,
  styles: [`
    .dashboard{gap:22px}.heading-block{position:relative}.new-sale span{font-size:20px;font-weight:400}.attention-banner{display:flex;align-items:center;gap:15px;padding:17px 18px;border:1px solid #efcf91;border-left:4px solid #d69119;border-radius:10px;background:#fff9ec}.attention-icon{width:32px;height:32px;display:grid;place-items:center;flex:0 0 auto;border-radius:50%;color:#fff;background:#b56d00;font-weight:800}.attention-banner div{min-width:0}.attention-banner strong{font-size:14px}.attention-banner p{margin:5px 0 0;color:var(--sm-muted);font-size:12px}.attention-banner>a{margin-left:auto}.secondary-button{min-height:38px;display:inline-flex;align-items:center;gap:8px;padding:0 13px;border:1px solid #d9b66b;border-radius:7px;color:#714500;background:#fff;font-size:12px;font-weight:700;white-space:nowrap}.secondary-button:hover{background:#fff3d9}.metrics{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}.operations-grid{display:grid;grid-template-columns:minmax(0,1.55fr) minmax(310px,.8fr);gap:22px}.panel-heading{display:flex;align-items:center;justify-content:space-between;gap:18px;margin-bottom:15px}.panel-heading h2,.quick-actions h2{margin:0;color:var(--sm-text);font-size:17px}.panel-heading>a{color:var(--sm-primary);font-size:12px;font-weight:700}.section-kicker{margin:0 0 7px;color:var(--sm-muted);font-size:10px;font-weight:800;letter-spacing:.1em;text-transform:uppercase}.priorities ol{margin:0;padding:0;list-style:none}.priorities li{display:grid;grid-template-columns:30px minmax(0,1fr) auto;align-items:center;gap:13px;padding:15px 0;border-top:1px solid var(--sm-border)}.priority-number{width:28px;height:28px;display:grid;place-items:center;border-radius:8px;color:var(--sm-warning);background:var(--sm-warning-soft);font-size:12px;font-weight:800}.priority-copy{display:grid;gap:5px;min-width:0}.priority-copy strong{overflow:hidden;font-size:13px;text-overflow:ellipsis;white-space:nowrap}.priority-copy small,.suggestion small{color:var(--sm-muted);font-size:11px}.suggestion{display:grid;gap:5px;text-align:right}.suggestion strong{font-size:13px}.quick-actions{display:grid;align-content:start;gap:17px}.quick-actions>div>p:last-child{margin:7px 0 0;color:var(--sm-muted);font-size:12px}.quick-actions nav{display:grid}.quick-actions a{display:grid;grid-template-columns:30px minmax(0,1fr) auto;align-items:center;gap:11px;padding:14px 0;border-top:1px solid var(--sm-border)}.quick-actions a>span{color:var(--sm-primary);font-size:11px;font-weight:800}.quick-actions a div{display:grid;gap:4px}.quick-actions a strong{font-size:13px}.quick-actions a small{color:var(--sm-muted);font-size:11px}.quick-actions a b{color:var(--sm-primary)}.empty-copy{margin:0;padding:26px 0;color:var(--sm-muted);font-size:13px}.recent-sales .panel-heading{margin-bottom:12px}.recent-sales td strong{font-weight:600}.page-footer{display:flex;justify-content:space-between;padding-top:2px;color:var(--sm-muted);font-size:11px}@media(max-width:1050px){.operations-grid{grid-template-columns:1fr}.quick-actions nav{grid-template-columns:repeat(3,1fr);gap:12px}.quick-actions a{grid-template-columns:1fr;padding:14px;border:1px solid var(--sm-border);border-radius:9px}.quick-actions a>b{display:none}}@media(max-width:800px){.heading-block .eyebrow,.heading-block .new-sale{display:none}.attention-banner{align-items:flex-start}.attention-banner>a{display:none}.metrics{grid-template-columns:repeat(2,minmax(0,1fr))}.metrics app-metric-card:first-child{grid-column:1/-1}.operations-grid{gap:16px}.priorities,.quick-actions{padding:20px}.quick-actions nav{grid-template-columns:1fr}.quick-actions a{grid-template-columns:30px minmax(0,1fr) auto;padding:14px 0;border-width:1px 0 0;border-radius:0}.quick-actions a>b{display:block}.recent-sales{display:none}.page-footer{display:none}}@media(max-width:430px){.dashboard{gap:16px}.metrics{gap:12px}.attention-banner{padding:15px}.priority-copy small{white-space:normal}.suggestion small{display:none}}
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPage {
  private readonly api = inject(OperationsApiService);
  private readonly auth = inject(AuthService);
  readonly summary = signal<ReportSummary | null>(null);
  readonly products = signal<Product[]>([]);
  readonly alerts = signal<ReplenishmentAlert[]>([]);
  readonly sales = signal<Sale[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');
  readonly updatedAt = signal('');
  readonly firstName = computed(() => this.auth.user()?.name.split(' ')[0] ?? 'Usuario');
  readonly lowStockCount = computed(() => this.products().filter((item) => item.stockActual <= item.stockMinimo).length);
  readonly priorities = computed(() => this.alerts().slice(0, 4).map((alert) => {
    const product = this.products().find((item) => item.id === alert.productId);
    return {
      id: alert.id,
      name: product?.nombre ?? 'Producto sin identificar',
      sku: product?.sku ?? alert.productId,
      stock: product?.stockActual ?? 0,
      minimum: product?.stockMinimo ?? 0,
      suggested: alert.suggestedQuantity,
    };
  }));
  readonly recentSales = computed(() => [...this.sales()].sort((a, b) => Date.parse(b.createdAtUtc) - Date.parse(a.createdAtUtc)).slice(0, 5).map((sale) => ({
    id: sale.id,
    date: new Date(sale.createdAtUtc).toLocaleString('es-PE', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }),
    description: sale.details.map((detail) => this.products().find((item) => item.id === detail.productId)?.nombre ?? 'Producto').join(', '),
    units: sale.details.reduce((total, detail) => total + detail.quantity, 0),
    total: this.money(sale.total),
  })));

  constructor() {
    forkJoin({ summary: this.api.getSummary(), products: this.api.listProducts(), alerts: this.api.listAlerts(), sales: this.api.listSales() })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: ({ summary, products, alerts, sales }) => {
          this.summary.set(summary);
          this.products.set(products);
          this.alerts.set(alerts);
          this.sales.set(sales);
          this.updatedAt.set(new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }));
        },
        error: () => this.error.set('No se pudo actualizar el resumen desde el backend.'),
      });
  }

  revenueLabel(): string { return this.money(this.summary()?.revenue ?? 0); }
  private money(value: number): string { return new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(value); }
}
