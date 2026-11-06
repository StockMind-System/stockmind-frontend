import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface SidebarAction { id: string; code: string; name: string; order: number; }
export interface SidebarView { id: string; name: string; route: string; order: number; actions: SidebarAction[]; }
export interface SidebarSubmodule { id: string; name: string; order: number; views: SidebarView[]; }
export interface SidebarModule { id: string; name: string; icon: string; order: number; submodules: SidebarSubmodule[]; }

@Injectable({ providedIn: 'root' })
export class NavigationService {
  private readonly http = inject(HttpClient);
  private readonly sidebarModules = signal<SidebarModule[]>([]);
  readonly modules = this.sidebarModules.asReadonly();
  readonly actionIds = computed(() => new Set(
    this.sidebarModules().flatMap((module) =>
      module.submodules.flatMap((submodule) =>
        submodule.views.flatMap((view) => view.actions.map((action) => action.id)))),
  ));

  getSidebar() {
    return this.http.get<SidebarModule[]>(`${environment.apiUrl}/navigation/sidebar`).pipe(
      tap((modules) => this.sidebarModules.set(modules)),
    );
  }

  hasAction(actionId: string): boolean { return this.actionIds().has(actionId); }
}
