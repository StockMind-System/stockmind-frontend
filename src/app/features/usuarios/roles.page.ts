import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize, forkJoin } from 'rxjs';
import { NavigationService } from '../../core/services/navigation.service';
import { DetailModalComponent, DetailModalTab } from '../../shared/components/detail-modal/detail-modal.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { PermissionMatrixComponent } from './permission-matrix.component';
import { PermissionModule, RoleListItem, UsersApiService } from './users-api.service';

@Component({
  selector: 'app-roles-page',
  standalone: true,
  imports: [PageHeaderComponent, ReactiveFormsModule, PermissionMatrixComponent, DetailModalComponent],
  template: `
    <section class="page">
      <app-page-header title="Roles y permisos" subtitle="Consulta los roles, configura sus permisos y controla el acceso base que heredan los usuarios." />
      @if (message()) { <p class="feedback" role="status">{{ message() }}</p> }
      @if (error() && !modalOpen()) { <p class="feedback feedback--error" role="alert">{{ error() }}</p> }

      <section class="panel roles-panel">
        <header class="roles-header"><div><h2>Roles disponibles</h2><p>Un rol solo puede inactivarse cuando no tiene usuarios asociados.</p></div>@if (permissions.hasAction('action-roles-create')) { <button class="button" type="button" (click)="newRole()">Nuevo rol</button> }</header>
        @if (loading()) { <p class="data-state">Cargando roles…</p> }
        @else {
          <div class="data-table-wrap"><table class="data-table roles-table"><thead><tr><th>Rol</th><th>Descripción</th><th>Usuarios</th><th>Permisos</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>
            @for (role of roles(); track role.id) {
              <tr>
                <td><strong>{{ role.name }}</strong><code>{{ role.code }}</code></td>
                <td>{{ role.description || 'Sin descripción' }}</td>
                <td>{{ role.userCount }}</td>
                <td>{{ role.actionIds.length }} acciones</td>
                <td>@if (permissions.hasAction('action-roles-status')) { <label class="status-toggle" [class.status-toggle--busy]="statusChangingId() === role.id" [title]="role.active && role.userCount > 0 ? 'No se puede inactivar porque tiene usuarios asociados' : ''"><input type="checkbox" [checked]="role.active" [disabled]="statusChangingId() === role.id || (role.active && role.userCount > 0)" (change)="toggleRoleFromList(role, $event)" [attr.aria-label]="(role.active ? 'Inactivar rol ' : 'Activar rol ') + role.name"><span class="status-toggle__track"><span class="status-toggle__thumb"></span></span><strong>{{ statusChangingId() === role.id ? 'Guardando…' : (role.active ? 'Activo' : 'Inactivo') }}</strong></label> } @else { <strong>{{ role.active ? 'Activo' : 'Inactivo' }}</strong> }</td>
                <td><div class="row-actions"><button type="button" (click)="openRole(role)">Ver</button></div></td>
              </tr>
            }
          </tbody></table></div>
        }
      </section>

      @if (modalOpen()) {
        <app-detail-modal
          [eyebrow]="creating() ? 'Nuevo rol' : 'Detalle del rol'"
          titleId="role-modal-title"
          [title]="creating() ? 'Crear rol' : (selectedRole()?.name ?? 'Rol')"
          [subtitle]="roleSubtitle()"
          [avatarText]="creating() ? '+' : roleInitials()"
          [statusLabel]="creating() ? '' : (selectedRole()?.active ? 'Activo' : 'Inactivo')"
          [active]="selectedRole()?.active ?? false"
          [closeDisabled]="saving()"
          [tabs]="detailTabs"
          [activeTab]="activeTab()"
          tabsLabel="Configuración del rol"
          [actionMode]="creating() ? 'create' : (editing() ? 'edit' : 'view')"
          [hasUnsavedChanges]="hasUnsavedChanges()"
          [showEditAction]="permissions.hasAction('action-roles-update')"
          createLabel="Crear rol"
          [saving]="saving()"
          [saveDisabled]="form.invalid"
          (tabChange)="selectTab($event)"
          (editRequested)="startEditing()"
          (editCancelled)="cancelEditing()"
          (saveRequested)="save()"
          (closed)="closeModal()">
          @if (error()) {
            <div detail-modal-feedback class="modal-feedbacks"><p class="feedback feedback--error" role="alert">{{ error() }}</p></div>
          }

          <div detail-modal-body>
            @if (activeTab() === 'data') {
              <form class="role-form" [formGroup]="form" (ngSubmit)="save()">
                <div class="form-field"><label for="role-code">Código</label><input id="role-code" formControlName="code" [readonly]="!creating()" placeholder="SUPERVISOR"></div>
                <div class="form-field"><label for="role-name">Nombre</label><input id="role-name" formControlName="name" [readonly]="!editing()" placeholder="Supervisor"></div>
                <div class="form-field form-field--wide"><label for="role-description">Descripción</label><input id="role-description" formControlName="description" [readonly]="!editing()" placeholder="Responsabilidades y alcance del rol"></div>
              </form>
            } @else {
              <div class="access-intro"><strong>Permisos del rol</strong><span>{{ editing() ? 'Marca las acciones que recibirán todos los usuarios asignados a este rol.' : 'Los permisos están en modo lectura. Pulsa Editar para realizar cambios.' }}</span></div>
              <app-permission-matrix mode="role" [catalog]="catalog()" [disabled]="!editing()" [selectedActionIds]="selectedActionIds()" (selectedActionIdsChange)="selectedActionIds.set($event)" />
            }
          </div>

          @if (editing() && !creating()) { <span detail-modal-footer-leading>Editando información y permisos del rol</span> }
        </app-detail-modal>
      }
    </section>
  `,
  styles: [`
    .feedback{margin:0;padding:12px 15px;border-radius:8px;color:var(--sm-success);background:var(--sm-success-soft);font-size:12px}.feedback--error{color:var(--sm-danger);background:var(--sm-danger-soft)}.roles-panel{display:grid;gap:18px}.roles-header,.save-row,.row-actions,.modal-footer-content{display:flex;align-items:center}.roles-header{justify-content:space-between;gap:16px}.roles-header h2{margin:0;font-size:18px}.roles-header p{margin:6px 0 0;color:var(--sm-muted);font-size:12px}.secondary,.row-actions button{min-height:34px;padding:0 11px;border:1px solid var(--sm-border);border-radius:7px;color:var(--sm-primary);background:#fff;font-weight:700}.save-row{justify-content:flex-end;gap:8px}.roles-table{min-width:900px}.roles-table td:first-child{display:grid;gap:4px}.roles-table code{color:var(--sm-muted);font-size:10px}.row-actions{gap:6px}.status-toggle{display:inline-flex;align-items:center;gap:8px;font-size:12px;cursor:pointer}.status-toggle input{position:absolute;width:1px;height:1px;opacity:0}.status-toggle__track{width:36px;height:20px;display:flex;align-items:center;padding:2px;border-radius:12px;background:#aab6ba;transition:background .18s}.status-toggle__thumb{width:16px;height:16px;border-radius:50%;background:#fff;box-shadow:0 1px 3px #0003;transition:transform .18s}.status-toggle input:checked+.status-toggle__track{background:#23a773}.status-toggle input:checked+.status-toggle__track .status-toggle__thumb{transform:translateX(16px)}.status-toggle input:focus-visible+.status-toggle__track{outline:3px solid rgb(94 210 187 / 45%);outline-offset:2px}.status-toggle:has(input:disabled){cursor:not-allowed;opacity:.55}.status-toggle--busy{color:var(--sm-muted)}.modal-feedbacks{padding:0 24px 14px}.modal-footer-content{width:100%;justify-content:space-between;gap:18px}.role-form{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}.form-field--wide{grid-column:1/-1}.role-form input[readonly]{color:var(--sm-text);background:#f5f7f7;cursor:default}.access-intro{display:grid;gap:5px;margin-bottom:14px;padding:13px;border-radius:8px;background:var(--sm-blue-soft);font-size:12px}.access-intro span,.edit-hint{color:var(--sm-muted);font-size:11px}@media(max-width:760px){.roles-header,.modal-footer-content{align-items:flex-start;flex-direction:column}.role-form{grid-template-columns:1fr}.form-field--wide{grid-column:auto}.roles-header .button{width:100%}.modal-feedbacks{padding-left:16px;padding-right:16px}}
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RolesPage {
  readonly roles = signal<RoleListItem[]>([]);
  readonly catalog = signal<PermissionModule[]>([]);
  readonly selectedRole = signal<RoleListItem | null>(null);
  readonly selectedActionIds = signal<string[]>([]);
  readonly detailTabs: readonly DetailModalTab[] = [
    { id: 'data', label: 'Datos del rol' },
    { id: 'access', label: 'Permisos y acceso' },
  ];
  readonly activeTab = signal<'data' | 'access'>('data');
  readonly modalOpen = signal(false);
  readonly editing = signal(false);
  readonly creating = signal(false);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly statusChangingId = signal('');
  readonly message = signal('');
  readonly error = signal('');
  readonly form = inject(FormBuilder).nonNullable.group({ code: ['', Validators.required], name: ['', Validators.required], description: [''] });
  readonly permissions = inject(NavigationService);
  private readonly api = inject(UsersApiService);

  constructor() { this.load(); }

  load(): void {
    this.loading.set(true); this.error.set('');
    forkJoin({ roles: this.api.listRoles(), catalog: this.api.accessCatalog() }).pipe(finalize(() => this.loading.set(false))).subscribe({ next: ({ roles, catalog }) => { this.roles.set(roles); this.catalog.set(catalog); }, error: (error: HttpErrorResponse) => this.error.set(this.errorMessage(error, 'No se pudieron cargar los roles.')) });
  }

  newRole(): void {
    this.selectedRole.set(null); this.creating.set(true); this.editing.set(true); this.activeTab.set('data'); this.modalOpen.set(true); this.selectedActionIds.set([]); this.form.reset({ code: '', name: '', description: '' }); this.clearFeedback();
  }

  openRole(role: RoleListItem): void {
    this.selectedRole.set(role); this.creating.set(false); this.editing.set(false); this.activeTab.set('data'); this.modalOpen.set(true); this.restoreRole(role); this.clearFeedback();
  }

  startEditing(): void { this.editing.set(true); }
  selectTab(tabId: string): void { if (tabId === 'data' || tabId === 'access') this.activeTab.set(tabId); }
  roleInitials(): string { return this.selectedRole()?.code.slice(0, 2).toUpperCase() ?? ''; }
  roleSubtitle(): string {
    const role = this.selectedRole();
    return role ? `${role.userCount} usuarios · ${role.actionIds.length} permisos` : 'Define la información y los permisos de acceso';
  }

  cancelEditing(): void {
    const role = this.selectedRole();
    if (role) this.restoreRole(role);
    this.editing.set(false); this.error.set('');
  }

  closeModal(): void {
    if (this.saving()) return;
    this.modalOpen.set(false); this.editing.set(false); this.creating.set(false); this.selectedRole.set(null); this.error.set('');
  }

  hasUnsavedChanges(): boolean {
    if (!this.editing()) return false;
    const value = this.form.getRawValue();
    const role = this.selectedRole();
    return value.code !== (role?.code ?? '')
      || value.name !== (role?.name ?? '')
      || value.description !== (role?.description ?? '')
      || !this.sameActionIds(this.selectedActionIds(), role?.actionIds ?? []);
  }

  save(): void {
    if (this.form.invalid || this.saving()) return;
    const wasCreating = this.creating();
    const request = { ...this.form.getRawValue(), actionIds: this.selectedActionIds() };
    const operation = wasCreating ? this.api.createRole(request) : this.api.updateRole(this.selectedRole()!.id, request);
    this.saving.set(true); this.clearFeedback();
    operation.pipe(finalize(() => this.saving.set(false))).subscribe({ next: (saved) => { this.message.set(wasCreating ? 'El rol fue creado.' : 'El rol y sus permisos fueron actualizados.'); this.saving.set(false); this.closeModal(); this.roles.set(wasCreating ? [...this.roles(), saved] : this.roles().map((role) => role.id === saved.id ? saved : role)); this.permissions.getSidebar().subscribe({ error: () => undefined }); }, error: (error: HttpErrorResponse) => this.error.set(this.errorMessage(error, 'No se pudo guardar el rol.')) });
  }

  toggleRoleFromList(role: RoleListItem, event: Event): void {
    const input = event.target as HTMLInputElement;
    const active = input.checked;
    if (this.statusChangingId() || (role.active && role.userCount > 0)) { input.checked = role.active; return; }
    this.statusChangingId.set(role.id); this.clearFeedback();
    this.api.setRoleStatus(role.id, active).pipe(finalize(() => this.statusChangingId.set(''))).subscribe({
      next: (updated) => { this.roles.set(this.roles().map((item) => item.id === role.id ? updated : item)); this.message.set(`El rol fue ${active ? 'activado' : 'inactivado'} correctamente.`); },
      error: (error: HttpErrorResponse) => { input.checked = role.active; this.error.set(this.errorMessage(error, 'No se pudo cambiar el estado del rol.')); },
    });
  }

  private restoreRole(role: RoleListItem): void {
    this.selectedActionIds.set([...role.actionIds]);
    this.form.reset({ code: role.code, name: role.name, description: role.description });
  }

  private sameActionIds(left: readonly string[], right: readonly string[]): boolean { return left.length === right.length && left.every((id) => right.includes(id)); }
  private clearFeedback(): void { this.message.set(''); this.error.set(''); }
  private errorMessage(error: HttpErrorResponse, fallback: string): string { return typeof error.error?.message === 'string' ? error.error.message : fallback; }
}
