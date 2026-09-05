export interface RegressionMetrics { mae: number; mse: number; rmse: number; r2: number; }
export interface ClassificationMetrics { accuracy: number; precision: number; recall: number; f1Score: number; }
export interface ModelEvaluation { modelName: string; evaluatedAt: string; regression?: RegressionMetrics; classification?: ClassificationMetrics; }
