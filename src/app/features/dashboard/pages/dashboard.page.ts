import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { MetricCardComponent } from '../../../shared/components/metric-card/metric-card.component';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [RouterLink, PageHeaderComponent, MetricCardComponent],
  template: `
    <section class="page dashboard">
      <div class="heading-block">
        <p class="eyebrow">Inicio / StockMind</p>
        <app-page-header title="Buen día, Dayana" subtitle="Un vistazo a tu operación y a los productos que necesitan atención.">
          <a class="button new-sale" routerLink="/ventas">
            <span aria-hidden="true">＋</span>Nueva venta
          </a>
        </app-page-header>
        <span class="mobile-demo status-chip status-chip--warning">Datos de ejemplo</span>
      </div>

      <div class="metrics" aria-label="Resumen de la operación">
        <app-metric-card label="Ventas de hoy" value="S/ 1,248.50" hint="24 ventas registradas" />
        <app-metric-card label="Productos bajo stock" value="8" hint="3 requieren atención hoy" tone="warning" />
        <app-metric-card label="Sugerencias pendientes" value="12" hint="Revisión de compras pendiente" tone="info" />
        <app-metric-card label="Cobertura de pronóstico" value="92 %" hint="46 de 50 productos A/B" tone="analytic" />
      </div>

      <div class="overview-grid">
        <article class="panel chart-card">
          <header>
            <div><h2>Ventas de las últimas semanas</h2><p>Unidades por semana · datos de ejemplo</p></div>
            <span>12 semanas</span>
          </header>
          <div class="chart-wrap">
            <svg viewBox="0 0 680 230" role="img" aria-labelledby="sales-chart-title sales-chart-desc" preserveAspectRatio="none">
              <title id="sales-chart-title">Ventas de las últimas doce semanas</title>
              <desc id="sales-chart-desc">Las ventas reales y el promedio móvil muestran una tendencia ascendente.</desc>
              <g class="grid-lines"><line x1="48" y1="20" x2="664" y2="20"/><line x1="48" y1="68" x2="664" y2="68"/><line x1="48" y1="116" x2="664" y2="116"/><line x1="48" y1="164" x2="664" y2="164"/><line x1="48" y1="212" x2="664" y2="212"/></g>
              <g class="axis-labels"><text x="2" y="24">100</text><text x="10" y="72">75</text><text x="10" y="120">50</text><text x="10" y="168">25</text><text x="18" y="216">0</text></g>
              <polyline class="forecast-line" points="48,147 104,112 160,138 216,82 272,111 328,65 384,100 440,56 496,87 552,45 608,72 664,34"/>
              <polyline class="actual-line" points="48,135 104,120 160,126 216,89 272,99 328,72 384,87 440,62 496,74 552,51 608,59 664,40"/>
            </svg>
          </div>
          <div class="chart-labels"><span><i class="actual-dot"></i>Ventas reales</span><span><i class="forecast-dot"></i>Promedio móvil</span></div>
        </article>

        <article class="panel priorities">
          <header><h2>Prioridades de hoy</h2><p>Sugerencias sujetas a aprobación</p></header>
          <ul>
            @for (item of priorities; track item.name) {
              <li><i [class.danger]="item.danger"></i><div><strong>{{ item.name }}</strong><small>{{ item.detail }}</small></div><span aria-hidden="true">›</span></li>
            }
          </ul>
          <a routerLink="/alertas">Ver todas las alertas <span aria-hidden="true">→</span></a>
        </article>
      </div>

      <section class="activity">
        <div class="section-heading"><h2>Actividad reciente</h2><a routerLink="/reportes">Ver historial</a></div>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Operación</th><th>Producto / documento</th><th>Responsable</th><th>Hora</th><th>Estado</th></tr></thead>
            <tbody>
              @for (item of activity; track item.document) {
                <tr><td>{{ item.operation }}</td><td><strong>{{ item.document }}</strong></td><td>{{ item.owner }}</td><td>{{ item.time }}</td><td><span class="status-chip" [class.status-chip--warning]="item.warning" [class.status-chip--success]="!item.warning">{{ item.status }}</span></td></tr>
              }
            </tbody>
          </table>
        </div>
      </section>

      <footer class="page-footer"><span>StockMind · Piloto académico · Datos sintéticos</span><span>Última actualización: 10:42</span></footer>
    </section>
  `,
  styles: [`
    .dashboard{gap:24px}.heading-block{position:relative}.mobile-demo{display:none}.new-sale span{font-size:20px;font-weight:400}.metrics{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px}.overview-grid{display:grid;grid-template-columns:minmax(0,1.8fr) minmax(320px,1fr);gap:24px}.panel h2,.activity h2{margin:0;color:var(--sm-text);font-size:17px}.panel header p{margin:8px 0 0;color:var(--sm-muted);font-size:12px}.chart-card{min-width:0}.chart-card>header{display:flex;align-items:flex-start;justify-content:space-between;gap:16px}.chart-card>header>span{padding:5px 9px;border-radius:6px;color:var(--sm-purple);background:var(--sm-purple-soft);font-size:11px;font-weight:700}.chart-wrap{height:225px;margin-top:14px}.chart-wrap svg{width:100%;height:100%;overflow:visible}.grid-lines line{stroke:var(--sm-border);stroke-width:1}.axis-labels{fill:var(--sm-muted);font-size:10px}.actual-line,.forecast-line{fill:none;stroke-width:3;stroke-linecap:round;stroke-linejoin:round}.actual-line{stroke:var(--sm-primary)}.forecast-line{stroke:var(--sm-purple)}.chart-labels{display:flex;gap:34px;margin-top:8px;color:var(--sm-muted);font-size:11px}.chart-labels span{display:flex;align-items:center;gap:8px}.chart-labels i{width:8px;height:8px;border-radius:50%}.actual-dot{background:var(--sm-primary)}.forecast-dot{background:var(--sm-purple)}.priorities{display:flex;flex-direction:column}.priorities ul{margin:18px 0 0;padding:0;list-style:none}.priorities li{display:flex;align-items:center;gap:14px;padding:16px 2px;border-bottom:1px solid var(--sm-border)}.priorities li>i{width:10px;height:10px;flex:0 0 auto;border-radius:50%;background:var(--sm-warning)}.priorities li>i.danger{background:var(--sm-danger)}.priorities li div{min-width:0;display:grid;gap:7px}.priorities li strong{overflow:hidden;font-size:14px;text-overflow:ellipsis;white-space:nowrap}.priorities li small{color:var(--sm-muted);font-size:12px}.priorities li>span{margin-left:auto;color:var(--sm-muted);font-size:24px}.priorities>a{margin-top:auto;padding-top:18px;color:var(--sm-primary);font-size:12px;font-weight:700}.section-heading{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px}.section-heading>a{color:var(--sm-primary);font-size:12px;font-weight:700}.table-wrap{overflow-x:auto;border:1px solid var(--sm-border);border-radius:10px;background:#fff}table{width:100%;min-width:780px;border-collapse:collapse}th,td{height:50px;padding:0 16px;border-bottom:1px solid var(--sm-border);text-align:left;font-size:13px}th{height:46px;color:var(--sm-muted);background:var(--sm-background);font-size:12px}tbody tr:nth-child(even){background:#fbfcfc}tbody tr:last-child td{border-bottom:0}td strong{font-weight:400}.page-footer{display:flex;justify-content:space-between;color:var(--sm-muted);font-size:11px}@media(max-width:1180px){.metrics{grid-template-columns:repeat(2,1fr)}.overview-grid{grid-template-columns:1fr}.priorities>a{margin-top:18px}}@media(max-width:800px){.heading-block .eyebrow,.heading-block .new-sale{display:none}.mobile-demo{display:inline-flex;margin-top:20px}.metrics{grid-template-columns:repeat(2,minmax(0,1fr))}.metrics app-metric-card:first-child{grid-column:1/-1}.metrics app-metric-card:last-child{display:none}.overview-grid{gap:16px}.chart-card{padding:20px}.chart-card>header>span{display:none}.chart-wrap{height:190px}.priorities{padding:20px}.activity{display:none}.page-footer{display:none}}@media(max-width:430px){.dashboard{gap:16px}.metrics{gap:16px}.overview-grid{margin-top:6px}.chart-labels{gap:18px}}
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPage {
  readonly priorities = [
    { name: 'Broca HSS 6 mm', detail: '24 un. disponibles · ROP 40 un.', danger: false },
    { name: 'Codo PVC ½ pulg.', detail: '18 un. disponibles · ROP 30 un.', danger: false },
    { name: 'Guante de trabajo · par', detail: 'Sin stock · Revisar proveedor', danger: true },
  ];

  readonly activity = [
    { operation: 'Venta', document: 'V-001248 · 4 productos', owner: 'Milton Aquino', time: '10:38', status: 'Registrada', warning: false },
    { operation: 'Ingreso', document: 'C-000184 · FerreLima', owner: 'Oscar Alvarado', time: '10:24', status: 'Recibido', warning: false },
    { operation: 'Conteo', document: 'CT-000018 · Almacén principal', owner: 'Isamar Jacobo', time: '09:55', status: 'Por conciliar', warning: true },
  ];
}
