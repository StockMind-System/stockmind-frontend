import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { OperationsApiService, ReportSummary } from '../../core/services/operations-api.service';
import { MetricCardComponent } from '../../shared/components/metric-card/metric-card.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-reportes-page', standalone: true, imports: [CurrencyPipe, MetricCardComponent, PageHeaderComponent],
  template: `<section class="page"><app-page-header title="Indicadores" subtitle="Resumen operacional calculado por el backend." />
    @if (error()) { <p class="data-state data-state--error" role="alert">{{ error() }}</p> }
    @if (loading()) { <p class="data-state">Cargando indicadores…</p> } @else if (summary(); as data) {
      <div class="metrics"><app-metric-card label="Productos activos" [value]="data.products.toString()" hint="Catálogo disponible" /><app-metric-card label="Ventas registradas" [value]="data.sales.toString()" hint="Historial total" tone="info" /><app-metric-card label="Ingresos acumulados" [value]="(data.revenue | currency:'PEN':'symbol-narrow') ?? 'S/ 0'" hint="Datos sintéticos del piloto" tone="analytic" /></div>
      <div class="panel"><h2>Alcance actual</h2><p>Este MVP muestra los indicadores operacionales disponibles. La evaluación del modelo y las métricas analíticas quedan fuera del flujo principal hasta conectar el servicio Python.</p></div>
    }
  </section>`,
  styles: [`.metrics{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}.panel h2{margin-top:0}.panel p{margin-bottom:0;color:var(--sm-muted);line-height:1.6}@media(max-width:800px){.metrics{grid-template-columns:1fr}}`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportesPage {
  private readonly api = inject(OperationsApiService); readonly summary = signal<ReportSummary | null>(null); readonly loading = signal(true); readonly error = signal('');
  constructor() { this.api.getSummary().pipe(finalize(() => this.loading.set(false))).subscribe({ next: (summary) => this.summary.set(summary), error: () => this.error.set('No se pudieron cargar los indicadores desde el backend.') }); }
}
