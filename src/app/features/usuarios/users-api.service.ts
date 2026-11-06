import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface UserListItem { id: string; name: string; email: string; role: string; active: boolean; }
export interface PagedResponse<T> { items: T[]; page: number; pageSize: number; totalItems: number; totalPages: number; }
export interface UserDetail {
  id: string; name: string; email: string; dni: string; roleCode: string; roleName: string; active: boolean;
  roleActionIds: string[]; grantedActionIds: string[]; deniedActionIds: string[]; effectiveActionIds: string[];
}
export interface UpdateUserRequest {
  name: string; email: string; dni: string; roleCode: string; grantedActionIds: string[]; deniedActionIds: string[];
}
export interface RoleListItem {
  id: string; code: string; name: string; description: string; active: boolean; userCount: number; actionIds: string[];
}
export interface SaveRoleRequest { code: string; name: string; description: string; actionIds: string[]; }
export interface PermissionAction { id: string; code: string; name: string; order: number; }
export interface PermissionView { id: string; name: string; route: string; order: number; actions: PermissionAction[]; }
export interface PermissionSubmodule { id: string; name: string; order: number; views: PermissionView[]; }
export interface PermissionModule { id: string; name: string; order: number; submodules: PermissionSubmodule[]; }

@Injectable({ providedIn: 'root' })
export class UsersApiService {
  private readonly http = inject(HttpClient);

  list(page: number, pageSize: number, search: string) {
    let params = new HttpParams().set('page', page).set('pageSize', pageSize);
    if (search.trim()) params = params.set('search', search.trim());
    return this.http.get<PagedResponse<UserListItem>>(`${environment.apiUrl}/usuarios`, { params });
  }
  get(id: string) { return this.http.get<UserDetail>(`${environment.apiUrl}/usuarios/${encodeURIComponent(id)}`); }
  update(id: string, request: UpdateUserRequest) {
    return this.http.put<UserDetail>(`${environment.apiUrl}/usuarios/${encodeURIComponent(id)}`, request);
  }
  setStatus(id: string, active: boolean) {
    return this.http.patch<UserDetail>(`${environment.apiUrl}/usuarios/${encodeURIComponent(id)}/status`, { active });
  }
  resetPassword(id: string) {
    return this.http.post<void>(`${environment.apiUrl}/usuarios/${encodeURIComponent(id)}/reset-password`, {});
  }
  listRoles() { return this.http.get<RoleListItem[]>(`${environment.apiUrl}/roles`); }
  createRole(request: SaveRoleRequest) { return this.http.post<RoleListItem>(`${environment.apiUrl}/roles`, request); }
  updateRole(id: string, request: SaveRoleRequest) {
    return this.http.put<RoleListItem>(`${environment.apiUrl}/roles/${encodeURIComponent(id)}`, request);
  }
  setRoleStatus(id: string, active: boolean) {
    return this.http.patch<RoleListItem>(`${environment.apiUrl}/roles/${encodeURIComponent(id)}/status`, { active });
  }
  accessCatalog() { return this.http.get<PermissionModule[]>(`${environment.apiUrl}/access/catalog`); }
}
