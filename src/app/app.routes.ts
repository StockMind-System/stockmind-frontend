import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { AuthLayoutComponent } from './core/layouts/auth-layout/auth-layout.component';
import { MainLayoutComponent } from './core/layouts/main-layout/main-layout.component';

export const routes: Routes = [
  { path: 'auth', component: AuthLayoutComponent, loadChildren: () => import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES) },
  {
    path: '', component: MainLayoutComponent, canActivate: [authGuard],
    children: [
      { path: 'dashboard', loadChildren: () => import('./features/dashboard/dashboard.routes').then((m) => m.DASHBOARD_ROUTES) },
      { path: 'productos', loadChildren: () => import('./features/productos/productos.routes').then((m) => m.PRODUCTOS_ROUTES) },
      { path: 'inventario', loadChildren: () => import('./features/inventario/inventario.routes').then((m) => m.INVENTARIO_ROUTES) },
      { path: 'ventas', loadChildren: () => import('./features/ventas/ventas.routes').then((m) => m.VENTAS_ROUTES) },
      { path: 'predicciones', loadChildren: () => import('./features/predicciones/predicciones.routes').then((m) => m.PREDICCIONES_ROUTES) },
      { path: 'analitica', loadChildren: () => import('./features/analitica/analitica.routes').then((m) => m.ANALITICA_ROUTES) },
      { path: 'alertas', loadComponent: () => import('./features/alertas/alertas.page').then((m) => m.AlertasPage) },
      { path: 'reportes', loadComponent: () => import('./features/reportes/reportes.page').then((m) => m.ReportesPage) },
      { path: 'usuarios', canActivate: [roleGuard], data: { roles: ['ADMIN'] }, loadComponent: () => import('./features/usuarios/usuarios.page').then((m) => m.UsuariosPage) },
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
    ],
  },
  { path: '**', redirectTo: '' },
];
