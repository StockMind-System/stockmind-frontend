import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { DemandLevel } from '../../models/prediction.model';
@Component({ selector: 'app-demand-level-badge', standalone: true, template: `<span [class]="level().toLowerCase()">{{ level() }}</span>`, styles: [`span{padding:.25rem .5rem;border-radius:1rem;background:#eef2ff}.high{color:#c62828}.medium{color:#b26a00}.low{color:#087f5b}`], changeDetection: ChangeDetectionStrategy.OnPush })
export class DemandLevelBadgeComponent { readonly level = input.required<DemandLevel>(); }
