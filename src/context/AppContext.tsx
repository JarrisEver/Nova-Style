import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  Role,
  Product,
  Supplier,
  Client,
  Promotion,
  PurchaseOrder,
  OnlineOrder,
  OnlineOrderStatus,
  Sale,
  SaleItem,
  PaymentMethod,
  InventoryMovement,
  CashRegister,
  StoreSettings,
  AuditLog,
  ReturnRecord,
  ActiveView,
  CategoryItem,
  CartItem,
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_PRODUCTS,
  INITIAL_SUPPLIERS,
  INITIAL_CLIENTS,
  INITIAL_PROMOTIONS,
  INITIAL_PURCHASE_ORDERS,
  INITIAL_ONLINE_ORDERS,
  INITIAL_SALES,
  INITIAL_MOVEMENTS,
  INITIAL_CASH_REGISTER,
  INITIAL_SETTINGS,
  INITIAL_AUDIT_LOGS,
  INITIAL_CATEGORIES,
} from '../data/initialData';
import { BRAND_MEDIA, PRODUCT_MEDIA_BY_CATEGORY, resolveSafeAvatarUrl, resolveSafeMediaUrl } from '../assets/media';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
}

interface AppContextType {
  currentUser: User | null;
  hasAdminAccess: boolean;
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  login: (username: string) => boolean;
  loginClient: (identifier: string) => boolean;
  registerClient: (data: {
    name: string;
    documentType: 'DNI' | 'RUC' | 'CE';
    document: string;
    phone: string;
    email: string;
    address: string;
    username: string;
  }) => { success: boolean; error?: string };
  updateOwnClientProfile: (data: {
    name: string;
    phone: string;
    email: string;
    address: string;
    documentType: 'DNI' | 'RUC' | 'CE';
    document: string;
  }) => boolean;
  logout: () => void;
  switchRole: (role: Role) => void;
  hasAccessToView: (view: ActiveView) => boolean;

  // Data collections
  products: Product[];
  categories: CategoryItem[];
  suppliers: Supplier[];
  clients: Client[];
  promotions: Promotion[];
  purchaseOrders: PurchaseOrder[];
  onlineOrders: OnlineOrder[];
  sales: Sale[];
  inventoryMovements: InventoryMovement[];
  cashRegister: CashRegister;
  storeSettings: StoreSettings;
  auditLogs: AuditLog[];
  returns: ReturnRecord[];
  users: User[];

  // Storefront Cart & Checkout
  cart: CartItem[];
  appliedPromoCode: string;
  setAppliedPromoCode: (code: string) => void;
  addToCart: (item: Omit<CartItem, 'quantity'>, quantity?: number) => boolean;
  updateCartQuantity: (variantId: string, quantity: number) => void;
  removeFromCart: (variantId: string) => void;
  clearCart: () => void;
  placeOnlineOrder: (checkoutData: {
    clientName: string;
    clientEmail: string;
    clientPhone: string;
    deliveryAddress: string;
    clientDocType?: 'DNI' | 'RUC' | 'CE';
    clientDoc?: string;
    paymentMethod: string;
    promoCode?: string;
    notes?: string;
  }) => { success: boolean; order?: OnlineOrder; error?: string };

  // Toasts
  toasts: ToastMessage[];
  addToast: (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => void;
  removeToast: (id: string) => void;

  // Operations / Use Cases
  saveProduct: (product: Omit<Product, 'id' | 'createdAt'> & { id?: string }) => { success: boolean; error?: string };
  deleteProduct: (id: string) => void;

  saveCategory: (category: Omit<CategoryItem, 'id' | 'slug'> & { id?: string; slug?: string }) => { success: boolean; error?: string };
  toggleCategoryStatus: (id: string) => void;

  receivePurchaseOrder: (poId: string, receivedNotes?: string) => { success: boolean; error?: string };
  createPurchaseOrder: (poData: Omit<PurchaseOrder, 'id' | 'orderNumber' | 'status'>) => void;

  processSale: (saleData: {
    channel: 'PRESENCIAL' | 'ONLINE';
    clientId: string;
    items: SaleItem[];
    promotionCode?: string;
    paymentMethod: PaymentMethod;
    paymentStatus: 'APROBADO' | 'RECHAZADO';
    cashReceived?: number;
    receiptType: 'BOLETA' | 'FACTURA' | 'TICKET';
  }) => { success: boolean; sale?: Sale; error?: string };

  processReturn: (returnData: {
    saleId: string;
    variantId: string;
    quantity: number;
    reason: string;
    resolution: 'CAMBIO' | 'DEVOLUCION_EFECTIVO' | 'NOTA_CREDITO';
  }) => { success: boolean; requiresApproval?: boolean; error?: string };
  approveReturn: (returnId: string) => { success: boolean; error?: string };

  openCashRegister: (initialCash: number) => { success: boolean; error?: string };
  closeCashRegister: (declaredCash: number) => { success: boolean; difference: number; error?: string };

  updateOrderStatus: (orderId: string, newStatus: OnlineOrderStatus) => void;

  addManualInventoryMovement: (movement: {
    type: 'ENTRADA' | 'SALIDA' | 'AJUSTE' | 'TRANSFERENCIA';
    productId: string;
    variantId: string;
    quantity: number;
    reason: string;
  }) => { success: boolean; error?: string };

  savePromotion: (promo: Omit<Promotion, 'id'> & { id?: string }) => void;
  togglePromotionStatus: (id: string) => void;

  saveSupplier: (sup: Omit<Supplier, 'id'> & { id?: string }) => void;
  saveClient: (client: Omit<Client, 'id' | 'totalPurchases' | 'totalSpent'> & { id?: string }) => void;
  saveUser: (user: Omit<User, 'id' | 'lastLogin'> & { id?: string }) => void;
  toggleUserStatus: (id: string) => void;

  resetAllData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Visitors start unauthenticated on the public storefront (`/`) unless an explicit session exists
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('ns_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed ? { ...parsed, avatar: resolveSafeAvatarUrl(parsed.avatar) } : null;
      } catch {
        return null;
      }
    }
    return null;
  });

  const [activeView, setActiveView] = useState<ActiveView>('dashboard');

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('ns_products');
    if (saved) {
      try {
        const parsed: Product[] = JSON.parse(saved);
        return parsed.map((p) => ({
          ...p,
          image: resolveSafeMediaUrl(p.image, p.category),
        }));
      } catch {
        return INITIAL_PRODUCTS;
      }
    }
    return INITIAL_PRODUCTS;
  });

  const [categories, setCategories] = useState<CategoryItem[]>(() => {
    const saved = localStorage.getItem('ns_categories');
    if (saved) {
      try {
        const parsed: CategoryItem[] = JSON.parse(saved);
        return parsed.map((c) => ({
          ...c,
          image: resolveSafeMediaUrl(c.image, c.name),
        }));
      } catch {
        return INITIAL_CATEGORIES;
      }
    }
    return INITIAL_CATEGORIES;
  });

  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    const saved = localStorage.getItem('ns_suppliers');
    return saved ? JSON.parse(saved) : INITIAL_SUPPLIERS;
  });

  const [clients, setClients] = useState<Client[]>(() => {
    const saved = localStorage.getItem('ns_clients');
    return saved ? JSON.parse(saved) : INITIAL_CLIENTS;
  });

  const [promotions, setPromotions] = useState<Promotion[]>(() => {
    const saved = localStorage.getItem('ns_promotions');
    return saved ? JSON.parse(saved) : INITIAL_PROMOTIONS;
  });

  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(() => {
    const saved = localStorage.getItem('ns_purchase_orders');
    return saved ? JSON.parse(saved) : INITIAL_PURCHASE_ORDERS;
  });

  const [onlineOrders, setOnlineOrders] = useState<OnlineOrder[]>(() => {
    const saved = localStorage.getItem('ns_online_orders');
    return saved ? JSON.parse(saved) : INITIAL_ONLINE_ORDERS;
  });

  const [sales, setSales] = useState<Sale[]>(() => {
    const saved = localStorage.getItem('ns_sales');
    return saved ? JSON.parse(saved) : INITIAL_SALES;
  });

  const [inventoryMovements, setInventoryMovements] = useState<InventoryMovement[]>(() => {
    const saved = localStorage.getItem('ns_movements');
    return saved ? JSON.parse(saved) : INITIAL_MOVEMENTS;
  });

  const [cashRegister, setCashRegister] = useState<CashRegister>(() => {
    const saved = localStorage.getItem('ns_cash_register');
    return saved ? JSON.parse(saved) : INITIAL_CASH_REGISTER;
  });

  const [storeSettings, setStoreSettings] = useState<StoreSettings>(() => {
    const saved = localStorage.getItem('ns_settings');
    return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem('ns_audit_logs');
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  const [returns, setReturns] = useState<ReturnRecord[]>(() => {
    const saved = localStorage.getItem('ns_returns');
    return saved
      ? JSON.parse(saved)
      : [
          {
            id: 'ret-01',
            returnNumber: 'DEV-2026-001',
            saleId: 'sal-02',
            saleNumber: 'B001-000411',
            date: '2026-09-28',
            clientId: 'cli-02',
            clientName: 'Mariana Silva Ramos',
            productId: 'prod-03',
            productName: 'Vestido Midi Estampado Floral Primavera',
            variantId: 'var-03-1',
            variantDesc: 'S / Estampado',
            sku: 'NS-VES-MID-FL-S',
            quantity: 1,
            refundAmount: 179.1,
            reason: 'Prenda no entalla debidamente',
            resolution: 'CAMBIO',
            requiresApproval: false,
            isApproved: true,
            approvedBy: 'Valeria Quispe',
            approvedAt: '2026-09-28 12:40',
            processedBy: 'Valeria Quispe',
            status: 'APROBADA',
          },
        ];
  });

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('ns_users_list');
    if (saved) {
      try {
        const parsed: User[] = JSON.parse(saved);
        return parsed.map((u) => ({
          ...u,
          avatar: resolveSafeAvatarUrl(u.avatar),
        }));
      } catch {
        return INITIAL_USERS;
      }
    }
    return INITIAL_USERS;
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('ns_cart');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [];
  });

  const [appliedPromoCode, setAppliedPromoCode] = useState<string>('');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const hasAdminAccess =
    currentUser !== null && currentUser.status === 'ACTIVO' && currentUser.role !== 'CLIENTE';

  // Synchronize state with localStorage
  useEffect(() => {
    localStorage.setItem('ns_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('ns_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('ns_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('ns_suppliers', JSON.stringify(suppliers));
  }, [suppliers]);

  useEffect(() => {
    localStorage.setItem('ns_clients', JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem('ns_promotions', JSON.stringify(promotions));
  }, [promotions]);

  useEffect(() => {
    localStorage.setItem('ns_purchase_orders', JSON.stringify(purchaseOrders));
  }, [purchaseOrders]);

  useEffect(() => {
    localStorage.setItem('ns_online_orders', JSON.stringify(onlineOrders));
  }, [onlineOrders]);

  useEffect(() => {
    localStorage.setItem('ns_sales', JSON.stringify(sales));
  }, [sales]);

  useEffect(() => {
    localStorage.setItem('ns_movements', JSON.stringify(inventoryMovements));
  }, [inventoryMovements]);

  useEffect(() => {
    localStorage.setItem('ns_cash_register', JSON.stringify(cashRegister));
  }, [cashRegister]);

  useEffect(() => {
    localStorage.setItem('ns_settings', JSON.stringify(storeSettings));
  }, [storeSettings]);

  useEffect(() => {
    localStorage.setItem('ns_audit_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem('ns_returns', JSON.stringify(returns));
  }, [returns]);

  useEffect(() => {
    localStorage.setItem('ns_users_list', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('ns_cart', JSON.stringify(cart));
  }, [cart]);

  // Toast Helpers
  const addToast = (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => {
    const id = Date.now().toString() + Math.random().toString().slice(2, 6);
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Helper to log audit event
  const logAudit = (module: string, action: string, reference: string, details?: string) => {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().split(' ')[0];

    const newLog: AuditLog = {
      id: 'aud-' + Date.now() + Math.random().toString().slice(2, 5),
      date: dateStr,
      time: timeStr,
      userId: currentUser?.id || 'storefront',
      userName: currentUser?.name || 'Cliente Online',
      role: currentUser?.role || 'CLIENTE',
      module,
      action,
      reference,
      details,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const requireStaffAccess = (actionName: string): boolean => {
    if (!currentUser || currentUser.status !== 'ACTIVO' || currentUser.role === 'CLIENTE') {
      addToast(
        'error',
        'Acceso Denegado',
        `Solo el personal administrativo autorizado puede ejecutar: ${actionName}.`
      );
      return false;
    }
    return true;
  };

  // Strict RBAC Role Permissions Rule Check (Clients have ZERO access to Admin Panel)
  const hasAccessToView = (view: ActiveView): boolean => {
    if (!currentUser || currentUser.status !== 'ACTIVO') return false;
    const role = currentUser.role;
    if (role === 'CLIENTE') return false;

    switch (role) {
      case 'ADMINISTRADOR':
        return true;
      case 'VENDEDOR':
        return ['dashboard', 'pos', 'products', 'categories', 'clients', 'promotions'].includes(view);
      case 'CAJERO':
        return ['dashboard', 'cash-register', 'pos'].includes(view);
      case 'ALMACENERO':
        return ['dashboard', 'inventory', 'purchases'].includes(view);
      case 'COMPRADOR':
        return ['dashboard', 'purchases', 'suppliers', 'products', 'categories'].includes(view);
      case 'SUPERVISOR':
        return ['dashboard', 'returns', 'audit', 'pos', 'promotions', 'inventory', 'online-orders'].includes(view);
      case 'GERENCIA':
        return ['dashboard', 'reports', 'inventory', 'purchases'].includes(view);
      default:
        return false;
    }
  };

  // Corporate Staff Login (/admin/login)
  const login = (username: string): boolean => {
    const user = users.find((u) => u.username.toLowerCase() === username.trim().toLowerCase());
    if (!user || user.status !== 'ACTIVO') {
      addToast('error', 'Credenciales inválidas', 'Usuario no encontrado o cuenta desactivada.');
      return false;
    }

    if (user.role === 'CLIENTE') {
      addToast(
        'warning',
        'Portal Exclusivo de Personal',
        'Las cuentas de cliente deben ingresar desde "Mi Cuenta" en la Tienda Online.'
      );
      return false;
    }

    const updatedUser = {
      ...user,
      lastLogin: new Date().toISOString().replace('T', ' ').slice(0, 16),
    };
    setCurrentUser(updatedUser);
    setUsers((prev) => prev.map((u) => (u.id === user.id ? updatedUser : u)));
    addToast('success', 'Sesión corporativa iniciada', `Bienvenido a NS-Management, ${user.name}`);
    logAudit('Seguridad', 'Inicio de sesión administrativo', user.username, `Rol asignado: ${user.role}`);

    if (user.role === 'CAJERO') setActiveView('cash-register');
    else if (user.role === 'ALMACENERO') setActiveView('inventory');
    else if (user.role === 'COMPRADOR') setActiveView('purchases');
    else setActiveView('dashboard');
    return true;
  };

  // Storefront Customer Login (/mi-cuenta)
  const loginClient = (identifier: string): boolean => {
    const clean = identifier.trim().toLowerCase();
    if (!clean) {
      addToast('error', 'Campo requerido', 'Ingrese su usuario o correo electrónico.');
      return false;
    }

    const matchedUser = users.find(
      (u) =>
        u.role === 'CLIENTE' &&
        u.status === 'ACTIVO' &&
        (u.username.toLowerCase() === clean || u.email.toLowerCase() === clean)
    );

    if (matchedUser) {
      const updatedUser = {
        ...matchedUser,
        lastLogin: new Date().toISOString().replace('T', ' ').slice(0, 16),
      };
      setCurrentUser(updatedUser);
      setUsers((prev) => prev.map((u) => (u.id === matchedUser.id ? updatedUser : u)));
      addToast('success', 'Bienvenido a NOVAStyle', `Sesión iniciada como ${matchedUser.name}`);
      return true;
    }

    // Fallback: check existing Client directory by email
    const matchedClient = clients.find(
      (c) => c.status === 'ACTIVO' && c.email.toLowerCase() === clean
    );
    if (matchedClient) {
      const clientUser: User = {
        id: 'usr-cli-' + matchedClient.id,
        name: matchedClient.name,
        username: matchedClient.email.split('@')[0],
        email: matchedClient.email,
        role: 'CLIENTE',
        status: 'ACTIVO',
        lastLogin: new Date().toISOString().replace('T', ' ').slice(0, 16),
        avatar: BRAND_MEDIA.avatarExecutivePortrait,
        phone: matchedClient.phone,
      };
      setCurrentUser(clientUser);
      setUsers((prev) => [clientUser, ...prev]);
      addToast('success', 'Bienvenido a NOVAStyle', `Hola ${matchedClient.name}`);
      return true;
    }

    addToast('error', 'Cuenta no encontrada', 'Verifique su usuario/correo o cree una cuenta nueva.');
    return false;
  };

  // Storefront Customer Registration
  const registerClient = (data: {
    name: string;
    documentType: 'DNI' | 'RUC' | 'CE';
    document: string;
    phone: string;
    email: string;
    address: string;
    username: string;
  }): { success: boolean; error?: string } => {
    const cleanUsername = data.username.trim().toLowerCase();
    const cleanEmail = data.email.trim().toLowerCase();

    if (!data.name.trim() || !cleanUsername || !cleanEmail) {
      return { success: false, error: 'Nombre, usuario y correo electrónico son obligatorios.' };
    }

    const existsUser = users.some(
      (u) => u.username.toLowerCase() === cleanUsername || u.email.toLowerCase() === cleanEmail
    );
    if (existsUser) {
      addToast('error', 'Usuario ya registrado', 'El usuario o correo ya tiene una cuenta activa.');
      return { success: false, error: 'El usuario o correo electrónico ya está registrado.' };
    }

    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 16);
    const newClient: Client = {
      id: 'cli-' + Date.now(),
      name: data.name.trim(),
      documentType: data.documentType,
      document: data.document.trim() || '00000000',
      phone: data.phone.trim(),
      email: cleanEmail,
      address: data.address.trim() || 'Lima, Perú',
      totalPurchases: 0,
      totalSpent: 0,
      status: 'ACTIVO',
    };

    const newUser: User = {
      id: 'usr-cli-' + Date.now(),
      name: data.name.trim(),
      username: cleanUsername,
      email: cleanEmail,
      role: 'CLIENTE',
      status: 'ACTIVO',
      lastLogin: nowStr,
      avatar: BRAND_MEDIA.avatarExecutivePortrait,
      phone: data.phone.trim(),
    };

    setClients((prev) => [newClient, ...prev]);
    setUsers((prev) => [newUser, ...prev]);
    setCurrentUser(newUser);
    addToast('success', 'Cuenta creada', `Bienvenido a la tienda NOVAStyle, ${newUser.name}`);
    return { success: true };
  };

  const updateOwnClientProfile = (data: {
    name: string;
    phone: string;
    email: string;
    address: string;
    documentType: 'DNI' | 'RUC' | 'CE';
    document: string;
  }): boolean => {
    if (!currentUser || currentUser.role !== 'CLIENTE') return false;
    const oldEmail = currentUser.email.toLowerCase();

    const updatedUser: User = {
      ...currentUser,
      name: data.name.trim(),
      phone: data.phone.trim(),
      email: data.email.trim().toLowerCase(),
    };
    setCurrentUser(updatedUser);
    setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? updatedUser : u)));

    setClients((prev) => {
      const idx = prev.findIndex((c) => c.email.toLowerCase() === oldEmail);
      if (idx >= 0) {
        return prev.map((c, i) =>
          i === idx
            ? {
                ...c,
                name: data.name.trim(),
                phone: data.phone.trim(),
                email: data.email.trim().toLowerCase(),
                address: data.address.trim(),
                documentType: data.documentType,
                document: data.document.trim(),
              }
            : c
        );
      }
      return [
        {
          id: 'cli-' + Date.now(),
          name: data.name.trim(),
          documentType: data.documentType,
          document: data.document.trim(),
          phone: data.phone.trim(),
          email: data.email.trim().toLowerCase(),
          address: data.address.trim(),
          totalPurchases: 0,
          totalSpent: 0,
          status: 'ACTIVO',
        },
        ...prev,
      ];
    });

    addToast('success', 'Perfil actualizado', 'Tus datos de envío y facturación han sido guardados.');
    return true;
  };

  const logout = () => {
    if (currentUser) {
      logAudit('Seguridad', 'Cierre de sesión', currentUser.username, 'Cierre voluntario de sesión');
    }
    setCurrentUser(null);
    addToast('info', 'Sesión cerrada', 'Has salido de tu cuenta de forma segura.');
  };

  const switchRole = (newRole: Role) => {
    if (newRole === 'CLIENTE') {
      addToast('warning', 'Acceso de Cliente', 'El perfil Cliente solo opera en la Tienda Online.');
      return;
    }
    const match = users.find((u) => u.role === newRole && u.status === 'ACTIVO') || {
      id: 'usr-temp-' + newRole,
      name: `Usuario ${newRole}`,
      username: newRole.toLowerCase(),
      email: `${newRole.toLowerCase()}@novastyle.com`,
      role: newRole,
      status: 'ACTIVO' as const,
      lastLogin: new Date().toISOString().replace('T', ' ').slice(0, 16),
      avatar: BRAND_MEDIA.avatarExecutivePortrait,
    };
    setCurrentUser(match);
    addToast('info', 'Rol actualizado', `Has cambiado al perfil: ${newRole}`);
    logAudit('Usuarios', 'Cambio rápido de perfil', newRole, `Sesión simulada para el rol ${newRole}`);

    // Recompute authorization against newRole explicitly
    const allowedByNewRole: Record<Role, ActiveView[]> = {
      ADMINISTRADOR: [],
      VENDEDOR: ['dashboard', 'pos', 'products', 'categories', 'clients', 'promotions'],
      CAJERO: ['dashboard', 'cash-register', 'pos'],
      ALMACENERO: ['dashboard', 'inventory', 'purchases'],
      COMPRADOR: ['dashboard', 'purchases', 'suppliers', 'products', 'categories'],
      SUPERVISOR: ['dashboard', 'returns', 'audit', 'pos', 'promotions', 'inventory', 'online-orders'],
      GERENCIA: ['dashboard', 'reports', 'inventory', 'purchases'],
      CLIENTE: [],
    };
    if (newRole !== 'ADMINISTRADOR' && !allowedByNewRole[newRole].includes(activeView)) {
      if (newRole === 'CAJERO') setActiveView('cash-register');
      else if (newRole === 'ALMACENERO') setActiveView('inventory');
      else if (newRole === 'COMPRADOR') setActiveView('purchases');
      else setActiveView('dashboard');
    }
  };

  // Storefront Cart Operations
  const addToCart = (item: Omit<CartItem, 'quantity'>, quantity = 1): boolean => {
    const prod = products.find((p) => p.id === item.productId && p.status === 'ACTIVO');
    const variant = prod?.variants.find((v) => v.id === item.variantId);
    if (!prod || !variant || variant.stock <= 0) {
      addToast('error', 'Sin stock disponible', 'La talla seleccionada se encuentra agotada.');
      return false;
    }

    const existing = cart.find((c) => c.variantId === item.variantId);
    const currentQty = existing ? existing.quantity : 0;
    const requestedTotal = currentQty + quantity;

    if (requestedTotal > variant.stock) {
      addToast(
        'warning',
        'Stock máximo alcanzado',
        `Solo quedan ${variant.stock} unidades disponibles de ${item.productName} (${item.variantDesc}).`
      );
      return false;
    }

    setCart((prev) => {
      if (existing) {
        return prev.map((c) =>
          c.variantId === item.variantId ? { ...c, quantity: requestedTotal } : c
        );
      }
      return [...prev, { ...item, quantity }];
    });

    addToast('success', 'Agregado a la bolsa', `${item.productName} (${item.variantDesc}) x${quantity}`);
    return true;
  };

  const updateCartQuantity = (variantId: string, quantity: number) => {
    if (quantity <= 0) {
      setCart((prev) => prev.filter((c) => c.variantId !== variantId));
      return;
    }
    const variant = products.flatMap((p) => p.variants).find((v) => v.id === variantId);
    const maxStock = variant ? variant.stock : quantity;
    const capped = Math.min(quantity, maxStock);
    if (quantity > maxStock) {
      addToast('warning', 'Límite de stock', `Disponibilidad máxima actual: ${maxStock} unidades.`);
    }
    setCart((prev) =>
      prev.map((c) => (c.variantId === variantId ? { ...c, quantity: capped } : c))
    );
  };

  const removeFromCart = (variantId: string) => {
    setCart((prev) => prev.filter((c) => c.variantId !== variantId));
  };

  const clearCart = () => {
    setCart([]);
    setAppliedPromoCode('');
  };

  // Storefront Checkout -> creates live OnlineOrder + Sale + InventoryMovement + Client stats
  const placeOnlineOrder = (checkoutData: {
    clientName: string;
    clientEmail: string;
    clientPhone: string;
    deliveryAddress: string;
    clientDocType?: 'DNI' | 'RUC' | 'CE';
    clientDoc?: string;
    paymentMethod: string;
    promoCode?: string;
    notes?: string;
  }): { success: boolean; order?: OnlineOrder; error?: string } => {
    if (cart.length === 0) {
      return { success: false, error: 'Tu bolsa de compras está vacía.' };
    }

    // 1. Validate stock
    for (const item of cart) {
      const prod = products.find((p) => p.id === item.productId && p.status === 'ACTIVO');
      const variant = prod?.variants.find((v) => v.id === item.variantId);
      if (!prod || !variant) {
        return { success: false, error: `El producto ${item.productName} ya no está disponible.` };
      }
      if (item.quantity > variant.stock) {
        return {
          success: false,
          error: `Stock insuficiente para ${item.productName} (${item.variantDesc}). Disponible: ${variant.stock}.`,
        };
      }
    }

    const grossSubtotal = cart.reduce((acc, it) => acc + it.unitPrice * it.quantity, 0);
    let totalDiscount = 0;
    const usedPromoCode = (checkoutData.promoCode || appliedPromoCode || '').trim().toUpperCase();

    if (usedPromoCode) {
      const promo = promotions.find((p) => p.code.toUpperCase() === usedPromoCode);
      const todayStr = new Date().toISOString().split('T')[0];
      if (!promo || promo.status !== 'ACTIVA' || promo.endDate < todayStr || promo.startDate > todayStr) {
        addToast('error', 'Cupón inválido o vencido', `El código ${usedPromoCode} no se encuentra vigente.`);
        return { success: false, error: `El código promocional ${usedPromoCode} no está vigente.` };
      }
      if (promo.minPurchaseAmount && grossSubtotal < promo.minPurchaseAmount) {
        addToast(
          'warning',
          'Mínimo no alcanzado',
          `El cupón ${promo.code} requiere compras desde ${storeSettings.currency} ${promo.minPurchaseAmount.toFixed(2)}.`
        );
        return {
          success: false,
          error: `Compra mínima de ${storeSettings.currency} ${promo.minPurchaseAmount.toFixed(2)} requerida.`,
        };
      }
      if (promo.type === 'PORCENTAJE') {
        totalDiscount = Number(((grossSubtotal * promo.value) / 100).toFixed(2));
      } else if (promo.type === 'MONTO_FIJO') {
        totalDiscount = Number(Math.min(promo.value, grossSubtotal).toFixed(2));
      }
    }

    const netSubtotal = Number(Math.max(0, grossSubtotal - totalDiscount).toFixed(2));
    const shippingFee = netSubtotal >= 299 ? 0 : 15.0;
    const total = Number((netSubtotal + shippingFee).toFixed(2));

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().split(' ')[0].slice(0, 5);

    const orderNum = `PED-2026-${(onlineOrders.length + 101).toString().padStart(3, '0')}`;
    const saleNum = `${storeSettings.ticketPrefix}-${(sales.length + 420).toString().padStart(6, '0')}`;

    // Resolve or create client record
    const emailLower = checkoutData.clientEmail.trim().toLowerCase();
    const existingClient = clients.find((c) => c.email.toLowerCase() === emailLower);
    const resolvedClientId = existingClient ? existingClient.id : 'cli-' + Date.now();

    if (existingClient) {
      setClients((prev) =>
        prev.map((c) =>
          c.id === existingClient.id
            ? {
                ...c,
                totalPurchases: (c.totalPurchases || 0) + 1,
                totalSpent: Number(((c.totalSpent || 0) + total).toFixed(2)),
                lastPurchaseDate: dateStr,
                address: checkoutData.deliveryAddress || c.address,
                phone: checkoutData.clientPhone || c.phone,
              }
            : c
        )
      );
    } else {
      const createdClient: Client = {
        id: resolvedClientId,
        name: checkoutData.clientName.trim(),
        documentType: checkoutData.clientDocType || 'DNI',
        document: checkoutData.clientDoc?.trim() || '00000000',
        phone: checkoutData.clientPhone.trim(),
        email: emailLower,
        address: checkoutData.deliveryAddress.trim(),
        totalPurchases: 1,
        totalSpent: total,
        lastPurchaseDate: dateStr,
        status: 'ACTIVO',
      };
      setClients((prev) => [createdClient, ...prev]);
    }

    // Deduct stock and generate Kardex movements
    const newMovements: InventoryMovement[] = [];
    const updatedProducts = products.map((prod) => {
      let modified = false;
      const updatedVariants = prod.variants.map((v) => {
        const cartLine = cart.find((c) => c.variantId === v.id);
        if (cartLine) {
          const prevStock = v.stock;
          const nextStock = prevStock - cartLine.quantity;
          modified = true;

          newMovements.push({
            id: 'mov-' + Date.now() + Math.random().toString().slice(2, 5),
            date: dateStr,
            time: timeStr,
            type: 'VENTA',
            productId: prod.id,
            productName: prod.name,
            variantId: v.id,
            variantDesc: `${v.size} / ${v.color}`,
            sku: v.sku,
            quantity: -cartLine.quantity,
            previousStock: prevStock,
            newStock: nextStock,
            userId: currentUser?.id || resolvedClientId,
            userName: checkoutData.clientName,
            reference: `Pedido ${orderNum}`,
            reason: 'Compra en Tienda Online NOVAStyle',
          });

          return { ...v, stock: nextStock };
        }
        return v;
      });
      return modified ? { ...prod, variants: updatedVariants } : prod;
    });

    setProducts(updatedProducts);
    setInventoryMovements((prev) => [...newMovements, ...prev]);

    const orderItems: SaleItem[] = cart.map((c) => ({
      variantId: c.variantId,
      productId: c.productId,
      productName: c.productName,
      variantDesc: c.variantDesc,
      sku: c.sku,
      quantity: c.quantity,
      unitPrice: c.unitPrice,
      subtotal: Number((c.unitPrice * c.quantity).toFixed(2)),
      discount: 0,
    }));

    const newOrder: OnlineOrder = {
      id: 'ord-' + Date.now(),
      orderNumber: orderNum,
      clientId: resolvedClientId,
      clientName: checkoutData.clientName.trim(),
      clientEmail: emailLower,
      clientPhone: checkoutData.clientPhone.trim(),
      deliveryAddress: checkoutData.deliveryAddress.trim(),
      date: `${dateStr} ${timeStr}`,
      items: orderItems,
      subtotal: netSubtotal,
      shippingFee,
      total,
      paymentMethod: checkoutData.paymentMethod,
      status: 'PENDIENTE',
      notes: checkoutData.notes?.trim() || undefined,
    };

    setOnlineOrders((prev) => [newOrder, ...prev]);

    // Also record online Sale so Admin Dashboard & Reports reflect real-time omnichannel totals
    const tax = Number((total - total / (1 + storeSettings.taxRate)).toFixed(2));
    const saleSubtotal = Number((total - tax).toFixed(2));
    const paymentEnum: PaymentMethod = checkoutData.paymentMethod.toLowerCase().includes('yape') ||
      checkoutData.paymentMethod.toLowerCase().includes('plin')
      ? 'YAPE_PLIN'
      : 'TARJETA';

    const newSale: Sale = {
      id: 'sal-' + Date.now(),
      saleNumber: saleNum,
      date: dateStr,
      time: timeStr,
      channel: 'ONLINE',
      clientId: resolvedClientId,
      clientName: checkoutData.clientName.trim(),
      clientDoc: checkoutData.clientDoc?.trim() || '00000000',
      clientDocType: checkoutData.clientDocType || 'DNI',
      items: orderItems,
      subtotal: saleSubtotal,
      discount: totalDiscount,
      tax,
      total,
      paymentMethod: paymentEnum,
      paymentStatus: 'APROBADO',
      sellerId: 'online-store',
      sellerName: 'Tienda Online NOVAStyle',
      promotionCode: usedPromoCode || undefined,
      status: 'COMPLETADA',
      receiptType: checkoutData.clientDocType === 'RUC' ? 'FACTURA' : 'BOLETA',
    };

    setSales((prev) => [newSale, ...prev]);
    logAudit(
      'Tienda Online',
      'Nuevo pedido confirmado',
      orderNum,
      `Pedido de ${checkoutData.clientName} por ${storeSettings.currency} ${total.toFixed(2)} (${checkoutData.paymentMethod})`
    );

    setCart([]);
    setAppliedPromoCode('');
    addToast('success', 'Pedido Confirmado', `Tu pedido ${orderNum} fue registrado con éxito.`);

    return { success: true, order: newOrder };
  };

  // CU-01 Registrar/Editar Producto y Variantes
  const saveProduct = (
    productData: Omit<Product, 'id' | 'createdAt'> & { id?: string }
  ): { success: boolean; error?: string } => {
    if (!requireStaffAccess('Gestión de Productos')) {
      return { success: false, error: 'Acceso denegado' };
    }

    const allExistingVariants = products
      .filter((p) => p.id !== productData.id)
      .flatMap((p) => p.variants);

    const incomingSkus = productData.variants.map((v) => v.sku.trim().toUpperCase());
    const duplicateInside = incomingSkus.some((sku, idx) => incomingSkus.indexOf(sku) !== idx);
    if (duplicateInside) {
      addToast('error', 'SKU Duplicado', 'El producto contiene variantes con el mismo código SKU.');
      return { success: false, error: 'Variantes con SKU duplicado dentro del producto' };
    }

    const collision = productData.variants.find((v) =>
      allExistingVariants.some((ev) => ev.sku.trim().toUpperCase() === v.sku.trim().toUpperCase())
    );
    if (collision) {
      addToast('error', 'SKU ya registrado', `El SKU "${collision.sku}" ya pertenece a otro producto.`);
      return { success: false, error: `SKU ${collision.sku} ya existe en el catálogo.` };
    }

    if (productData.id) {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === productData.id
            ? {
                ...p,
                ...productData,
                variants: productData.variants.map((v) => ({
                  ...v,
                  id: v.id || 'var-' + Date.now() + Math.random().toString().slice(2, 5),
                })),
              }
            : p
        )
      );
      logAudit('Productos', 'Modificación de producto', productData.code, `Actualizado: ${productData.name}`);
      addToast('success', 'Producto actualizado', `Se guardaron los cambios de ${productData.name}`);
    } else {
      const newId = 'prod-' + (products.length + 1).toString().padStart(2, '0') + '-' + Date.now().toString().slice(-4);
      const newProduct: Product = {
        ...productData,
        id: newId,
        createdAt: new Date().toISOString().split('T')[0],
        variants: productData.variants.map((v, i) => ({
          ...v,
          id: `var-${newId}-${i + 1}`,
        })),
      };
      setProducts((prev) => [newProduct, ...prev]);
      logAudit('Productos', 'Creación de producto y variantes', productData.code, `Registrado: ${productData.name} con ${productData.variants.length} variantes`);
      addToast('success', 'Producto registrado', `${productData.name} fue añadido exitosamente con sus variantes.`);
    }

    return { success: true };
  };

  const deleteProduct = (id: string) => {
    if (!requireStaffAccess('Eliminar Producto')) return;
    const prod = products.find((p) => p.id === id);
    if (!prod) return;
    setProducts((prev) => prev.filter((p) => p.id !== id));
    logAudit('Productos', 'Eliminación de producto', prod.code, `Eliminado ${prod.name}`);
    addToast('info', 'Producto eliminado', `Se eliminó el producto ${prod.name}`);
  };

  // Categories CRUD (Admin / Productos)
  const saveCategory = (
    catData: Omit<CategoryItem, 'id' | 'slug'> & { id?: string; slug?: string }
  ): { success: boolean; error?: string } => {
    if (!requireStaffAccess('Gestión de Categorías')) {
      return { success: false, error: 'Acceso denegado' };
    }
    const nameTrimmed = catData.name.trim();
    if (!nameTrimmed) {
      return { success: false, error: 'El nombre de la categoría es obligatorio.' };
    }
    const duplicate = categories.some(
      (c) => c.id !== catData.id && c.name.toLowerCase() === nameTrimmed.toLowerCase()
    );
    if (duplicate) {
      addToast('error', 'Categoría duplicada', `Ya existe una categoría llamada "${nameTrimmed}".`);
      return { success: false, error: 'Nombre de categoría duplicado' };
    }

    const computedSlug = catData.slug?.trim() || slugify(nameTrimmed);
    const safeImage = resolveSafeMediaUrl(catData.image, nameTrimmed) || PRODUCT_MEDIA_BY_CATEGORY['Ropa Hombre'];

    if (catData.id) {
      setCategories((prev) =>
        prev.map((c) =>
          c.id === catData.id
            ? { ...c, name: nameTrimmed, slug: computedSlug, description: catData.description, image: safeImage, status: catData.status }
            : c
        )
      );
      logAudit('Categorías', 'Modificación de categoría', computedSlug, `Actualizada: ${nameTrimmed}`);
      addToast('success', 'Categoría actualizada', `Cambios guardados para ${nameTrimmed}`);
    } else {
      const newCat: CategoryItem = {
        id: 'cat-' + Date.now(),
        name: nameTrimmed,
        slug: computedSlug,
        description: catData.description,
        image: safeImage,
        status: catData.status,
      };
      setCategories((prev) => [...prev, newCat]);
      logAudit('Categorías', 'Nueva categoría', computedSlug, `Creada: ${nameTrimmed}`);
      addToast('success', 'Categoría creada', `${nameTrimmed} ya está disponible en el catálogo.`);
    }

    return { success: true };
  };

  const toggleCategoryStatus = (id: string) => {
    if (!requireStaffAccess('Estado de Categoría')) return;
    setCategories((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const next = c.status === 'ACTIVA' ? 'INACTIVA' : 'ACTIVA';
          logAudit('Categorías', 'Cambio estado categoría', c.slug, `${c.name} -> ${next}`);
          addToast('info', 'Estado actualizado', `Categoría ${c.name} ahora está ${next}`);
          return { ...c, status: next };
        }
        return c;
      })
    );
  };

  // CU-02 Registrar Recepción de Mercadería
  const receivePurchaseOrder = (
    poId: string,
    receivedNotes?: string
  ): { success: boolean; error?: string } => {
    if (!requireStaffAccess('Recepción de Mercadería')) {
      return { success: false, error: 'Acceso denegado' };
    }
    const po = purchaseOrders.find((p) => p.id === poId);
    if (!po) {
      return { success: false, error: 'Orden de compra no encontrada' };
    }
    if (po.status === 'RECIBIDA') {
      return { success: false, error: 'Esta orden ya fue recibida anteriormente' };
    }
    if (po.status === 'CANCELADA') {
      return { success: false, error: 'No se puede recibir una orden cancelada' };
    }

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().split(' ')[0].slice(0, 5);

    const newMovements: InventoryMovement[] = [];
    const updatedProducts = products.map((prod) => {
      let modified = false;
      const updatedVariants = prod.variants.map((v) => {
        const item = po.items.find((poi) => poi.variantId === v.id || poi.sku === v.sku);
        if (item) {
          const qtyToReceive = item.requestedQty;
          const prevStock = v.stock;
          const newStock = prevStock + qtyToReceive;
          modified = true;

          newMovements.push({
            id: 'mov-' + Date.now() + Math.random().toString().slice(2, 5),
            date: dateStr,
            time: timeStr,
            type: 'RECEPCION',
            productId: prod.id,
            productName: prod.name,
            variantId: v.id,
            variantDesc: `${v.size} / ${v.color}`,
            sku: v.sku,
            quantity: qtyToReceive,
            previousStock: prevStock,
            newStock: newStock,
            userId: currentUser?.id || 'usr-4',
            userName: currentUser?.name || 'Almacenero',
            reference: po.orderNumber,
            reason: receivedNotes || `Recepción completa de proveedor: ${po.supplierName}`,
          });

          return { ...v, stock: newStock };
        }
        return v;
      });

      return modified ? { ...prod, variants: updatedVariants } : prod;
    });

    setProducts(updatedProducts);
    setInventoryMovements((prev) => [...newMovements, ...prev]);

    setPurchaseOrders((prev) =>
      prev.map((p) =>
        p.id === poId
          ? {
              ...p,
              status: 'RECIBIDA' as const,
              receivedAt: `${dateStr} ${timeStr}`,
              receivedBy: currentUser?.name || 'Almacenero',
              items: p.items.map((i) => ({ ...i, receivedQty: i.requestedQty })),
              notes: receivedNotes ? `${p.notes ? p.notes + ' | ' : ''}${receivedNotes}` : p.notes,
            }
          : p
      )
    );

    logAudit(
      'Compras / Inventario',
      'CU-02 Registrar Recepción',
      po.orderNumber,
      `Recepción de mercadería de ${po.supplierName}. Stock incrementado para ${po.items.length} variantes.`
    );

    addToast(
      'success',
      'Mercadería Recibida',
      `Orden ${po.orderNumber} procesada con éxito. El inventario ha sido actualizado en tiempo real.`
    );

    return { success: true };
  };

  const createPurchaseOrder = (poData: Omit<PurchaseOrder, 'id' | 'orderNumber' | 'status'>) => {
    if (!requireStaffAccess('Generar Orden de Compra')) return;
    const nextNum = (purchaseOrders.length + 1).toString().padStart(3, '0');
    const newPO: PurchaseOrder = {
      ...poData,
      id: 'po-' + Date.now(),
      orderNumber: `OC-2026-${nextNum}`,
      status: 'EMITIDA',
    };

    setPurchaseOrders((prev) => [newPO, ...prev]);
    logAudit('Compras', 'CU-10 Generar Orden de Compra', newPO.orderNumber, `Emitida a ${newPO.supplierName} por S/ ${newPO.total.toFixed(2)}`);
    addToast('success', 'Orden de compra emitida', `Se generó la orden ${newPO.orderNumber} exitosamente.`);
  };

  // CU-03 Registrar Venta (POS Presencial)
  const processSale = (saleData: {
    channel: 'PRESENCIAL' | 'ONLINE';
    clientId: string;
    items: SaleItem[];
    promotionCode?: string;
    paymentMethod: PaymentMethod;
    paymentStatus: 'APROBADO' | 'RECHAZADO';
    cashReceived?: number;
    receiptType: 'BOLETA' | 'FACTURA' | 'TICKET';
  }): { success: boolean; sale?: Sale; error?: string } => {
    if (!requireStaffAccess('Registrar Venta POS')) {
      return { success: false, error: 'Acceso denegado' };
    }

    if (saleData.channel === 'PRESENCIAL' && (!cashRegister.isOpen || cashRegister.status !== 'ABIERTA')) {
      addToast('error', 'Caja Cerrada', 'No se pueden registrar ventas presenciales mientras la caja se encuentre cerrada.');
      return { success: false, error: 'La caja está cerrada. Debe abrir la caja antes de vender.' };
    }

    if (saleData.paymentStatus === 'RECHAZADO') {
      logAudit('Ventas / Pagos', 'Pago rechazado por pasarela', 'Intento de venta cancelado', `Método: ${saleData.paymentMethod}`);
      addToast('error', 'Pago Rechazado', 'La transacción fue denegada por la entidad de pago. No se concretó la venta.');
      return { success: false, error: 'El pago fue rechazado. No se completó la venta.' };
    }

    for (const item of saleData.items) {
      let foundStock = 0;
      let variantFound = false;
      for (const prod of products) {
        const v = prod.variants.find((variant) => variant.id === item.variantId || variant.sku === item.sku);
        if (v) {
          variantFound = true;
          foundStock = v.stock;
          break;
        }
      }

      if (!variantFound) {
        addToast('error', 'Producto no encontrado', `La variante ${item.productName} (${item.variantDesc}) no existe en el catálogo.`);
        return { success: false, error: `Variante no encontrada: ${item.sku}` };
      }

      if (item.quantity > foundStock) {
        addToast('error', 'Stock Insuficiente', `Stock disponible de "${item.productName} - ${item.variantDesc}" es ${foundStock} unid., solicitadas: ${item.quantity}.`);
        return { success: false, error: `Stock insuficiente para ${item.sku}. Stock actual: ${foundStock}` };
      }
    }

    const client = clients.find((c) => c.id === saleData.clientId) || {
      id: 'cli-generic',
      name: 'Cliente Mostrador / Venta Rápida',
      document: '00000000',
      documentType: 'DNI' as const,
    };

    const grossTotal = saleData.items.reduce((acc, it) => acc + it.unitPrice * it.quantity, 0);
    let totalDiscount = 0;

    if (saleData.promotionCode) {
      const promo = promotions.find((p) => p.code.toUpperCase() === saleData.promotionCode?.toUpperCase());
      const nowStr = new Date().toISOString().split('T')[0];

      if (!promo) {
        addToast('warning', 'Promoción Inválida', 'El código de promoción ingresado no existe.');
      } else if (promo.status !== 'ACTIVA' || promo.endDate < nowStr || promo.startDate > nowStr) {
        addToast('error', 'Promoción Vencida', `La promoción ${promo.name} ya no se encuentra vigente.`);
        return { success: false, error: 'La promoción ha expirado o está inactiva.' };
      } else if (promo.minPurchaseAmount && grossTotal < promo.minPurchaseAmount) {
        addToast('warning', 'Mínimo no alcanzado', `Esta promoción requiere una compra mínima de S/ ${promo.minPurchaseAmount.toFixed(2)}.`);
      } else {
        if (promo.type === 'PORCENTAJE') {
          totalDiscount = (grossTotal * promo.value) / 100;
        } else if (promo.type === 'MONTO_FIJO') {
          totalDiscount = Math.min(promo.value, grossTotal);
        }
        logAudit('Promociones', 'CU-04 Aplicar Promoción', promo.code, `Descuento otorgado: S/ ${totalDiscount.toFixed(2)}`);
      }
    }

    const netTotal = Math.max(0, grossTotal - totalDiscount);
    const tax = Number((netTotal - netTotal / (1 + storeSettings.taxRate)).toFixed(2));
    const subtotal = Number((netTotal - tax).toFixed(2));

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().split(' ')[0].slice(0, 5);

    const saleNumberPrefix = saleData.receiptType === 'FACTURA' ? storeSettings.invoicePrefix : storeSettings.ticketPrefix;
    const saleNum = `${saleNumberPrefix}-${(sales.length + 420).toString().padStart(6, '0')}`;

    const newMovements: InventoryMovement[] = [];
    const updatedProducts = products.map((prod) => {
      let modified = false;
      const updatedVariants = prod.variants.map((v) => {
        const item = saleData.items.find((si) => si.variantId === v.id || si.sku === v.sku);
        if (item) {
          const prev = v.stock;
          const next = prev - item.quantity;
          modified = true;

          newMovements.push({
            id: 'mov-' + Date.now() + Math.random().toString().slice(2, 5),
            date: dateStr,
            time: timeStr,
            type: 'VENTA',
            productId: prod.id,
            productName: prod.name,
            variantId: v.id,
            variantDesc: `${v.size} / ${v.color}`,
            sku: v.sku,
            quantity: -item.quantity,
            previousStock: prev,
            newStock: next,
            userId: currentUser?.id || 'usr-2',
            userName: currentUser?.name || 'Vendedor',
            reference: `Venta ${saleNum}`,
            reason: `Venta canal ${saleData.channel}`,
          });

          return { ...v, stock: next };
        }
        return v;
      });

      return modified ? { ...prod, variants: updatedVariants } : prod;
    });

    setProducts(updatedProducts);
    setInventoryMovements((prev) => [...newMovements, ...prev]);

    const cashReceived = saleData.paymentMethod === 'EFECTIVO' ? saleData.cashReceived || netTotal : undefined;
    const change = cashReceived !== undefined ? Math.max(0, cashReceived - netTotal) : undefined;

    const newSale: Sale = {
      id: 'sal-' + Date.now(),
      saleNumber: saleNum,
      date: dateStr,
      time: timeStr,
      channel: saleData.channel,
      clientId: client.id,
      clientName: client.name,
      clientDoc: client.document,
      clientDocType: client.documentType || 'DNI',
      items: saleData.items,
      subtotal,
      discount: totalDiscount,
      tax,
      total: netTotal,
      paymentMethod: saleData.paymentMethod,
      paymentStatus: 'APROBADO',
      cashReceived,
      change,
      sellerId: currentUser?.id || 'usr-2',
      sellerName: currentUser?.name || 'Vendedor',
      promotionCode: saleData.promotionCode,
      status: 'COMPLETADA',
      receiptType: saleData.receiptType,
    };

    setSales((prev) => [newSale, ...prev]);

    setClients((prev) =>
      prev.map((c) =>
        c.id === client.id
          ? {
              ...c,
              totalPurchases: (c.totalPurchases || 0) + 1,
              totalSpent: (c.totalSpent || 0) + netTotal,
              lastPurchaseDate: dateStr,
            }
          : c
      )
    );

    if (saleData.channel === 'PRESENCIAL') {
      setCashRegister((prev) => {
        const isCash = saleData.paymentMethod === 'EFECTIVO';
        const newCashSales = isCash ? prev.cashSales + netTotal : prev.cashSales;
        const newElecSales = !isCash ? prev.electronicSales + netTotal : prev.electronicSales;
        const newTotalCollected = prev.totalCollected + netTotal;
        const newExpectedCash = prev.initialCash + newCashSales;

        return {
          ...prev,
          cashSales: Number(newCashSales.toFixed(2)),
          electronicSales: Number(newElecSales.toFixed(2)),
          totalCollected: Number(newTotalCollected.toFixed(2)),
          totalOperations: prev.totalOperations + 1,
          expectedCash: Number(newExpectedCash.toFixed(2)),
        };
      });
    }

    logAudit(
      'Ventas',
      'CU-03 Registrar Venta',
      saleNum,
      `Venta completada por S/ ${netTotal.toFixed(2)} (${saleData.paymentMethod}) a ${client.name}. Comprobante emitido.`
    );

    addToast('success', 'Venta Exitosa', `Comprobante ${saleNum} generado correctamente.`);

    return { success: true, sale: newSale };
  };

  // CU-06 Devoluciones y Cambios
  const processReturn = (returnData: {
    saleId: string;
    variantId: string;
    quantity: number;
    reason: string;
    resolution: 'CAMBIO' | 'DEVOLUCION_EFECTIVO' | 'NOTA_CREDITO';
  }): { success: boolean; requiresApproval?: boolean; error?: string } => {
    if (!requireStaffAccess('Registrar Devolución')) {
      return { success: false, error: 'Acceso denegado' };
    }

    const sale = sales.find((s) => s.id === returnData.saleId || s.saleNumber === returnData.saleId);
    if (!sale) {
      addToast('error', 'Venta no encontrada', 'La venta indicada no existe en el registro del sistema.');
      return { success: false, error: 'Venta no encontrada' };
    }

    const item = sale.items.find((it) => it.variantId === returnData.variantId || it.sku === returnData.variantId);
    if (!item) {
      addToast('error', 'Ítem no encontrado', 'El producto no fue parte de este comprobante de venta.');
      return { success: false, error: 'Producto no encontrado en la venta' };
    }

    if (returnData.quantity > item.quantity) {
      addToast('error', 'Cantidad no válida', `No puede devolver más unidades de las compradas (${item.quantity}).`);
      return { success: false, error: 'Cantidad de devolución excede la compra original' };
    }

    const refundAmount = Number((item.unitPrice * returnData.quantity).toFixed(2));
    const needsApproval = refundAmount > 200 && currentUser?.role !== 'SUPERVISOR' && currentUser?.role !== 'ADMINISTRADOR';

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().split(' ')[0].slice(0, 5);

    const returnNumber = `DEV-2026-${(returns.length + 2).toString().padStart(3, '0')}`;

    const newRecord: ReturnRecord = {
      id: 'ret-' + Date.now(),
      returnNumber,
      saleId: sale.id,
      saleNumber: sale.saleNumber,
      date: dateStr,
      clientId: sale.clientId,
      clientName: sale.clientName,
      productId: item.productId,
      productName: item.productName,
      variantId: item.variantId,
      variantDesc: item.variantDesc,
      sku: item.sku,
      quantity: returnData.quantity,
      refundAmount,
      reason: returnData.reason,
      resolution: returnData.resolution,
      requiresApproval: needsApproval,
      isApproved: !needsApproval,
      approvedBy: !needsApproval ? currentUser?.name : undefined,
      approvedAt: !needsApproval ? `${dateStr} ${timeStr}` : undefined,
      processedBy: currentUser?.name || 'Vendedor',
      status: needsApproval ? 'PENDIENTE_SUPERVISOR' : 'APROBADA',
    };

    setReturns((prev) => [newRecord, ...prev]);

    if (!needsApproval) {
      const updatedProducts = products.map((p) => {
        if (p.id === item.productId) {
          return {
            ...p,
            variants: p.variants.map((v) => {
              if (v.id === item.variantId || v.sku === item.sku) {
                const prev = v.stock;
                const next = prev + returnData.quantity;

                setInventoryMovements((movs) => [
                  {
                    id: 'mov-' + Date.now() + Math.random().toString().slice(2, 5),
                    date: dateStr,
                    time: timeStr,
                    type: 'DEVOLUCION',
                    productId: p.id,
                    productName: p.name,
                    variantId: v.id,
                    variantDesc: `${v.size} / ${v.color}`,
                    sku: v.sku,
                    quantity: returnData.quantity,
                    previousStock: prev,
                    newStock: next,
                    userId: currentUser?.id || 'usr-6',
                    userName: currentUser?.name || 'Supervisor',
                    reference: returnNumber,
                    reason: `Devolución venta ${sale.saleNumber}: ${returnData.reason}`,
                  },
                  ...movs,
                ]);

                return { ...v, stock: next };
              }
              return v;
            }),
          };
        }
        return p;
      });

      setProducts(updatedProducts);

      if (returnData.resolution === 'DEVOLUCION_EFECTIVO' && cashRegister.isOpen) {
        setCashRegister((prev) => ({
          ...prev,
          cashSales: Number(Math.max(0, prev.cashSales - refundAmount).toFixed(2)),
          totalCollected: Number(Math.max(0, prev.totalCollected - refundAmount).toFixed(2)),
          expectedCash: Number(Math.max(0, prev.expectedCash - refundAmount).toFixed(2)),
        }));
      }

      logAudit(
        'Devoluciones',
        'CU-06 Registrar Devolución',
        returnNumber,
        `Devolución aprobada por S/ ${refundAmount.toFixed(2)} (${returnData.resolution}) para venta ${sale.saleNumber}`
      );

      addToast('success', 'Devolución Registrada', `Devolución ${returnNumber} procesada y stock reintegrado.`);
      return { success: true, requiresApproval: false };
    } else {
      logAudit(
        'Devoluciones',
        'Solicitud de Devolución',
        returnNumber,
        `Monto S/ ${refundAmount.toFixed(2)} requiere aprobación del Supervisor.`
      );
      addToast(
        'warning',
        'Pendiente de Autorización',
        `La devolución ${returnNumber} excede S/ 200 y requiere autorización del Supervisor.`
      );
      return { success: true, requiresApproval: true };
    }
  };

  const approveReturn = (returnId: string): { success: boolean; error?: string } => {
    if (!requireStaffAccess('Aprobar Devolución')) {
      return { success: false, error: 'Acceso denegado' };
    }
    const ret = returns.find((r) => r.id === returnId);
    if (!ret) return { success: false, error: 'Registro de devolución no encontrado' };
    if (ret.isApproved) return { success: false, error: 'Esta devolución ya fue aprobada' };

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().split(' ')[0].slice(0, 5);

    const updatedProducts = products.map((p) => {
      if (p.id === ret.productId) {
        return {
          ...p,
          variants: p.variants.map((v) => {
            if (v.id === ret.variantId || v.sku === ret.sku) {
              const prev = v.stock;
              const next = prev + ret.quantity;

              setInventoryMovements((movs) => [
                {
                  id: 'mov-' + Date.now() + Math.random().toString().slice(2, 5),
                  date: dateStr,
                  time: timeStr,
                  type: 'DEVOLUCION',
                  productId: p.id,
                  productName: p.name,
                  variantId: v.id,
                  variantDesc: `${v.size} / ${v.color}`,
                  sku: v.sku,
                  quantity: ret.quantity,
                  previousStock: prev,
                  newStock: next,
                  userId: currentUser?.id || 'usr-6',
                  userName: currentUser?.name || 'Supervisor',
                  reference: ret.returnNumber,
                  reason: `Aprobación supervisor devolución ${ret.saleNumber}`,
                },
                ...movs,
              ]);

              return { ...v, stock: next };
            }
            return v;
          }),
        };
      }
      return p;
    });

    setProducts(updatedProducts);

    setReturns((prev) =>
      prev.map((r) =>
        r.id === returnId
          ? {
              ...r,
              isApproved: true,
              approvedBy: currentUser?.name || 'Supervisor',
              approvedAt: `${dateStr} ${timeStr}`,
              status: 'APROBADA' as const,
            }
          : r
      )
    );

    logAudit('Devoluciones', 'Aprobación de Devolución', ret.returnNumber, `Autorizada por ${currentUser?.name}`);
    addToast('success', 'Devolución Aprobada', `Se aprobó la devolución ${ret.returnNumber} y se reintegró el stock.`);

    return { success: true };
  };

  // CU-07 Abrir / Cerrar Caja
  const openCashRegister = (initialCash: number): { success: boolean; error?: string } => {
    if (!requireStaffAccess('Apertura de Caja')) {
      return { success: false, error: 'Acceso denegado' };
    }
    if (cashRegister.isOpen && cashRegister.status === 'ABIERTA') {
      addToast('warning', 'Caja ya abierta', 'La caja ya se encuentra en estado abierta.');
      return { success: false, error: 'La caja ya está abierta' };
    }

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().split(' ')[0].slice(0, 5);

    const newRegister: CashRegister = {
      isOpen: true,
      openedAt: `${dateStr} ${timeStr}`,
      openedByUserId: currentUser?.id || 'usr-3',
      openedByUserName: currentUser?.name || 'Cajero',
      initialCash: Number(initialCash.toFixed(2)),
      cashSales: 0,
      electronicSales: 0,
      totalCollected: 0,
      totalOperations: 0,
      expectedCash: Number(initialCash.toFixed(2)),
      status: 'ABIERTA',
    };

    setCashRegister(newRegister);
    logAudit('Caja', 'Apertura de caja diaria', `CAJA-${dateStr}`, `Apertura con saldo inicial en efectivo S/ ${initialCash.toFixed(2)} por ${currentUser?.name}`);
    addToast('success', 'Caja Abierta', `Se abrió la caja exitosamente con un saldo inicial de S/ ${initialCash.toFixed(2)}.`);

    return { success: true };
  };

  const closeCashRegister = (
    declaredCash: number
  ): { success: boolean; difference: number; error?: string } => {
    if (!requireStaffAccess('Cierre de Caja')) {
      return { success: false, difference: 0, error: 'Acceso denegado' };
    }
    if (!cashRegister.isOpen || cashRegister.status !== 'ABIERTA') {
      addToast('error', 'Caja ya cerrada', 'La caja no se encuentra abierta.');
      return { success: false, difference: 0, error: 'La caja no está abierta' };
    }

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().split(' ')[0].slice(0, 5);

    const difference = Number((declaredCash - cashRegister.expectedCash).toFixed(2));

    const updatedRegister: CashRegister = {
      ...cashRegister,
      isOpen: false,
      closedAt: `${dateStr} ${timeStr}`,
      declaredCash: Number(declaredCash.toFixed(2)),
      difference,
      status: 'CERRADA',
    };

    setCashRegister(updatedRegister);

    const diffMsg =
      difference === 0
        ? 'Cuadre perfecto (sin diferencia)'
        : difference > 0
        ? `Sobrante de S/ ${difference.toFixed(2)}`
        : `Faltante de S/ ${Math.abs(difference).toFixed(2)}`;

    logAudit(
      'Caja',
      'CU-07 Cerrar Caja',
      `CIERRE-${dateStr}`,
      `Cierre registrado por ${currentUser?.name}. Esperado: S/ ${cashRegister.expectedCash.toFixed(2)}, Declarado: S/ ${declaredCash.toFixed(2)}, Diferencia: ${diffMsg}`
    );

    addToast('info', 'Caja Cerrada', `Arqueo finalizado: ${diffMsg}`);

    return { success: true, difference };
  };

  // CU-09 Pedidos Online
  const updateOrderStatus = (orderId: string, newStatus: OnlineOrderStatus) => {
    if (!requireStaffAccess('Actualizar Pedido Online')) return;
    const order = onlineOrders.find((o) => o.id === orderId);
    if (!order) return;

    setOnlineOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );

    logAudit(
      'Pedidos Online',
      'CU-09 Cambio estado pedido',
      order.orderNumber,
      `Estado actualizado de ${order.status} a ${newStatus}`
    );

    addToast('info', 'Pedido Actualizado', `Pedido ${order.orderNumber} pasó a ${newStatus}`);
  };

  // Inventario manual
  const addManualInventoryMovement = (movement: {
    type: 'ENTRADA' | 'SALIDA' | 'AJUSTE' | 'TRANSFERENCIA';
    productId: string;
    variantId: string;
    quantity: number;
    reason: string;
  }): { success: boolean; error?: string } => {
    if (!requireStaffAccess('Movimiento de Inventario')) {
      return { success: false, error: 'Acceso denegado' };
    }
    const prod = products.find((p) => p.id === movement.productId);
    if (!prod) return { success: false, error: 'Producto no encontrado' };

    const variant = prod.variants.find((v) => v.id === movement.variantId);
    if (!variant) return { success: false, error: 'Variante no encontrada' };

    const qty = movement.quantity;
    if (qty <= 0) return { success: false, error: 'La cantidad debe ser mayor a 0' };

    if ((movement.type === 'SALIDA' || movement.type === 'TRANSFERENCIA') && variant.stock < qty) {
      addToast('error', 'Stock Insuficiente', `Stock actual: ${variant.stock}, intentó retirar: ${qty}`);
      return { success: false, error: 'Stock insuficiente' };
    }

    const isPositive = movement.type === 'ENTRADA';
    const delta = isPositive ? qty : -qty;
    const prevStock = variant.stock;
    const newStock = prevStock + delta;

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().split(' ')[0].slice(0, 5);

    const updatedProducts = products.map((p) =>
      p.id === prod.id
        ? {
            ...p,
            variants: p.variants.map((v) =>
              v.id === variant.id ? { ...v, stock: newStock } : v
            ),
          }
        : p
    );

    setProducts(updatedProducts);

    const ref = `${movement.type.slice(0, 3)}-${Date.now().toString().slice(-4)}`;
    setInventoryMovements((prev) => [
      {
        id: 'mov-' + Date.now(),
        date: dateStr,
        time: timeStr,
        type: movement.type,
        productId: prod.id,
        productName: prod.name,
        variantId: variant.id,
        variantDesc: `${variant.size} / ${variant.color}`,
        sku: variant.sku,
        quantity: delta,
        previousStock: prevStock,
        newStock: newStock,
        userId: currentUser?.id || 'usr-4',
        userName: currentUser?.name || 'Almacenero',
        reference: ref,
        reason: movement.reason,
      },
      ...prev,
    ]);

    logAudit('Inventario', `Movimiento manual: ${movement.type}`, ref, `${delta > 0 ? '+' : ''}${delta} unid. para ${prod.name} (${variant.sku}). Motivo: ${movement.reason}`);
    addToast('success', 'Inventario Actualizado', `Se registró movimiento de ${movement.type} (${delta > 0 ? '+' : ''}${delta} unid.).`);

    return { success: true };
  };

  // Promotion CRUD
  const savePromotion = (promoData: Omit<Promotion, 'id'> & { id?: string }) => {
    if (!requireStaffAccess('Gestión de Promociones')) return;
    if (promoData.id) {
      setPromotions((prev) =>
        prev.map((p) => (p.id === promoData.id ? { ...p, ...promoData } : p))
      );
      logAudit('Promociones', 'Modificación de promoción', promoData.code, promoData.name);
      addToast('success', 'Promoción Actualizada', `Se guardó la promoción ${promoData.name}`);
    } else {
      const newPromo: Promotion = {
        ...promoData,
        id: 'pro-' + Date.now(),
      };
      setPromotions((prev) => [newPromo, ...prev]);
      logAudit('Promociones', 'Nueva promoción creada', promoData.code, promoData.name);
      addToast('success', 'Promoción Creada', `Se creó la promoción ${promoData.name}`);
    }
  };

  const togglePromotionStatus = (id: string) => {
    if (!requireStaffAccess('Estado de Promoción')) return;
    setPromotions((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const next = p.status === 'ACTIVA' ? 'INACTIVA' : 'ACTIVA';
          logAudit('Promociones', 'Cambio estado promoción', p.code, `Estado cambiado a ${next}`);
          addToast('info', 'Estado Actualizado', `Promoción ${p.name} ahora está ${next}`);
          return { ...p, status: next };
        }
        return p;
      })
    );
  };

  // Supplier CRUD
  const saveSupplier = (supData: Omit<Supplier, 'id'> & { id?: string }) => {
    if (!requireStaffAccess('Gestión de Proveedores')) return;
    if (supData.id) {
      setSuppliers((prev) =>
        prev.map((s) => (s.id === supData.id ? { ...s, ...supData } : s))
      );
      logAudit('Proveedores', 'Modificación de proveedor', supData.ruc, supData.name);
      addToast('success', 'Proveedor Actualizado', `Datos guardados de ${supData.name}`);
    } else {
      const newSup: Supplier = {
        ...supData,
        id: 'sup-' + Date.now(),
      };
      setSuppliers((prev) => [newSup, ...prev]);
      logAudit('Proveedores', 'Nuevo proveedor registrado', supData.ruc, supData.name);
      addToast('success', 'Proveedor Registrado', `Se añadió a ${supData.name}`);
    }
  };

  // Client CRUD
  const saveClient = (
    clientData: Omit<Client, 'id' | 'totalPurchases' | 'totalSpent'> & { id?: string }
  ) => {
    if (!requireStaffAccess('Gestión de Clientes')) return;
    if (clientData.id) {
      setClients((prev) =>
        prev.map((c) => (c.id === clientData.id ? { ...c, ...clientData } : c))
      );
      logAudit('Clientes', 'Modificación de cliente', clientData.document, clientData.name);
      addToast('success', 'Cliente Actualizado', `Datos actualizados de ${clientData.name}`);
    } else {
      const newClient: Client = {
        ...clientData,
        id: 'cli-' + Date.now(),
        totalPurchases: 0,
        totalSpent: 0,
      };
      setClients((prev) => [newClient, ...prev]);
      logAudit('Clientes', 'Nuevo cliente registrado', clientData.document, clientData.name);
      addToast('success', 'Cliente Registrado', `Se registró al cliente ${clientData.name}`);
    }
  };

  // User CRUD
  const saveUser = (userData: Omit<User, 'id' | 'lastLogin'> & { id?: string }) => {
    if (!requireStaffAccess('Gestión de Usuarios')) return;
    if (userData.id) {
      setUsers((prev) =>
        prev.map((u) => (u.id === userData.id ? { ...u, ...userData } : u))
      );
      logAudit('Usuarios', 'Modificación de usuario', userData.username, `Rol: ${userData.role}`);
      addToast('success', 'Usuario Actualizado', `Datos de ${userData.name} guardados`);
    } else {
      const newUser: User = {
        ...userData,
        id: 'usr-' + Date.now(),
        lastLogin: 'Nunca',
      };
      setUsers((prev) => [newUser, ...prev]);
      logAudit('Usuarios', 'Creación de usuario', userData.username, `Rol asignado: ${userData.role}`);
      addToast('success', 'Usuario Creado', `Usuario ${userData.name} registrado con rol ${userData.role}`);
    }
  };

  const toggleUserStatus = (id: string) => {
    if (!requireStaffAccess('Estado de Usuario')) return;
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === id) {
          const next = u.status === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
          logAudit('Usuarios', 'Cambio estado usuario', u.username, `Estado cambiado a ${next}`);
          addToast('info', 'Estado Actualizado', `Usuario ${u.name} ahora está ${next}`);
          return { ...u, status: next };
        }
        return u;
      })
    );
  };

  // Reset demo state
  const resetAllData = () => {
    if (!requireStaffAccess('Restaurar Demo')) return;
    localStorage.clear();
    setProducts(INITIAL_PRODUCTS);
    setCategories(INITIAL_CATEGORIES);
    setSuppliers(INITIAL_SUPPLIERS);
    setClients(INITIAL_CLIENTS);
    setPromotions(INITIAL_PROMOTIONS);
    setPurchaseOrders(INITIAL_PURCHASE_ORDERS);
    setOnlineOrders(INITIAL_ONLINE_ORDERS);
    setSales(INITIAL_SALES);
    setInventoryMovements(INITIAL_MOVEMENTS);
    setCashRegister(INITIAL_CASH_REGISTER);
    setStoreSettings(INITIAL_SETTINGS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setUsers(INITIAL_USERS);
    setCart([]);
    setAppliedPromoCode('');
    setCurrentUser(INITIAL_USERS[0]);
    addToast('info', 'Datos Reiniciados', 'La base de datos se restauró a los valores de prueba originales.');
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        hasAdminAccess,
        activeView,
        setActiveView,
        login,
        loginClient,
        registerClient,
        updateOwnClientProfile,
        logout,
        switchRole,
        hasAccessToView,
        products,
        categories,
        suppliers,
        clients,
        promotions,
        purchaseOrders,
        onlineOrders,
        sales,
        inventoryMovements,
        cashRegister,
        storeSettings,
        auditLogs,
        returns,
        users,
        cart,
        appliedPromoCode,
        setAppliedPromoCode,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        placeOnlineOrder,
        toasts,
        addToast,
        removeToast,
        saveProduct,
        deleteProduct,
        saveCategory,
        toggleCategoryStatus,
        receivePurchaseOrder,
        createPurchaseOrder,
        processSale,
        processReturn,
        approveReturn,
        openCashRegister,
        closeCashRegister,
        updateOrderStatus,
        addManualInventoryMovement,
        savePromotion,
        togglePromotionStatus,
        saveSupplier,
        saveClient,
        saveUser,
        toggleUserStatus,
        resetAllData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
