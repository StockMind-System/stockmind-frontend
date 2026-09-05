import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { MetricCardComponent } from '../../../shared/components/metric-card/metric-card.component';
@Component({ selector: 'app-dashboard-page', standalone: true, imports: [PageHeaderComponent, MetricCardComponent], template: `<section class="page"><app-page-header title="Dashboard" subtitle="Resumen general de StockMind" /><div class="metrics"><app-metric-card label="Productos" value="—" /><app-metric-card label="Ventas" value="—" /><app-metric-card label="Alertas" value="—" /></div></section>`, styles: [`.metrics{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:1rem}`], changeDetection: ChangeDetectionStrategy.OnPush })
export class DashboardPage {}
