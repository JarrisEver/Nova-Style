# NOVAStyle – Tienda Online & NS-Management

Plataforma comercial omnicanal de moda con dos entornos independientes conectados a un estado operativo unificado:

1. **Tienda Online Pública (`/`)**: experiencia e-commerce editorial con Hero parallax, catálogo multivariante, categorías activas, promociones con cupones, carrito con validación de stock en tiempo real, checkout conectado a pedidos e inventario, cuenta de cliente y seguimiento de pedidos.
2. **Panel Administrativo Privado (`/admin`)**: suite ERP/POS protegida por autenticación y matriz de permisos por rol (RBAC), con módulos de Dashboard gerencial, POS, Productos, Categorías, Inventario & Kardex, Compras, Proveedores, Clientes, Promociones, Caja, Pedidos Online (Kanban), Devoluciones, Reportes, Usuarios, Auditoría y Configuración.

## Stack Tecnológico

- **React 19 + TypeScript**
- **Vite 8**
- **Tailwind CSS v4**
- **React Router DOM v7** (con `React.lazy` y `Suspense` para carga diferida de módulos)
- **Motion (Framer Motion)** para transiciones fluidas, parallax y profundidad 3D
- **Recharts** para analítica comercial
- **Lucide React** para iconografía

## Rutas Principales

### Entorno Público (Tienda Online)
- `/` — Portada editorial y productos destacados
- `/productos` — Catálogo filtrable por categoría, marca, disponibilidad y búsqueda
- `/productos/:id` — Detalle de prenda, selector de talla/color y compra directa
- `/categorias` — Colecciones y categorías activas
- `/promociones` — Campañas y códigos promocionales vigentes
- `/carrito` — Bolsa de compras y checkout omnicanal
- `/mi-cuenta` — Inicio de sesión, registro y perfil de cliente
- `/mis-pedidos` — Seguimiento en vivo de pedidos del cliente autenticado
- `/contacto` — Boutique insignia y formulario de atención

### Entorno Privado (Panel Administrativo)
- `/admin/login` — Acceso exclusivo para personal corporativo
- `/admin/dashboard` — Dashboard gerencial
- `/admin/pos` — Punto de Venta (POS)
- `/admin/productos` — Catálogo de productos y variantes
- `/admin/categorias` — Gestión de categorías
- `/admin/inventario` — Inventario & Kardex
- `/admin/compras` — Órdenes de compra y recepciones
- `/admin/proveedores` — Directorio de proveedores
- `/admin/clientes` — CRM de clientes
- `/admin/promociones` — Gestión de cupones y campañas
- `/admin/caja` — Apertura, movimientos y arqueo de caja
- `/admin/pedidos` — Tablero Kanban de pedidos online
- `/admin/devoluciones` — Devoluciones, cambios y aprobaciones
- `/admin/reportes` — Reportes financieros y operativos
- `/admin/usuarios` — Administración de usuarios y roles RBAC
- `/admin/auditoria` — Bitácora de auditoría
- `/admin/configuracion` — Configuración general de la tienda

## Comandos Locales

```bash
npm install
npm run dev
npm run lint
npm run build
npm run preview
```
