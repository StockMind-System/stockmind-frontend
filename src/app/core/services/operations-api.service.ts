import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface Product {
  id: string;
  sku: string;
  nombre: string;
  categoriaId: string | null;
  precio: number;
  stockActual: number;
  stockMinimo: number;
  activo: boolean;
  leadTimeDays: number;
  orderingCost: number | null;
  annualHoldingCost: number | null;
  serviceLevel: number;
}

export interface SaveProductRequest {
  sku: string;
  nombre: string;
  categoriaId: string | null;
  precio: number;
  stockActual: number;
  stockMinimo: number;
  leadTimeDays: number;
  orderingCost: number | null;
  annualHoldingCost: number | null;
  serviceLevel: number;
}

export interface SaleDetail {
  productId: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Sale {
  id: string;
  createdAtUtc: string;
  details: SaleDetail[];
  total: number;
}

export interface InventoryMovement {
  id: string;
  productId: string;
  type: 'Entrada' | 'Salida' | 'Ajuste';
  quantity: number;
  reason: string | null;
  createdAtUtc: string;
}

export interface ReplenishmentAlert {
  id: string;
  productId: string;
  suggestedQuantity: number;
  status: string;
  sku: string;
  productName: string;
  abcClass: string;
  currentStock: number;
  minimumStock: number;
  annualDemand: number;
  meanWeeklyDemand: number;
  safetyStock: number;
  reorderPoint: number;
  eoq: number | null;
  missingInputs: string[];
  leadTimeDays: number;
  serviceLevel: number;
  createdAtUtc: string;
}

export interface ReportSummary {
  products: number;
  sales: number;
  revenue: number;
  stockouts: number;
  excessUnits: number;
  forecastAccuracy: number | null;
  planningMinutes: number | null;
  planningReason: string | null;
  periodStartUtc: string | null;
  periodEndUtc: string | null;
}

export interface PurchaseDetail { productId: string; quantity: number; unitCost: number; subtotal: number; }
export interface Purchase {
  id: string; supplier: string; documentNumber: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Received';
  details: PurchaseDetail[]; total: number; createdBy: string; createdAtUtc: string;
  reviewedBy: string | null; reviewedAtUtc: string | null; reviewReason: string | null;
  receivedBy: string | null; receivedAtUtc: string | null;
}

export interface PagedResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

@Injectable({ providedIn: 'root' })
export class OperationsApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  listProducts(page = 1, pageSize = 10, search = '') {
    let params = { page, pageSize, search };
    return this.http.get<PagedResponse<Product>>(`${this.baseUrl}/productos`, { params });
  }
  createProduct(request: SaveProductRequest) { return this.http.post<Product>(`${this.baseUrl}/productos`, request); }
  deleteProduct(id: string) { return this.http.delete<void>(`${this.baseUrl}/productos/${encodeURIComponent(id)}`); }

  listSales(page = 1, pageSize = 10) { return this.http.get<PagedResponse<Sale>>(`${this.baseUrl}/ventas`, { params: { page, pageSize } }); }
  createSale(productId: string, quantity: number, unitPrice: number) {
    return this.http.post<Sale>(`${this.baseUrl}/ventas`, {
      detalles: [{ productoId: productId, cantidad: quantity, precioUnitario: unitPrice }],
    });
  }

  listInventory(page = 1, pageSize = 10) { return this.http.get<PagedResponse<InventoryMovement>>(`${this.baseUrl}/inventario`, { params: { page, pageSize } }); }
  registerMovement(productId: string, type: InventoryMovement['type'], quantity: number, reason: string) {
    return this.http.post<void>(`${this.baseUrl}/inventario`, {
      productoId: productId,
      tipo: type,
      cantidad: quantity,
      motivo: reason || null,
    });
  }

  listPurchases(page = 1, pageSize = 10) { return this.http.get<PagedResponse<Purchase>>(`${this.baseUrl}/compras`, { params: { page, pageSize } }); }
  createPurchase(supplier: string, documentNumber: string, productId: string, quantity: number, unitCost: number) {
    return this.http.post<Purchase>(`${this.baseUrl}/compras`, { supplier, documentNumber, details: [{ productId, quantity, unitCost }] });
  }
  approvePurchase(id: string, reason: string) { return this.http.patch<Purchase>(`${this.baseUrl}/compras/${encodeURIComponent(id)}/approve`, { reason }); }
  rejectPurchase(id: string, reason: string) { return this.http.patch<Purchase>(`${this.baseUrl}/compras/${encodeURIComponent(id)}/reject`, { reason }); }
  receivePurchase(id: string) { return this.http.patch<Purchase>(`${this.baseUrl}/compras/${encodeURIComponent(id)}/receive`, {}); }

  listAlerts(page = 1, pageSize = 10) { return this.http.get<PagedResponse<ReplenishmentAlert>>(`${this.baseUrl}/alertas`, { params: { page, pageSize } }); }
  getSummary() { return this.http.get<ReportSummary>(`${this.baseUrl}/reportes/resumen`); }
}
