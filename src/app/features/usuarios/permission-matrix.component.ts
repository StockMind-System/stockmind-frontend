import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { PermissionAction, PermissionModule, PermissionSubmodule } from './users-api.service';

export interface PermissionOverrides { grantedActionIds: string[]; deniedActionIds: string[]; }

@Component({
  selector: 'app-permission-matrix',
  standalone: true,
  template: `
    <div class="permission-tree" role="tree" aria-label="Permisos por módulo">
      @for (module of catalog(); track module.id) {
        <section class="module-card" role="treeitem" [attr.aria-expanded]="isModuleExpanded(module.id)">
          <div class="module-header">
            <button class="expand-button" type="button" [attr.aria-controls]="'module-' + module.id" (click)="toggleModule(module.id)">
              <span class="module-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" focusable="false"><path d="M5.5 3A2.5 2.5 0 0 0 3 5.5v3A2.5 2.5 0 0 0 5.5 11h3A2.5 2.5 0 0 0 11 8.5v-3A2.5 2.5 0 0 0 8.5 3h-3Zm10 0A2.5 2.5 0 0 0 13 5.5v3a2.5 2.5 0 0 0 2.5 2.5h3A2.5 2.5 0 0 0 21 8.5v-3A2.5 2.5 0 0 0 18.5 3h-3Zm-10 10A2.5 2.5 0 0 0 3 15.5v3A2.5 2.5 0 0 0 5.5 21h3a2.5 2.5 0 0 0 2.5-2.5v-3A2.5 2.5 0 0 0 8.5 13h-3Zm10 0a2.5 2.5 0 0 0-2.5 2.5v3a2.5 2.5 0 0 0 2.5 2.5h3a2.5 2.5 0 0 0 2.5-2.5v-3a2.5 2.5 0 0 0-2.5-2.5h-3Z"/></svg>
              </span>
              <span class="heading-copy">
                <strong>{{ module.name }}</strong>
                <small>{{ selectedModuleActionCount(module) }} de {{ moduleActionCount(module) }} acciones habilitadas</small>
              </span>
              <span class="status-badge" [class.status-badge--active]="isModuleSelected(module)" [class.status-badge--partial]="isModulePartiallySelected(module)">
                {{ moduleSelectionLabel(module) }}
              </span>
              <span class="chevron" [class.chevron--open]="isModuleExpanded(module.id)" aria-hidden="true">⌄</span>
            </button>
            @if (mode() === 'role') {
              <label class="parent-check parent-check--module" [title]="moduleSelectionLabel(module)">
                <span class="sr-only">Seleccionar todas las acciones de {{ module.name }}</span>
                <input type="checkbox" [checked]="isModuleSelected(module)" [indeterminate]="isModulePartiallySelected(module)" [disabled]="disabled()" (change)="toggleModuleActions(module, $event)">
              </label>
            }
          </div>

          @if (isModuleExpanded(module.id)) {
            <div class="submodule-list" role="group" [id]="'module-' + module.id">
              @for (submodule of module.submodules; track submodule.id) {
                <section class="submodule-card" role="treeitem" [attr.aria-expanded]="isSubmoduleExpanded(submodule.id)">
                  <div class="submodule-header">
                    <button class="expand-button expand-button--submodule" type="button" [attr.aria-controls]="'submodule-' + submodule.id" (click)="toggleSubmodule(submodule.id)">
                      <span class="submodule-icon" aria-hidden="true">
                        <svg viewBox="0 0 24 24" focusable="false"><path d="M6.25 4A2.25 2.25 0 1 0 6.25 8.5 2.25 2.25 0 0 0 6.25 4Zm0 5.75A2.25 2.25 0 1 0 6.25 14.25a2.25 2.25 0 0 0 0-4.5Zm0 5.75A2.25 2.25 0 1 0 6.25 20a2.25 2.25 0 0 0 0-4.5ZM11 5.5a1 1 0 0 0 0 2h8a1 1 0 1 0 0-2h-8Zm0 5.75a1 1 0 1 0 0 2h8a1 1 0 1 0 0-2h-8ZM10 18a1 1 0 0 1 1-1h8a1 1 0 1 1 0 2h-8a1 1 0 0 1-1-1Z"/></svg>
                      </span>
                      <span class="heading-copy">
                        <strong>{{ submodule.name }}</strong>
                        <small>{{ selectedSubmoduleActionCount(submodule) }} de {{ submoduleActionCount(submodule) }} acciones</small>
                      </span>
                      <span class="status-badge status-badge--small" [class.status-badge--active]="isSubmoduleSelected(submodule)" [class.status-badge--partial]="isSubmodulePartiallySelected(submodule)">
                        {{ submoduleSelectionLabel(submodule) }}
                      </span>
                      <span class="chevron" [class.chevron--open]="isSubmoduleExpanded(submodule.id)" aria-hidden="true">⌄</span>
                    </button>
                    @if (mode() === 'role') {
                      <label class="parent-check" [title]="submoduleSelectionLabel(submodule)">
                        <span class="sr-only">Seleccionar todas las acciones de {{ submodule.name }}</span>
                        <input type="checkbox" [checked]="isSubmoduleSelected(submodule)" [indeterminate]="isSubmodulePartiallySelected(submodule)" [disabled]="disabled()" (change)="toggleSubmoduleActions(submodule, $event)">
                      </label>
                    }
                  </div>

                  @if (isSubmoduleExpanded(submodule.id)) {
                    <div class="action-grid" role="group" [id]="'submodule-' + submodule.id">
                      @for (view of submodule.views; track view.id) {
                        @for (action of view.actions; track action.id) {
                          @if (mode() === 'role') {
                            <label class="action-option" [class.action-option--selected]="selectedActionIds().includes(action.id)" role="treeitem">
                              <span class="action-symbol" aria-hidden="true">✓</span>
                              <span class="action-name">{{ action.name }}</span>
                              <span class="check">
                                <span class="sr-only">Asignar {{ action.name }}</span>
                                <input type="checkbox" [checked]="selectedActionIds().includes(action.id)" [disabled]="disabled()" (change)="toggleRoleAction(action.id)">
                              </span>
                            </label>
                          } @else {
                            <div class="action-option action-option--user" role="treeitem">
                              <span class="action-symbol" [class.action-symbol--selected]="isActionEffectivelySelected(action.id)" aria-hidden="true">✓</span>
                              <span class="action-name">{{ action.name }}</span>
                              <label class="override">
                                <span>{{ inheritedLabel(action) }}</span>
                                <select [value]="overrideValue(action.id)" [disabled]="disabled()" (change)="changeOverride(action.id, $event)" [attr.aria-label]="'Acceso para ' + action.name">
                                  <option value="inherit">Heredar del rol</option>
                                  <option value="grant">Permitir al usuario</option>
                                  <option value="deny">Bloquear al usuario</option>
                                </select>
                              </label>
                            </div>
                          }
                        }
                      }
                    </div>
                  }
                </section>
              }
            </div>
          }
        </section>
      }
    </div>
  `,
  styles: [`
    .permission-tree{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));align-items:start;gap:14px;padding-bottom:10px}.module-card{min-width:0;overflow:hidden;border:1px solid #dbe5e7;border-radius:14px;background:#fff}.module-header,.submodule-header{display:flex}.module-header{min-height:66px;background:linear-gradient(135deg,#f5fbf9,#f8fafb)}.expand-button{min-width:0;display:flex;align-items:center;flex:1;gap:12px;padding:10px 12px 10px 16px;border:0;background:transparent;color:var(--sm-text);text-align:left}.expand-button:hover{background:rgb(12 124 112 / 5%)}.expand-button:focus-visible{outline:3px solid rgb(94 210 187 / 45%);outline-offset:-3px}.module-icon,.submodule-icon{display:grid;place-items:center;flex:0 0 auto;color:var(--sm-primary)}.module-icon{width:38px;height:38px;border-radius:10px;background:#dff2ed}.submodule-icon{width:30px;height:30px;border-radius:8px;background:#edf3f4;color:#6d8991}.module-icon svg{width:21px;height:21px;fill:currentColor}.submodule-icon svg{width:17px;height:17px;fill:currentColor}.heading-copy{min-width:0;display:flex;flex:1;flex-direction:column;gap:3px}.heading-copy strong{overflow:hidden;font-size:14px;text-overflow:ellipsis;white-space:nowrap}.module-header .heading-copy strong{font-size:15px}.heading-copy small{color:var(--sm-muted);font-size:11px}.status-badge{flex:0 0 auto;padding:5px 9px;border-radius:999px;background:#f0f3f4;color:#6c7d82;font-size:10px;font-weight:700}.status-badge--active{background:#e1f5ed;color:#13775f}.status-badge--partial{background:#fff2d8;color:#946412}.chevron{width:24px;height:24px;display:grid;place-items:center;flex:0 0 24px;color:#71868d;font-size:18px;transition:transform .18s}.chevron--open{transform:rotate(180deg)}.parent-check{min-width:48px;display:grid;place-items:center;flex:0 0 48px;border-left:1px solid #e4ecee;cursor:pointer}.parent-check--module{min-width:54px;flex-basis:54px}.parent-check input,.check input{width:17px;height:17px;margin:0;accent-color:var(--sm-primary)}.submodule-list{display:grid;gap:10px;padding:12px 14px 14px;background:#f6f8f9}.submodule-card{overflow:hidden;border:1px solid #e0e8ea;border-radius:11px;background:#fff}.submodule-header{min-height:52px}.expand-button--submodule{padding:8px 10px 8px 12px}.action-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;padding:10px 12px 12px;border-top:1px solid #edf1f2;background:#fbfcfc}.action-option{min-width:0;min-height:44px;display:grid;grid-template-columns:auto minmax(0,1fr) auto;align-items:center;gap:9px;padding:8px 10px;border:1px solid #e3eaec;border-radius:9px;background:#fff;cursor:pointer}.action-option:hover{border-color:#b9d8d2}.action-option--selected{border-color:#b5dbd2;background:#f1faf7}.action-symbol{width:22px;height:22px;display:grid;place-items:center;border-radius:7px;background:#eef2f3;color:transparent;font-size:12px;font-weight:900}.action-option--selected .action-symbol,.action-symbol--selected{background:#d9f1ea;color:#087765}.action-name{overflow:hidden;font-size:12px;font-weight:650;text-overflow:ellipsis;white-space:nowrap}.check{display:flex}.action-option--user{grid-column:1/-1}.override{display:flex;align-items:center;justify-content:flex-end;gap:8px}.override>span{color:var(--sm-muted);font-size:10px;white-space:nowrap}.override select{min-height:32px;padding:0 26px 0 8px;border:1px solid var(--sm-border);border-radius:7px;background:#fff;font-size:11px}@media(max-width:1050px){.permission-tree{grid-template-columns:1fr}}@media(max-width:800px){.action-grid{grid-template-columns:1fr}.status-badge{display:none}.module-icon{width:34px;height:34px}.submodule-list{padding:10px}.expand-button{padding-left:12px}}@media(max-width:560px){.heading-copy small{font-size:10px}.parent-check{min-width:42px;flex-basis:42px}.action-option--user{grid-template-columns:auto minmax(0,1fr)}.action-option--user .override{grid-column:2;align-items:stretch;flex-direction:column}.override select{width:100%}}
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PermissionMatrixComponent {
  private readonly collapsedModules = signal<ReadonlySet<string>>(new Set());
  private readonly collapsedSubmodules = signal<ReadonlySet<string>>(new Set());
  readonly catalog = input<PermissionModule[]>([]);
  readonly mode = input<'role' | 'user'>('role');
  readonly disabled = input(false);
  readonly selectedActionIds = input<string[]>([]);
  readonly roleActionIds = input<string[]>([]);
  readonly grantedActionIds = input<string[]>([]);
  readonly deniedActionIds = input<string[]>([]);
  readonly selectedActionIdsChange = output<string[]>();
  readonly overridesChange = output<PermissionOverrides>();

  isModuleExpanded(moduleId: string): boolean { return !this.collapsedModules().has(moduleId); }
  isSubmoduleExpanded(submoduleId: string): boolean { return !this.collapsedSubmodules().has(submoduleId); }

  toggleModule(moduleId: string): void {
    this.collapsedModules.update((current) => this.toggledSet(current, moduleId));
  }

  toggleSubmodule(submoduleId: string): void {
    this.collapsedSubmodules.update((current) => this.toggledSet(current, submoduleId));
  }

  moduleActionCount(module: PermissionModule): number {
    return module.submodules.reduce((total, submodule) => total + this.submoduleActionCount(submodule), 0);
  }

  submoduleActionCount(submodule: PermissionSubmodule): number {
    return submodule.views.reduce((total, view) => total + view.actions.length, 0);
  }

  selectedModuleActionCount(module: PermissionModule): number {
    return this.selectedCount(this.moduleActionIds(module));
  }

  selectedSubmoduleActionCount(submodule: PermissionSubmodule): number {
    return this.selectedCount(this.submoduleActionIds(submodule));
  }

  isModuleSelected(module: PermissionModule): boolean {
    return this.allSelected(this.moduleActionIds(module));
  }

  isModulePartiallySelected(module: PermissionModule): boolean {
    return this.partiallySelected(this.moduleActionIds(module));
  }

  isSubmoduleSelected(submodule: PermissionSubmodule): boolean {
    return this.allSelected(this.submoduleActionIds(submodule));
  }

  isSubmodulePartiallySelected(submodule: PermissionSubmodule): boolean {
    return this.partiallySelected(this.submoduleActionIds(submodule));
  }

  isActionEffectivelySelected(actionId: string): boolean {
    return this.effectiveSelectedActionIds().has(actionId);
  }

  moduleSelectionLabel(module: PermissionModule): string {
    return this.selectionLabel(this.selectedModuleActionCount(module), this.moduleActionCount(module));
  }

  submoduleSelectionLabel(submodule: PermissionSubmodule): string {
    return this.selectionLabel(this.selectedSubmoduleActionCount(submodule), this.submoduleActionCount(submodule));
  }

  toggleModuleActions(module: PermissionModule, event: Event): void {
    this.toggleActions(this.moduleActionIds(module), (event.target as HTMLInputElement).checked);
  }

  toggleSubmoduleActions(submodule: PermissionSubmodule, event: Event): void {
    this.toggleActions(this.submoduleActionIds(submodule), (event.target as HTMLInputElement).checked);
  }

  toggleRoleAction(actionId: string): void {
    const selected = new Set(this.selectedActionIds());
    if (selected.has(actionId)) selected.delete(actionId); else selected.add(actionId);
    this.selectedActionIdsChange.emit([...selected]);
  }

  overrideValue(actionId: string): 'inherit' | 'grant' | 'deny' {
    if (this.deniedActionIds().includes(actionId)) return 'deny';
    if (this.grantedActionIds().includes(actionId)) return 'grant';
    return 'inherit';
  }

  changeOverride(actionId: string, event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    const granted = new Set(this.grantedActionIds());
    const denied = new Set(this.deniedActionIds());
    granted.delete(actionId);
    denied.delete(actionId);
    if (value === 'grant') granted.add(actionId);
    if (value === 'deny') denied.add(actionId);
    this.overridesChange.emit({ grantedActionIds: [...granted], deniedActionIds: [...denied] });
  }

  inheritedLabel(action: PermissionAction): string {
    if (this.roleActionIds().includes(action.id)) return 'Permitido por el rol';
    return 'No incluido en el rol';
  }

  private toggledSet(current: ReadonlySet<string>, id: string): ReadonlySet<string> {
    const next = new Set(current);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  }

  private moduleActionIds(module: PermissionModule): string[] {
    return module.submodules.flatMap((submodule) => this.submoduleActionIds(submodule));
  }

  private submoduleActionIds(submodule: PermissionSubmodule): string[] {
    return submodule.views.flatMap((view) => view.actions.map((action) => action.id));
  }

  private selectedCount(actionIds: string[]): number {
    const selected = this.effectiveSelectedActionIds();
    return actionIds.filter((id) => selected.has(id)).length;
  }

  private effectiveSelectedActionIds(): ReadonlySet<string> {
    if (this.mode() === 'role') return new Set(this.selectedActionIds());
    return new Set(
      [...this.roleActionIds(), ...this.grantedActionIds()]
        .filter((id) => !this.deniedActionIds().includes(id)),
    );
  }

  private allSelected(actionIds: string[]): boolean {
    return actionIds.length > 0 && this.selectedCount(actionIds) === actionIds.length;
  }

  private partiallySelected(actionIds: string[]): boolean {
    const count = this.selectedCount(actionIds);
    return count > 0 && count < actionIds.length;
  }

  private selectionLabel(selected: number, total: number): string {
    if (selected === 0) return 'Inactivo';
    if (selected === total) return 'Activo';
    return 'Parcialmente activo';
  }

  private toggleActions(actionIds: string[], checked: boolean): void {
    const selected = new Set(this.selectedActionIds());
    for (const actionId of actionIds) {
      if (checked) selected.add(actionId); else selected.delete(actionId);
    }
    this.selectedActionIdsChange.emit([...selected]);
  }
}
