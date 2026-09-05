import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Prediction } from '../models/prediction.model';
@Injectable({ providedIn: 'root' })
export class PredictionService {
  private readonly http = inject(HttpClient);
  list() { return this.http.get<Prediction[]>(`${environment.apiUrl}/predictions`); }
  get(id: string) { return this.http.get<Prediction>(`${environment.apiUrl}/predictions/${id}`); }
}
