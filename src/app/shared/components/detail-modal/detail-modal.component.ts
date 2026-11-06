import { ChangeDetectionStrategy, Component, HostListener, input, output, signal } from '@angular/core';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';

export interface DetailModalTab {
  id: string;
  label: string;
}

export type DetailModalActionMode = 'view' | 'edit' | 'create';

@Component({
  selector: 'app-detail-modal',
  standalone: true,
  imports: [ConfirmationDialogComponent],
  template: `
    <div class="modal-backdrop" (click)="requestClose()">
      <section class="detail-modal" role="dialog" aria-modal="true" [attr.aria-labelledby]="titleId()" (click)="$event.stopPropagation()">
        @if (loading()) {
          <div class="modal-state"><span class="spinner" aria-hidden="true"></span><p>{{ loadingMessage() }}</p></div>
        } @else if (loadFailed()) {
          <div class="modal-state"><p>{{ loadFailedMessage() }}</p><button class="secondary" type="button" (click)="requestClose()">Cerrar</button></div>
        } @else {
          <header class="detail-modal__header">
            <div class="identity">
              @if (avatarText()) { <span class="avatar" aria-hidden="true">{{ avatarText() }}</span> }
              <div class="heading">
                <span class="eyebrow">{{ eyebrow() }}</span>
                <h2 [id]="titleId()">{{ title() }}</h2>
                @if (subtitle()) { <small>{{ subtitle() }}</small> }
              </div>
            </div>
            <div class="header-actions">
              @if (statusLabel()) { <span class="status"><i [class.inactive]="!active()"></i>{{ statusLabel() }}</span> }
              <button class="close-button" type="button" [attr.aria-label]="closeLabel()" [disabled]="closeDisabled()" (click)="requestClose()">×</button>
            </div>
          </header>

          <ng-content select="[detail-modal-feedback]" />

          @if (tabs().length) {
            <nav class="tabs" [attr.aria-label]="tabsLabel()">
              @for (tab of tabs(); track tab.id) {
                <button type="button" [class.active]="activeTab() === tab.id" (click)="tabChange.emit(tab.id)">{{ tab.label }}</button>
              }
            </nav>
          }

          <div class="detail-modal__body"><ng-content select="[detail-modal-body]" /></div>
          <footer class="detail-modal__footer">
            <div class="footer-leading">
              <ng-content select="[detail-modal-footer-leading]" />
              @if (hasUnsavedChanges()) { <span class="unsaved-indicator" role="status"><i aria-hidden="true"></i>Cambios sin guardar</span> }
            </div>
            <div class="footer-actions">
              @if (actionMode() === 'view') {
                <button class="secondary" type="button" (click)="requestClose()">Cancelar</button>
                @if (showEditAction()) { <button class="primary" type="button" (click)="editRequested.emit()">{{ editLabel() }}</button> }
              } @else if (actionMode() === 'create') {
                <button class="secondary" type="button" [disabled]="saving()" (click)="requestClose()">Cancelar</button>
                <button class="primary" type="button" [disabled]="saveDisabled() || saving()" (click)="saveRequested.emit()">{{ saving() ? savingLabel() : createLabel() }}</button>
              } @else {
                <button class="secondary" type="button" [disabled]="saving()" (click)="requestCancelEditing()">Cancelar</button>
                <button class="primary" type="button" [disabled]="saveDisabled() || saving()" (click)="saveRequested.emit()">{{ saving() ? savingLabel() : saveLabel() }}</button>
              }
            </div>
          </footer>
          @if (discardPromptOpen()) {
            <app-confirmation-dialog
              title="¿Descartar los cambios?"
              message="Los cambios realizados no se guardarán. Esta acción no se puede deshacer."
              confirmLabel="Descartar cambios"
              cancelLabel="Continuar editando"
              (confirmed)="confirmDiscard()"
              (cancelled)="dismissDiscardPrompt()" />
          }
        }
      </section>
    </div>
  `,
  styles: [`
    .modal-backdrop{position:fixed;z-index:1000;inset:0;display:grid;place-items:center;padding:24px;background:rgba(13,39,48,.52);backdrop-filter:blur(2px)}
    .detail-modal{position:relative;width:min(1080px,100%);height:min(860px,calc(100vh - 32px));display:flex;flex-direction:column;border-radius:14px;background:#fff;box-shadow:0 24px 70px rgba(6,28,34,.3);overflow:hidden}
    .detail-modal__header{display:flex;align-items:center;justify-content:space-between;flex:0 0 auto;gap:18px;padding:18px 24px}
    .identity,.header-actions{display:flex;align-items:center}.identity{min-width:0;gap:11px}.header-actions{gap:12px}.heading{min-width:0;display:grid;gap:4px}.heading h2{margin:0;font-size:19px}.heading small{overflow:hidden;color:var(--sm-muted);font-size:10px;text-overflow:ellipsis;white-space:nowrap}
    .avatar{width:46px;height:46px;display:grid;place-items:center;flex:0 0 auto;border-radius:9px;color:var(--sm-primary);background:var(--sm-primary-soft);font-size:12px;font-weight:800}.eyebrow{margin:0;color:var(--sm-primary);font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.08em}
    .status{display:inline-flex;align-items:center;gap:7px;font-size:12px;font-weight:700}.status i{width:7px;height:7px;border-radius:50%;background:#23a773}.status i.inactive{background:#9aa8ae}
    .close-button{width:34px;height:34px;border:1px solid var(--sm-border);border-radius:8px;color:var(--sm-muted);background:#fff;font-size:22px;line-height:1}.close-button:disabled{cursor:not-allowed;opacity:.45}.close-button:focus-visible{outline:3px solid rgb(94 210 187 / 45%);outline-offset:2px}
    .tabs{display:flex;flex:0 0 auto;gap:4px;padding:0 24px;border-bottom:1px solid var(--sm-border)}.tabs button{padding:12px 14px;border:0;border-bottom:3px solid transparent;color:var(--sm-muted);background:transparent;font-weight:700}.tabs button.active{border-color:var(--sm-primary);color:var(--sm-primary)}
    .detail-modal__body{min-height:0;flex:1 1 250px;padding:16px 24px;overflow:auto}.detail-modal__footer,.footer-actions{display:flex;align-items:center}.detail-modal__footer{min-height:62px;justify-content:space-between;flex:0 0 auto;gap:18px;padding:12px 24px;border-top:1px solid var(--sm-border);background:#fafbfb}.footer-leading{min-width:0;display:flex;align-items:center;gap:12px;color:var(--sm-muted);font-size:11px}.unsaved-indicator{display:inline-flex;align-items:center;gap:6px;padding:5px 9px;border-radius:999px;color:#946412;background:#fff2d8;font-weight:700;white-space:nowrap}.unsaved-indicator i{width:6px;height:6px;border-radius:50%;background:#d69419}.footer-actions{flex:0 0 auto;gap:8px}
    .primary,.secondary{min-height:34px;padding:0 11px;border-radius:7px;font-weight:700}.primary{border:1px solid transparent;color:#fff;background:var(--sm-primary)}.primary:hover{background:var(--sm-primary-hover)}.primary:disabled,.secondary:disabled{cursor:not-allowed;opacity:.65}.secondary{border:1px solid var(--sm-border);color:var(--sm-primary);background:#fff}
    .modal-state{min-height:300px;display:grid;place-content:center;justify-items:center;gap:12px;padding:24px;color:var(--sm-muted);text-align:center}.modal-state p{margin:0}.secondary{min-height:34px;padding:0 11px;border:1px solid var(--sm-border);border-radius:7px;color:var(--sm-primary);background:#fff;font-weight:700}.spinner{width:30px;height:30px;border:3px solid var(--sm-border);border-top-color:var(--sm-primary);border-radius:50%;animation:spin .8s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}
    @media(max-width:760px){.modal-backdrop{padding:10px}.detail-modal{max-height:calc(100vh - 20px)}.detail-modal__header,.detail-modal__footer{align-items:flex-start;flex-direction:column}.header-actions{width:100%;justify-content:space-between}.detail-modal__header,.detail-modal__body,.detail-modal__footer{padding-left:16px;padding-right:16px}.footer-actions{width:100%;justify-content:flex-end}.tabs{padding:0 8px}}
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetailModalComponent {
  readonly eyebrow = input.required<string>();
  readonly title = input.required<string>();
  readonly titleId = input.required<string>();
  readonly subtitle = input('');
  readonly avatarText = input('');
  readonly statusLabel = input('');
  readonly active = input(true);
  readonly closeDisabled = input(false);
  readonly closeLabel = input('Cerrar detalle');
  readonly loading = input(false);
  readonly loadingMessage = input('Cargando información…');
  readonly loadFailed = input(false);
  readonly loadFailedMessage = input('No se pudo cargar la información.');
  readonly tabs = input<readonly DetailModalTab[]>([]);
  readonly activeTab = input('');
  readonly tabsLabel = input('Secciones del detalle');
  readonly actionMode = input<DetailModalActionMode>('view');
  readonly hasUnsavedChanges = input(false);
  readonly showEditAction = input(true);
  readonly editLabel = input('Editar');
  readonly createLabel = input('Crear');
  readonly saveLabel = input('Guardar cambios');
  readonly savingLabel = input('Guardando…');
  readonly saving = input(false);
  readonly saveDisabled = input(false);
  readonly closed = output<void>();
  readonly tabChange = output<string>();
  readonly editRequested = output<void>();
  readonly editCancelled = output<void>();
  readonly saveRequested = output<void>();
  readonly discardPromptOpen = signal(false);
  private discardAction: 'close' | 'cancel' | null = null;

  @HostListener('document:keydown.escape')
  requestClose(): void {
    if (this.discardPromptOpen()) { this.dismissDiscardPrompt(); return; }
    if (this.closeDisabled()) return;
    if (this.hasUnsavedChanges()) { this.openDiscardPrompt('close'); return; }
    this.closed.emit();
  }

  requestCancelEditing(): void {
    if (this.hasUnsavedChanges()) { this.openDiscardPrompt('cancel'); return; }
    this.editCancelled.emit();
  }

  confirmDiscard(): void {
    const action = this.discardAction;
    this.dismissDiscardPrompt();
    if (action === 'close') this.closed.emit();
    if (action === 'cancel') this.editCancelled.emit();
  }

  dismissDiscardPrompt(): void {
    this.discardPromptOpen.set(false);
    this.discardAction = null;
  }

  private openDiscardPrompt(action: 'close' | 'cancel'): void {
    this.discardAction = action;
    this.discardPromptOpen.set(true);
  }
}
