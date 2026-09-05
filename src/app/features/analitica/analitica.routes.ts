import { Routes } from '@angular/router';
export const ANALITICA_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./pages/model-evaluation/model-evaluation.component').then((m) => m.ModelEvaluationComponent) },
  { path: 'historial', loadComponent: () => import('./pages/metrics-history/metrics-history.component').then((m) => m.MetricsHistoryComponent) },
];
