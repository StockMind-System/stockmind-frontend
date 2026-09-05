export type DemandLevel = 'LOW' | 'MEDIUM' | 'HIGH';
export interface Prediction { id: string; productId: string; date: string; predictedDemand: number; demandLevel: DemandLevel; }
