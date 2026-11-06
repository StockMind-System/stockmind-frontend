import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { EvaluateModelRequest, ModelEvaluation } from '../models/evaluation.model';
import { PagedResponse } from '../../../core/services/operations-api.service';
@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private readonly http = inject(HttpClient);
  history(page = 1, pageSize = 10, search = '') {
    return this.http.get<PagedResponse<ModelEvaluation>>(`${environment.apiUrl}/evaluaciones`, { params: { page, pageSize, search } });
  }
  evaluate(request: EvaluateModelRequest) {
    return this.http.post<ModelEvaluation>(`${environment.apiUrl}/evaluaciones`, request);
  }
}
