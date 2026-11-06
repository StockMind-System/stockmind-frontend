import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

@Component({
  selector: 'app-pagination',
  standalone: true,
  template: `
    <footer class="pagination" aria-label="Paginación">
      <div class="page-size">
        <label [for]="controlId()">Filas por página</label>
        <select [id]="controlId()" [value]="pageSize()" (change)="changeSize($event)">
          <option value="10">10</option><option value="20">20</option><option value="50">50</option>
        </select>
      </div>
      <p>Mostrando {{ firstItem() }}–{{ lastItem() }} de {{ totalItems() }}</p>
      <div class="buttons">
        <button type="button" aria-label="Página anterior" [disabled]="page() <= 1" (click)="pageChange.emit(page() - 1)">‹</button>
        @for (number of pageNumbers(); track number) {
          <button type="button" [class.current]="number === page()" [attr.aria-current]="number === page() ? 'page' : null" (click)="pageChange.emit(number)">{{ number }}</button>
        }
        <button type="button" aria-label="Página siguiente" [disabled]="page() >= totalPages()" (click)="pageChange.emit(page() + 1)">›</button>
      </div>
    </footer>
  `,
  styles: [`
    .pagination{display:flex;align-items:center;justify-content:space-between;gap:16px;color:var(--sm-muted);font-size:12px}.pagination p{margin:0}.page-size{display:flex;align-items:center;gap:9px}.page-size select{height:34px;padding:0 27px 0 9px;border:1px solid var(--sm-border);border-radius:7px;color:var(--sm-text);background:#fff}.buttons{display:flex;gap:5px}.buttons button{min-width:34px;height:34px;border:1px solid var(--sm-border);border-radius:7px;color:var(--sm-text);background:#fff}.buttons button:hover:not(:disabled){border-color:var(--sm-primary);color:var(--sm-primary)}.buttons button.current{border-color:var(--sm-primary);color:#fff;background:var(--sm-primary)}.buttons button:disabled{cursor:not-allowed;opacity:.4}@media(max-width:760px){.pagination{align-items:flex-start;flex-direction:column}.buttons{align-self:stretch}.buttons button{flex:1}}
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginationComponent {
  readonly page = input.required<number>();
  readonly pageSize = input.required<number>();
  readonly totalItems = input.required<number>();
  readonly totalPages = input.required<number>();
  readonly controlId = input('page-size');
  readonly pageChange = output<number>();
  readonly pageSizeChange = output<number>();
  readonly firstItem = computed(() => this.totalItems() ? (this.page() - 1) * this.pageSize() + 1 : 0);
  readonly lastItem = computed(() => Math.min(this.page() * this.pageSize(), this.totalItems()));
  readonly pageNumbers = computed(() => {
    const start = Math.max(1, Math.min(this.page() - 2, this.totalPages() - 4));
    const end = Math.min(this.totalPages(), start + 4);
    return Array.from({ length: Math.max(0, end - start + 1) }, (_, index) => start + index);
  });

  changeSize(event: Event): void {
    this.pageSizeChange.emit(Number((event.target as HTMLSelectElement).value));
  }
}
