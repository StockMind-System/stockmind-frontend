import { ChangeDetectionStrategy, Component, input } from '@angular/core';
@Component({ selector: 'app-confusion-matrix', standalone: true, template: `<div class="panel" role="img" aria-label="Matriz de confusión">Matriz {{matrix().length}} × {{matrix().length}}</div>`, changeDetection: ChangeDetectionStrategy.OnPush })
export class ConfusionMatrixComponent { readonly matrix = input.required<number[][]>(); }
