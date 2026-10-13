# NOVAStyle – NS-Management

> **Sistema de Gestión Comercial e Inventario integrado para la optimización de procesos operativos en tiempo real.**

Aplicación web administrativa empresarial desarrollada para una tienda departamental. Permite gestionar de manera centralizada el catálogo de productos, variantes por talla y color (control de SKU), existencias en almacén con libro Kardex, órdenes de compra y recepción de mercadería (CU-02), terminal punto de venta (POS) con facturación electrónica y validaciones de stock (CU-03, CU-04, CU-05), apertura y arqueo de caja (CU-07), devoluciones con visto bueno de supervisores (CU-06), pedidos online mediante tablero Kanban (CU-09) y reportes analíticos exportables.

---

## 🚀 Enlace de la Aplicación en Producción

La aplicación se encuentra desplegada y lista para operar en el siguiente enlace:

🔗 **URL Pública del Sistema:**  
[https://ais-pre-pvr3em2p22u62lkvphpifo-487229797591.us-west1.run.app](https://ais-pre-pvr3em2p22u62lkvphpifo-487229797591.us-west1.run.app)

---

## 🛠️ Tecnologías Utilizadas

- **Frontend:** React 19, TypeScript
- **Estilos:** Tailwind CSS v4 (Paleta corporativa: Navy `#0f172a`, Slate, Azul, Blanco)
- **Iconografía:** Lucide React
- **Gráficos Estadísticos:** Recharts (Ventas por día, categorías, top productos, salud de stock)
- **Persistencia:** State Manager con sincronización bidireccional en `localStorage` y catálogo mock realista (20+ prendas, 10 clientes, 8 proveedores, 20 ventas históricas, 10 órdenes de compra, 15 pedidos online, bitácora de auditoría)
- **Entorno de compilación:** Vite

---

## 👥 Matriz de Roles y Accesos (RBAC)

El sistema cuenta con 8 perfiles de usuario preconfigurados para pruebas inmediatas:

| Rol | Usuario | Contraseña | Módulos Autorizados |
| :--- | :--- | :--- | :--- |
| **Administrador** | `admin` | `admin123` | Acceso irrestricto a todos los módulos y configuración general |
| **Vendedor** | `vendedor` | `vendedor123` | POS / Ventas, Catálogo de Productos, Clientes, Promociones |
| **Cajero** | `cajero` | `cajero123` | Gestión de Caja, Cobros, Comprobantes, Arqueo y Cierre |
| **Almacenero** | `almacen` | `almacen123` | Inventario, Recepción de Mercadería, Libro Kardex, Traslados |
| **Comprador** | `compras` | `compras123` | Proveedores Homologados, Emisión de Órdenes de Compra |
| **Supervisor** | `supervisor` | `supervisor123` | Auditoría, Autorización de Devoluciones > S/ 200, Historial |
| **Gerencia** | `gerencia` | `gerencia123` | Dashboard Ejecutivo, Indicadores KPI, Reportes y Estadísticas |
| **Cliente** | `cliente` | `cliente123` | Catálogo de prendas, Carrito y Pedidos en línea |

> *Nota:* En la cabecera superior se incluye un selector rápido de perfiles para alternar entre roles en 1 clic sin necesidad de cerrar sesión.

---

## 📦 Módulos Principales y Casos de Uso

### 1. Dashboard Ejecutivo
- Monitoreo en vivo de ventas del día, ventas del mes, pedidos en curso, compras e inventario crítico.
- 4 Gráficos interactivos Recharts: Facturación diaria, Ventas por categoría departamental, Top 5 prendas más vendidas y distribución del estado del inventario.
- Tablas de alertas de stock mínimo y últimas ventas.

### 2. Punto de Venta (POS) & Pasarela de Pagos (CU-03, CU-04, CU-05, CU-11)
- Búsqueda en tiempo real por nombre, código de barras o SKU.
- Filtros por categoría, marca, talla y color.
- Control estricto de existencias: bloquea adición si no hay stock suficiente (Regla #1).
- Bloqueo preventivo si la caja física está cerrada para canal presencial (Regla #5).
- Aplicación de cupones promocionales con verificación de fecha de vigencia y monto mínimo (Regla #2).
- Modal de pagos: Efectivo (cálculo de vuelto automático) o pasarela electrónica (simulación con aprobación o rechazo).
- Generación de comprobante electrónico (Boleta de Venta / Factura con QR y cálculo del 18% IGV) imprimible y descargable.

### 3. Catálogo de Productos & Variantes (CU-01)
- CRUD completo de productos con formulario de variantes dinámicas (Talla, Color, Modelo, SKU, Stock, Stock Mínimo y Ubicación en estantería).
- Validación estricta que impide SKUs duplicados (Regla #9).

### 4. Inventario & Libro Kardex
- Estado de cada variante: *Disponible*, *Stock bajo* o *Agotado*.
- Operaciones manuales inmediatas: **Entrada**, **Salida**, **Ajuste** y **Transferencia**.
- Libro Kardex cronológico donde se registran recepciones, ventas, devoluciones y mermas con stock anterior y nuevo (Regla #8).

### 5. Compras & Recepción de Mercadería (CU-02, CU-10)
- Emisión de órdenes de compra con selección de proveedor e ítems detallados.
- **CU-02 Recepción de Mercadería**: Al confirmar la llegada física, el sistema incrementa automáticamente las existencias de las variantes involucradas, cambia el estado a *Recibida* y registra el evento en el Kardex y la Auditoría.

### 6. Caja & Conciliación de Cierre (CU-07)
- Apertura diaria con registro de saldo inicial en efectivo.
- Monitoreo de ingresos en efectivo vs. pagos con tarjeta/electrónicos y saldo esperado.
- Cierre de caja con ingreso de saldo declarado por el cajero y cálculo de diferencias (sobrante o faltante).

### 7. Pedidos Online (Kanban) (CU-09)
- Tablero Kanban con 7 etapas: *Pendiente*, *Confirmado*, *Preparado*, *Enviado*, *Entregado*, *Cancelado* y *Devuelto*.
- Avance de pedidos en un clic y detalle completo con datos de entrega y tracking.

### 8. Devoluciones & Cambios (CU-06)
- Búsqueda obligatoria de la venta de origen (Regla #3).
- Selección de prenda y resolución (*Cambio*, *Reembolso en efectivo* o *Nota de crédito*).
- Flujo de autorización para devoluciones que superen S/ 200 (Regla #6) y reintegro inmediato de stock al catálogo.

### 9. Reportes Exportables
- Reportes dinámicos de Ventas, Inventario, Compras y Productos más vendidos.
- Botones de **Exportar Excel (CSV)** y **Exportar PDF / Imprimir**.

### 10. Bitácora de Auditoría
- Registro de fecha, hora, usuario, rol, módulo, acción y referencia para todas las transacciones sensibles del sistema (Regla #7).

---

## 💻 Instalación y Ejecución Local

Si deseas clonar y ejecutar el proyecto en tu máquina local:

```bash
# 1. Clonar el repositorio
git clone <URL_DE_TU_REPOSITORIO>
cd novastyle-ns-management

# 2. Instalar dependencias
npm install

# 3. Iniciar el servidor de desarrollo
npm run dev
```

La aplicación se abrirá en `http://localhost:3000`.

---

## 🏢 Créditos

**NOVAStyle – NS-Management**  
*Sistema de Gestión Comercial e Inventario integrado para la optimización de procesos operativos en tiempo real.*
