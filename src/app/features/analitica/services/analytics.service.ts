import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { ModelEvaluation } from '../models/evaluation.model';
@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private readonly http = inject(HttpClient);
  current() { return this.http.get<ModelEvaluation>(`${environment.apiUrl}/analytics/evaluation`); }
  history() { return this.http.get<ModelEvaluation[]>(`${environment.apiUrl}/analytics/history`); }
}
