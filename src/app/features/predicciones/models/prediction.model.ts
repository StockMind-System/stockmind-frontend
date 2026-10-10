export interface WeeklyDemand {
  weekStart: string;
  demand: number;
}

export interface WeeklyForecast {
  weekStart: string;
  predictedDemand: number;
}

export interface ForecastRequest {
  sku: string;
  modelName: string;
  horizonWeeks: number;
  unit: string;
  history: WeeklyDemand[];
}

export interface Prediction {
  id: string;
  sku: string;
  cutoffDate: string;
  horizonWeeks: number;
  unit: string;
  method: string;
  modelVersion: string;
  datasetVersion: string;
  status: string;
  forecasts: WeeklyForecast[];
  createdAtUtc: string;
}
