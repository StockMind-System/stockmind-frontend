import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize, forkJoin } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { NavigationService } from '../../core/services/navigation.service';
import { DetailModalComponent, DetailModalTab } from '../../shared/components/detail-modal/detail-modal.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { PermissionMatrixComponent, PermissionOverrides } from './permission-matrix.component';
import { PagedResponse, PermissionModule, RoleListItem, UserDetail, UserListItem, UsersApiService } from './users-api.service';

@Component({
  selector: 'app-usuarios-page',
  standalone: true,
  imports: [PageHeaderComponent, ReactiveFormsModule, PermissionMatrixComponent, DetailModalComponent],
  template: `
    <section class="page">
      <app-page-header title="Usuarios" subtitle="Consulta cuentas, edita sus datos y administra excepciones de acceso sobre el rol asignado." />

      @if (message()) { <p class="feedback" role="status">{{ message() }}</p> }
      @if (actionError() && !modalOpen()) { <p class="feedback feedback--error" role="alert">{{ actionError() }}</p> }

      <div class="panel users-panel">
        <div class="toolbar users-toolbar">
          <form class="search" (ngSubmit)="applySearch()"><label class="sr-only" for="user-search">Buscar usuarios</label><input id="user-search" type="search" [formControl]="searchControl" placeholder="Buscar por nombre, correo o rol" /><button type="submit">Buscar</button></form>
          <span class="record-count">{{ response()?.totalItems ?? 0 }} usuarios</span>
        </div>

        @if (loading()) { <p class="data-state">Cargando usuarios…</p> }
        @else if (error()) { <div class="data-state data-state--error">No se pudo obtener la lista de usuarios.<button type="button" (click)="load(page())">Reintentar</button></div> }
        @else if (!response()?.items?.length) { <p class="data-state">No se encontraron usuarios.</p> }
        @else {
          <div class="data-table-wrap"><table class="data-table users-table">
            <thead><tr><th>Usuario</th><th>Correo</th><th>Rol</th><th>Estado</th><th>Acciones</th></tr></thead>
            <tbody>@for (user of response()!.items; track user.id) {
              <tr><td><div class="identity"><span class="user-avatar">{{ initials(user) }}</span><strong>{{ user.name }}</strong></div></td><td>{{ user.email }}</td><td><span class="role">{{ roleLabel(user.role) }}</span></td><td>@if (permissions.hasAction('action-users-status')) { <label class="status-toggle" [class.status-toggle--busy]="statusChangingId() === user.id"><input type="checkbox" [checked]="user.active" [disabled]="statusChangingId() === user.id || user.id === currentUserId()" (change)="toggleUserFromList(user, $event)" [attr.aria-label]="(user.active ? 'Inactivar a ' : 'Activar a ') + user.name"><span class="status-toggle__track"><span class="status-toggle__thumb"></span></span><strong>{{ statusChangingId() === user.id ? 'Guardando…' : (user.active ? 'Activo' : 'Inactivo') }}</strong></label> } @else { <strong>{{ user.active ? 'Activo' : 'Inactivo' }}</strong> }</td><td><div class="row-actions"><button type="button" (click)="openUser(user.id)">Ver</button></div></td></tr>
            }</tbody>
          </table></div>
          <footer class="pagination"><span>Mostrando {{ firstItem() }}–{{ lastItem() }} de {{ response()!.totalItems }}</span><div><button type="button" [disabled]="page() <= 1" (click)="goToPage(page() - 1)">Anterior</button><span>Página {{ page() }} de {{ response()!.totalPages }}</span><button type="button" [disabled]="page() >= response()!.totalPages" (click)="goToPage(page() + 1)">Siguiente</button></div></footer>
        }
      </div>

      @if (modalOpen()) {
        <app-detail-modal
          eyebrow="Detalle del usuario"
          titleId="user-modal-title"
          [title]="selectedUser()?.name ?? 'Usuario'"
          [subtitle]="selectedUser()?.email ?? ''"
          [avatarText]="selectedUser() ? initials(selectedUser()!) : ''"
          [statusLabel]="selectedUser() ? (selectedUser()!.active ? 'Activo' : 'Inactivo') : ''"
          [active]="selectedUser()?.active ?? false"
          [closeDisabled]="saving() || resettingPassword()"
          [loading]="panelLoading()"
          loadingMessage="Cargando datos del usuario…"
          [loadFailed]="!panelLoading() && !selectedUser()"
          [loadFailedMessage]="actionError() || 'No se pudo cargar el usuario.'"
          [tabs]="detailTabs"
          [activeTab]="activeTab()"
          tabsLabel="Configuración del usuario"
          [actionMode]="editing() ? 'edit' : 'view'"
          [hasUnsavedChanges]="hasUnsavedChanges()"
          [showEditAction]="permissions.hasAction('action-users-update')"
          [saving]="saving()"
          [saveDisabled]="form.invalid"
          (tabChange)="selectTab($event)"
          (editRequested)="startEditing()"
          (editCancelled)="cancelEditing()"
          (saveRequested)="save()"
          (closed)="closeModal()">
          @if (actionError() || message()) {
            <div detail-modal-feedback class="modal-feedbacks">
              @if (actionError()) { <p class="feedback feedback--error" role="alert">{{ actionError() }}</p> }
              @if (message()) { <p class="feedback" role="status">{{ message() }}</p> }
            </div>
          }

          <div detail-modal-body>
            @if (activeTab() === 'data' && selectedUser()) {
              <form class="detail-form" [formGroup]="form" (ngSubmit)="save()">
                <div class="form-field"><label for="user-name">Nombre completo</label><input id="user-name" formControlName="name" [readonly]="!editing()"></div>
                <div class="form-field"><label for="user-email">Correo electrónico</label><input id="user-email" type="email" formControlName="email" [readonly]="!editing()"></div>
                <div class="form-field"><label for="user-dni">DNI</label><input id="user-dni" formControlName="dni" inputmode="numeric" maxlength="8" [readonly]="!editing()" placeholder="8 dígitos">@if (editing() && form.controls.dni.invalid) { <small class="field-error">El DNI debe contener exactamente 8 dígitos.</small> }</div>
                <div class="form-field"><label for="user-role">Rol</label><select id="user-role" formControlName="roleCode" [attr.disabled]="editing() ? null : true"><option value="">Selecciona un rol</option>@for (role of activeRoles(); track role.id) { <option [value]="role.code">{{ role.name }}</option> }</select></div>
                <div class="form-field"><label for="user-status">Estado</label><input id="user-status" [value]="selectedUser()!.active ? 'Activo' : 'Inactivo'" readonly></div>
                <div class="form-field form-field--wide"><label for="user-id">Identificador</label><input id="user-id" [value]="selectedUser()!.id" readonly></div>
                <div class="form-field"><label for="user-permissions">Permisos efectivos</label><input id="user-permissions" [value]="effectivePermissionCount() + ' acciones'" readonly></div>
              </form>
            } @else if (selectedUser()) {
              <div class="access-intro"><strong>El rol aporta los permisos base.</strong><span>{{ editing() ? 'Puedes permitir una acción adicional o bloquearla solamente para este usuario.' : 'Los permisos se muestran en modo lectura. Pulsa Editar para realizar cambios.' }}</span></div>
              <app-permission-matrix mode="user" [catalog]="catalog()" [disabled]="!editing()" [roleActionIds]="currentRoleActionIds()" [grantedActionIds]="grantedActionIds()" [deniedActionIds]="deniedActionIds()" (overridesChange)="setOverrides($event)" />
            }
          </div>

          @if (!editing() && selectedUser() && permissions.hasAction('action-users-password-reset')) {
            <button detail-modal-footer-leading class="password-reset" type="button" [disabled]="!selectedUser()!.dni || resettingPassword()" [title]="selectedUser()!.dni ? 'La contraseña volverá a ser el DNI registrado' : 'Registra el DNI antes de restablecer la contraseña'" (click)="resetPassword()">{{ resettingPassword() ? 'Restableciendo…' : 'Restablecer contraseña' }}</button>
          } @else if (selectedUser()) {
            <span detail-modal-footer-leading>Editando información y permisos del usuario</span>
          }
        </app-detail-modal>
      }
    </section>
  `,
  styles: [`
    .feedback{margin:0;padding:12px 15px;border-radius:8px;color:var(--sm-success);background:var(--sm-success-soft);font-size:12px}.feedback--error{color:var(--sm-danger);background:var(--sm-danger-soft)}.users-panel{display:grid;gap:18px}.identity,.row-actions,.pagination,.pagination>div,.save-row,.modal-footer-content{display:flex;align-items:center}.identity{gap:11px}.user-avatar{width:38px;height:38px;display:grid;place-items:center;flex:0 0 auto;border-radius:9px;color:var(--sm-primary);background:var(--sm-primary-soft);font-size:10px;font-weight:800}.row-actions,.pagination>div,.save-row{gap:8px}.secondary,.row-actions button,.pagination button,.password-reset{min-height:34px;padding:0 11px;border:1px solid var(--sm-border);border-radius:7px;color:var(--sm-primary);background:#fff;font-weight:700}.password-reset{border-color:#d6b26c;color:var(--sm-warning)}.password-reset:disabled{cursor:not-allowed;opacity:.45}.field-error{color:var(--sm-danger);font-size:10px}.detail-form{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}.form-field--wide{grid-column:1/-1}.detail-form input[readonly],.detail-form select:disabled{color:var(--sm-text);background:#f5f7f7;opacity:1;cursor:default}.access-intro{display:grid;gap:5px;margin-bottom:14px;padding:13px;border-radius:8px;background:var(--sm-blue-soft);font-size:12px}.access-intro span,.edit-hint{color:var(--sm-muted);font-size:11px}.modal-feedbacks{display:grid;gap:8px;padding:0 24px 14px}.modal-footer-content{width:100%;justify-content:space-between;gap:18px}.users-toolbar{min-height:42px}.search{width:min(520px,100%);display:flex}.search input{min-width:0;flex:1;height:42px;padding:0 12px;border:1px solid var(--sm-border);border-radius:8px 0 0 8px}.search button{padding:0 14px;border:0;border-radius:0 8px 8px 0;color:#fff;background:var(--sm-primary);font-weight:700}.record-count{color:var(--sm-primary);font-size:12px;font-weight:800}.users-table{min-width:780px}.role{padding:5px 9px;border-radius:6px;color:var(--sm-blue);background:var(--sm-blue-soft);font-size:10px;font-weight:800}.status-toggle{display:inline-flex;align-items:center;gap:8px;font-size:12px;cursor:pointer}.status-toggle input{position:absolute;width:1px;height:1px;opacity:0}.status-toggle__track{width:36px;height:20px;display:flex;align-items:center;padding:2px;border-radius:12px;background:#aab6ba;transition:background .18s}.status-toggle__thumb{width:16px;height:16px;border-radius:50%;background:#fff;box-shadow:0 1px 3px #0003;transition:transform .18s}.status-toggle input:checked+.status-toggle__track{background:#23a773}.status-toggle input:checked+.status-toggle__track .status-toggle__thumb{transform:translateX(16px)}.status-toggle input:focus-visible+.status-toggle__track{outline:3px solid rgb(94 210 187 / 45%);outline-offset:2px}.status-toggle:has(input:disabled){cursor:not-allowed;opacity:.55}.status-toggle--busy{color:var(--sm-muted)}.pagination{justify-content:space-between;color:var(--sm-muted);font-size:12px}.pagination button:disabled{cursor:not-allowed;opacity:.45}@media(max-width:760px){.pagination,.modal-footer-content{align-items:flex-start;flex-direction:column}.detail-form{grid-template-columns:1fr}.form-field--wide{grid-column:auto}.pagination>div{width:100%;justify-content:space-between}.modal-feedbacks{padding-left:16px;padding-right:16px}}
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsuariosPage {
  readonly response = signal<PagedResponse<UserListItem> | null>(null);
  readonly roles = signal<RoleListItem[]>([]);
  readonly catalog = signal<PermissionModule[]>([]);
  readonly selectedUser = signal<UserDetail | null>(null);
  readonly grantedActionIds = signal<string[]>([]);
  readonly deniedActionIds = signal<string[]>([]);
  readonly detailTabs: readonly DetailModalTab[] = [
    { id: 'data', label: 'Datos personales' },
    { id: 'access', label: 'Permisos y acceso' },
  ];
  readonly activeTab = signal<'data' | 'access'>('data');
  readonly modalOpen = signal(false);
  readonly editing = signal(false);
  readonly panelLoading = signal(false);
  readonly saving = signal(false);
  readonly resettingPassword = signal(false);
  readonly statusChangingId = signal('');
  readonly loading = signal(true);
  readonly error = signal(false);
  readonly message = signal('');
  readonly actionError = signal('');
  readonly page = signal(1);
  readonly pageSize = signal(10);
  readonly searchControl = new FormControl('', { nonNullable: true });
  readonly form = inject(FormBuilder).nonNullable.group({ name: ['', Validators.required], email: ['', [Validators.required, Validators.email]], dni: ['', Validators.pattern(/^\d{8}$/)], roleCode: ['', Validators.required] });
  readonly currentUserId = computed(() => this.auth.user()?.id ?? '');
  readonly activeRoles = computed(() => this.roles().filter((role) => role.active || role.code === this.form.controls.roleCode.value));
  readonly currentRoleActionIds = computed(() => this.roles().find((role) => role.code === this.form.controls.roleCode.value)?.actionIds ?? []);
  readonly effectivePermissionCount = computed(() => new Set([...this.currentRoleActionIds(), ...this.grantedActionIds()].filter((id) => !this.deniedActionIds().includes(id))).size);
  readonly firstItem = computed(() => this.response()?.totalItems ? (this.page() - 1) * this.pageSize() + 1 : 0);
  readonly lastItem = computed(() => Math.min(this.page() * this.pageSize(), this.response()?.totalItems ?? 0));
  private readonly api = inject(UsersApiService);
  private readonly auth = inject(AuthService);
  readonly permissions = inject(NavigationService);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    forkJoin({ roles: this.api.listRoles(), catalog: this.api.accessCatalog() }).pipe(takeUntilDestroyed()).subscribe({
      next: ({ roles, catalog }) => { this.roles.set(roles); this.catalog.set(catalog); },
      error: (error: HttpErrorResponse) => this.actionError.set(this.errorMessage(error, 'No se pudo cargar la configuración de acceso.')),
    });
    this.load(1);
  }

  applySearch(): void { this.load(1); }
  goToPage(page: number): void { if (page >= 1 && page <= (this.response()?.totalPages ?? 1)) this.load(page); }
  load(page: number): void {
    this.loading.set(true); this.error.set(false);
    this.api.list(page, this.pageSize(), this.searchControl.value).pipe(finalize(() => this.loading.set(false)), takeUntilDestroyed(this.destroyRef)).subscribe({ next: (response) => { this.response.set(response); this.page.set(response.page); }, error: () => this.error.set(true) });
  }
  openUser(id: string): void {
    this.modalOpen.set(true); this.selectedUser.set(null); this.editing.set(false); this.panelLoading.set(true); this.actionError.set(''); this.message.set(''); this.activeTab.set('data');
    this.api.get(id).pipe(finalize(() => this.panelLoading.set(false)), takeUntilDestroyed(this.destroyRef)).subscribe({ next: (user) => this.applyUser(user), error: (error: HttpErrorResponse) => this.actionError.set(this.errorMessage(error, 'No se pudo cargar el usuario.')) });
  }
  startEditing(): void { this.editing.set(true); }
  selectTab(tabId: string): void { if (tabId === 'data' || tabId === 'access') this.activeTab.set(tabId); }
  cancelEditing(): void { const user = this.selectedUser(); if (user) this.applyUser(user); this.editing.set(false); }
  closeModal(): void { if (this.saving() || this.resettingPassword()) return; this.modalOpen.set(false); this.selectedUser.set(null); this.editing.set(false); this.actionError.set(''); }
  setOverrides(value: PermissionOverrides): void { this.grantedActionIds.set(value.grantedActionIds); this.deniedActionIds.set(value.deniedActionIds); }
  hasUnsavedChanges(): boolean {
    const user = this.selectedUser();
    if (!this.editing() || !user) return false;
    const value = this.form.getRawValue();
    return value.name !== user.name
      || value.email !== user.email
      || value.dni !== user.dni
      || value.roleCode !== user.roleCode
      || !this.sameActionIds(this.grantedActionIds(), user.grantedActionIds)
      || !this.sameActionIds(this.deniedActionIds(), user.deniedActionIds);
  }
  save(): void {
    const user = this.selectedUser(); if (!user || this.form.invalid || this.saving()) return;
    this.saving.set(true); this.actionError.set(''); this.message.set('');
    this.api.update(user.id, { ...this.form.getRawValue(), grantedActionIds: this.grantedActionIds(), deniedActionIds: this.deniedActionIds() }).pipe(finalize(() => this.saving.set(false))).subscribe({ next: (updated) => { this.applyUser(updated); this.editing.set(false); this.message.set('Los datos y permisos del usuario se actualizaron.'); this.load(this.page()); if (updated.id === this.currentUserId()) this.permissions.getSidebar().subscribe({ error: () => undefined }); }, error: (error: HttpErrorResponse) => this.actionError.set(this.errorMessage(error, 'No se pudo actualizar el usuario.')) });
  }
  toggleUserFromList(user: UserListItem, event: Event): void {
    const input = event.target as HTMLInputElement;
    const active = input.checked;
    if (user.id === this.currentUserId() || this.statusChangingId()) { input.checked = user.active; return; }
    this.statusChangingId.set(user.id); this.actionError.set(''); this.message.set('');
    this.api.setStatus(user.id, active).pipe(finalize(() => this.statusChangingId.set('')), takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        const response = this.response();
        if (response) this.response.set({ ...response, items: response.items.map((item) => item.id === user.id ? { ...item, active } : item) });
        this.message.set(`${user.name} fue ${active ? 'activado' : 'inactivado'} correctamente.`);
      },
      error: (error: HttpErrorResponse) => { input.checked = user.active; this.actionError.set(this.errorMessage(error, 'No se pudo cambiar el estado del usuario.')); },
    });
  }
  resetPassword(): void {
    const user = this.selectedUser();
    if (!user?.dni || this.resettingPassword()) return;
    if (!window.confirm(`La contraseña de ${user.name} se restablecerá al DNI registrado. ¿Deseas continuar?`)) return;
    this.resettingPassword.set(true); this.actionError.set(''); this.message.set('');
    this.api.resetPassword(user.id).pipe(finalize(() => this.resettingPassword.set(false)), takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => this.message.set(`La contraseña de ${user.name} fue restablecida al DNI registrado.`),
      error: (error: HttpErrorResponse) => this.actionError.set(this.errorMessage(error, 'No se pudo restablecer la contraseña.')),
    });
  }
  initials(user: Pick<UserListItem, 'name'>): string { return user.name.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase(); }
  roleLabel(code: string): string { return this.roles().find((role) => role.code === code)?.name ?? code; }
  private applyUser(user: UserDetail): void { this.selectedUser.set(user); this.form.reset({ name: user.name, email: user.email, dni: user.dni, roleCode: user.roleCode }); this.grantedActionIds.set([...user.grantedActionIds]); this.deniedActionIds.set([...user.deniedActionIds]); }
  private sameActionIds(left: readonly string[], right: readonly string[]): boolean { return left.length === right.length && left.every((id) => right.includes(id)); }
  private errorMessage(error: HttpErrorResponse, fallback: string): string { return typeof error.error?.message === 'string' ? error.error.message : fallback; }
}
