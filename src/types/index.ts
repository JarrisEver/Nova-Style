export type Role =
  | 'ADMINISTRADOR'
  | 'VENDEDOR'
  | 'CAJERO'
  | 'ALMACENERO'
  | 'COMPRADOR'
  | 'SUPERVISOR'
  | 'GERENCIA'
  | 'CLIENTE';

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  role: Role;
  status: 'ACTIVO' | 'INACTIVO';
  lastLogin: string;
  avatar: string;
  phone?: string;
}

export interface ProductVariant {
  id: string;
  sku: string;
  size: string;
  color: string;
  model: string;
  stock: number;
  minStock: number;
  location: string;
}

export interface Product {
  id: string;
  code: string;
  name: string;
  brand: string;
  category: string;
  subcategory: string;
  description: string;
  price: number;
  cost: number;
  status: 'ACTIVO' | 'INACTIVO';
  image: string;
  variants: ProductVariant[];
  createdAt: string;
}

export type MovementType =
  | 'ENTRADA'
  | 'SALIDA'
  | 'AJUSTE'
  | 'TRANSFERENCIA'
  | 'RECEPCION'
  | 'VENTA'
  | 'DEVOLUCION';

export interface InventoryMovement {
  id: string;
  date: string;
  time: string;
  type: MovementType;
  productId: string;
  productName: string;
  variantId: string;
  variantDesc: string;
  sku: string;
  quantity: number;
  previousStock: number;
  newStock: number;
  userId: string;
  userName: string;
  reference: string;
  reason?: string;
}

export interface SaleItem {
  variantId: string;
  productId: string;
  productName: string;
  variantDesc: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  discount: number;
}

export type PaymentMethod = 'EFECTIVO' | 'TARJETA' | 'YAPE_PLIN' | 'PAGO_ELECTRONICO';

export interface Sale {
  id: string;
  saleNumber: string;
  date: string;
  time: string;
  channel: 'PRESENCIAL' | 'ONLINE';
  clientId: string;
  clientName: string;
  clientDoc: string;
  clientDocType: 'DNI' | 'RUC' | 'CE';
  items: SaleItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: 'APROBADO' | 'RECHAZADO' | 'PENDIENTE';
  cashReceived?: number;
  change?: number;
  sellerId: string;
  sellerName: string;
  promotionCode?: string;
  status: 'COMPLETADA' | 'ANULADA' | 'CON_DEVOLUCION';
  receiptType: 'BOLETA' | 'FACTURA' | 'TICKET';
}

export interface CashRegister {
  isOpen: boolean;
  openedAt?: string;
  closedAt?: string;
  openedByUserId?: string;
  openedByUserName?: string;
  initialCash: number;
  cashSales: number;
  electronicSales: number;
  totalCollected: number;
  totalOperations: number;
  expectedCash: number;
  declaredCash?: number;
  difference?: number;
  status: 'ABIERTA' | 'CERRADA';
}

export interface PurchaseOrderItem {
  productId: string;
  productName: string;
  variantId: string;
  variantDesc: string;
  sku: string;
  requestedQty: number;
  receivedQty: number;
  unitCost: number;
  subtotal: number;
}

export type PurchaseOrderStatus =
  | 'BORRADOR'
  | 'EMITIDA'
  | 'ENVIADA'
  | 'PARCIAL'
  | 'RECIBIDA'
  | 'CANCELADA';

export interface PurchaseOrder {
  id: string;
  orderNumber: string;
  supplierId: string;
  supplierName: string;
  supplierRuc: string;
  date: string;
  expectedDate: string;
  items: PurchaseOrderItem[];
  total: number;
  status: PurchaseOrderStatus;
  notes?: string;
  receivedAt?: string;
  receivedBy?: string;
}

export interface Supplier {
  id: string;
  name: string;
  ruc: string;
  contact: string;
  phone: string;
  email: string;
  address: string;
  category: string;
  status: 'ACTIVO' | 'INACTIVO';
}

export interface Client {
  id: string;
  name: string;
  documentType: 'DNI' | 'RUC' | 'CE';
  document: string;
  phone: string;
  email: string;
  address: string;
  totalPurchases: number;
  totalSpent: number;
  lastPurchaseDate?: string;
  status: 'ACTIVO' | 'INACTIVO';
}

export interface Promotion {
  id: string;
  code: string;
  name: string;
  type: 'PORCENTAJE' | 'MONTO_FIJO' | 'CONDICION';
  value: number; // e.g. 15 for 15%, or 20 for S/ 20 off
  targetType: 'GENERAL' | 'CATEGORIA' | 'MARCA' | 'PRODUCTO';
  targetValue?: string;
  minPurchaseAmount?: number;
  startDate: string;
  endDate: string;
  status: 'ACTIVA' | 'INACTIVA';
  description: string;
}

export interface ReturnRecord {
  id: string;
  returnNumber: string;
  saleId: string;
  saleNumber: string;
  date: string;
  clientId: string;
  clientName: string;
  productId: string;
  productName: string;
  variantId: string;
  variantDesc: string;
  sku: string;
  quantity: number;
  refundAmount: number;
  reason: string;
  resolution: 'CAMBIO' | 'DEVOLUCION_EFECTIVO' | 'NOTA_CREDITO';
  requiresApproval: boolean;
  isApproved: boolean;
  approvedBy?: string;
  approvedAt?: string;
  processedBy: string;
  status: 'APROBADA' | 'PENDIENTE_SUPERVISOR' | 'RECHAZADA';
}

export type OnlineOrderStatus =
  | 'PENDIENTE'
  | 'CONFIRMADO'
  | 'PREPARADO'
  | 'ENVIADO'
  | 'ENTREGADO'
  | 'CANCELADO'
  | 'DEVUELTO';

export interface OnlineOrder {
  id: string;
  orderNumber: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  deliveryAddress: string;
  date: string;
  items: SaleItem[];
  subtotal: number;
  shippingFee: number;
  total: number;
  paymentMethod: string;
  status: OnlineOrderStatus;
  trackingCode?: string;
  notes?: string;
}

export interface AuditLog {
  id: string;
  date: string;
  time: string;
  userId: string;
  userName: string;
  role: Role;
  module: string;
  action: string;
  reference: string;
  details?: string;
}

export interface StoreSettings {
  storeName: string;
  commercialName: string;
  ruc: string;
  address: string;
  phone: string;
  email: string;
  taxRate: number; // e.g. 0.18 for 18% IGV
  currency: string; // e.g. 'S/'
  ticketPrefix: string;
  invoicePrefix: string;
}

export type ActiveView =
  | 'dashboard'
  | 'pos'
  | 'products'
  | 'inventory'
  | 'purchases'
  | 'cash-register'
  | 'online-orders'
  | 'returns'
  | 'promotions'
  | 'clients'
  | 'suppliers'
  | 'reports'
  | 'users'
  | 'audit'
  | 'settings';
