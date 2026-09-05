import { Routes } from '@angular/router';
export const VENTAS_ROUTES: Routes = [{ path: '', loadComponent: () => import('./pages/ventas.page').then((m) => m.VentasPage) }];
