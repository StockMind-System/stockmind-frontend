import { ChangeDetectionStrategy, Component } from '@angular/core';
@Component({ selector: 'app-model-summary', standalone: true, template: `<article class="panel"><h2>Resumen del modelo</h2><p>Conecta AnalyticsService para mostrar la evaluación vigente.</p></article>`, changeDetection: ChangeDetectionStrategy.OnPush })
export class ModelSummaryComponent {}
