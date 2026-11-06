import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { ForecastRequest, Prediction } from '../models/prediction.model';
import { PagedResponse } from '../../../core/services/operations-api.service';
@Injectable({ providedIn: 'root' })
export class PredictionService {
  private readonly http = inject(HttpClient);
  list(page = 1, pageSize = 10, search = '') {
    return this.http.get<PagedResponse<Prediction>>(`${environment.apiUrl}/predicciones`, { params: { page, pageSize, search } });
  }
  create(request: ForecastRequest) {
    return this.http.post<Prediction>(`${environment.apiUrl}/predicciones`, request);
  }
  generate(productId: string) {
    return this.http.post<Prediction>(`${environment.apiUrl}/predicciones/generate/${encodeURIComponent(productId)}`, {});
  }
}
