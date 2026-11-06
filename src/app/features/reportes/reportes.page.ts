import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { OperationsApiService, ReportSummary } from '../../core/services/operations-api.service';
import { MetricCardComponent } from '../../shared/components/metric-card/metric-card.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-reportes-page', standalone: true, imports: [CurrencyPipe, DatePipe, DecimalPipe, MetricCardComponent, PageHeaderComponent],
  template: `<section class="page"><app-page-header title="Indicadores" subtitle="Resumen operacional calculado por el backend." />
    @if (error()) { <p class="data-state data-state--error" role="alert">{{ error() }}</p> }
    @if (loading()) { <p class="data-state">Cargando indicadores…</p> } @else if (summary(); as data) {
      <div class="metrics"><app-metric-card label="Productos activos" [value]="data.products.toString()" hint="Catálogo disponible" /><app-metric-card label="Ventas registradas" [value]="data.sales.toString()" hint="Historial total" tone="info" /><app-metric-card label="Ingresos acumulados" [value]="(data.revenue | currency:'PEN':'symbol-narrow') ?? 'S/ 0'" hint="Datos sintéticos del piloto" tone="analytic" /><app-metric-card label="Quiebres actuales" [value]="data.stockouts.toString()" hint="Productos activos con stock cero" tone="warning" /><app-metric-card label="Unidades excedentes" [value]="data.excessUnits.toString()" hint="Unidades sobre el doble del mínimo" /><app-metric-card label="Exactitud del pronóstico" [value]="data.forecastAccuracy===null?'Sin datos':((data.forecastAccuracy|number:'1.1-2')??'')+' %'" hint="100 − WAPE de la evaluación más reciente" tone="analytic" /></div>
      <div class="panel"><h2>Tiempo de planificación</h2><p>{{data.planningMinutes===null?'No calculable: '+data.planningReason:(data.planningMinutes+' minutos')}}</p><p class="muted">Periodo: {{data.periodStartUtc?(data.periodStartUtc|date:'dd/MM/yyyy'):'Sin datos'}} – {{data.periodEndUtc?(data.periodEndUtc|date:'dd/MM/yyyy'):'Sin datos'}}</p></div>
    }
  </section>`,
  styles: [`.metrics{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}.panel h2{margin-top:0}.panel p{margin-bottom:0;color:var(--sm-muted);line-height:1.6}@media(max-width:800px){.metrics{grid-template-columns:1fr}}`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportesPage {
  private readonly api = inject(OperationsApiService); readonly summary = signal<ReportSummary | null>(null); readonly loading = signal(true); readonly error = signal('');
  constructor() { this.api.getSummary().pipe(finalize(() => this.loading.set(false))).subscribe({ next: (summary) => this.summary.set(summary), error: () => this.error.set('No se pudieron cargar los indicadores desde el backend.') }); }
}
