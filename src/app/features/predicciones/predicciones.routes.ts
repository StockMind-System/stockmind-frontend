import { Routes } from '@angular/router';
export const PREDICCIONES_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./pages/prediction-list/prediction-list.component').then((m) => m.PredictionListComponent) },
  { path: 'demanda', loadComponent: () => import('./pages/demand-forecast/demand-forecast.component').then((m) => m.DemandForecastComponent) },
  { path: ':id', loadComponent: () => import('./pages/prediction-detail/prediction-detail.component').then((m) => m.PredictionDetailComponent) },
];
