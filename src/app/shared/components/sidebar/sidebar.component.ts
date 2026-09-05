import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-sidebar', standalone: true, imports: [RouterLink, RouterLinkActive],
  template: `<nav>@for (item of items; track item.path) {<a [routerLink]="item.path" routerLinkActive="active">{{ item.label }}</a>}</nav>`,
  styles: [`nav{height:100%;padding:1rem;background:#fff;border-right:1px solid #e4e8f0}a{display:block;padding:.7rem .85rem;border-radius:.45rem;margin-bottom:.25rem}.active{color:#304ffe;background:#eef2ff;font-weight:600}`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarComponent {
  readonly items = [
    { path: '/dashboard', label: 'Dashboard' }, { path: '/productos', label: 'Productos' },
    { path: '/inventario', label: 'Inventario' }, { path: '/ventas', label: 'Ventas' },
    { path: '/predicciones', label: 'Predicciones' }, { path: '/analitica', label: 'Analítica' },
    { path: '/alertas', label: 'Alertas' }, { path: '/reportes', label: 'Reportes' },
  ];
}
