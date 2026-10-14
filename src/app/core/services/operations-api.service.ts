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
}

export interface SaveProductRequest {
  sku: string;
  nombre: string;
  categoriaId: string | null;
  precio: number;
  stockActual: number;
  stockMinimo: number;
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
  createdAtUtc: string;
}

export interface ReportSummary {
  products: number;
  sales: number;
  revenue: number;
}

@Injectable({ providedIn: 'root' })
export class OperationsApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  listProducts() { return this.http.get<Product[]>(`${this.baseUrl}/productos`); }
  createProduct(request: SaveProductRequest) { return this.http.post<Product>(`${this.baseUrl}/productos`, request); }
  deleteProduct(id: string) { return this.http.delete<void>(`${this.baseUrl}/productos/${encodeURIComponent(id)}`); }

  listSales() { return this.http.get<Sale[]>(`${this.baseUrl}/ventas`); }
  createSale(productId: string, quantity: number, unitPrice: number) {
    return this.http.post<Sale>(`${this.baseUrl}/ventas`, {
      detalles: [{ productoId: productId, cantidad: quantity, precioUnitario: unitPrice }],
    });
  }

  listInventory() { return this.http.get<InventoryMovement[]>(`${this.baseUrl}/inventario`); }
  registerMovement(productId: string, type: InventoryMovement['type'], quantity: number, reason: string) {
    return this.http.post<void>(`${this.baseUrl}/inventario`, {
      productoId: productId,
      tipo: type,
      cantidad: quantity,
      motivo: reason || null,
    });
  }

  listAlerts() { return this.http.get<ReplenishmentAlert[]>(`${this.baseUrl}/alertas`); }
  getSummary() { return this.http.get<ReportSummary>(`${this.baseUrl}/reportes/resumen`); }
}
