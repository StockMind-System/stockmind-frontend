import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { EvaluateModelRequest, ModelEvaluation } from '../models/evaluation.model';
@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private readonly http = inject(HttpClient);
  history() { return this.http.get<ModelEvaluation[]>(`${environment.apiUrl}/evaluaciones`); }
  evaluate(request: EvaluateModelRequest) {
    return this.http.post<ModelEvaluation>(`${environment.apiUrl}/evaluaciones`, request);
  }
}
