export interface RegressionMetrics {
  mae: number;
  rmse: number;
  wape: number | null;
  r2: number | null;
  reason: string | null;
}

export interface ModelEvaluation extends RegressionMetrics {
  id: string;
  model: string;
  evaluatedAtUtc: string;
}

export interface EvaluateModelRequest {
  yTrue: number[];
  yPred: number[];
  model: string;
}
