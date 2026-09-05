import { Routes } from '@angular/router';
export const PRODUCTOS_ROUTES: Routes = [{ path: '', loadComponent: () => import('./pages/productos.page').then((m) => m.ProductosPage) }];
