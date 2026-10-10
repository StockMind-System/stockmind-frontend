import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { ForecastRequest, Prediction } from '../models/prediction.model';
@Injectable({ providedIn: 'root' })
export class PredictionService {
  private readonly http = inject(HttpClient);
  list() { return this.http.get<Prediction[]>(`${environment.apiUrl}/predicciones`); }
  create(request: ForecastRequest) {
    return this.http.post<Prediction>(`${environment.apiUrl}/predicciones`, request);
  }
}
