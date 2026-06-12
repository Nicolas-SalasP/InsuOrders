# InsuOrders — CMMS & Gestión de Inventario

Sistema de gestión de mantenimiento (CMMS) desarrollado para **Insuban Ltda.** Centraliza órdenes de trabajo, inventario de bodega, compras, activos y portal de solicitudes en una sola plataforma.

---

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Frontend | React 18 + Vite, Bootstrap 5, React Router v6 |
| Backend | PHP 8+ · Patrón MVC propio (Controllers / Services / Repositories) |
| Base de datos | MySQL / MariaDB · PDO |
| Auth | JWT en cookie HttpOnly + validación de rol en BD por request |
| PDF / Excel | TCPDF · PhpSpreadsheet |
| Tests | Vitest + React Testing Library |

---

## Módulos

| Módulo | Descripción |
|---|---|
| **Portal de Solicitudes** | Interfaz para clientes/solicitantes. Crean tickets, siguen su estado y ven el reporte de cierre del técnico con fotos |
| **Mantención** | Ciclo completo de OTs: creación, asignación, avance con checklist, carga de evidencias, firma digital y cierre. Permisos de trabajo seguro configurables por OT |
| **Mis Mantenciones** | Vista exclusiva del técnico. Panel split con lista de OTs propias y detalle en tiempo real. Funciona en celular |
| **Bodega** | Entrega de materiales a técnicos (unitaria y masiva), procesamiento de devoluciones con 3 tipos (sobrante, daño, no recibido) y organización de stock por ubicación |
| **Mis Insumos** | El técnico acepta, consume o devuelve los materiales que bodega le asignó |
| **Inventario** | Catálogo de insumos con stock por ubicación, alertas de stock mínimo, ajustes manuales y movimientos trazables |
| **Compras** | OC manuales o basadas en déficit de OTs. Recepción total/parcial con actualización automática de stock. Exportación a Excel con 14 columnas financieras (neto + IVA + total) |
| **Activos** | Ficha técnica de equipos: datos generales, kit de repuestos, galería y documentos. Exportación del kit a Excel |
| **Cotizaciones** | Creación, previsualización (sin descargar), descarga en PDF corporativo y flujo de aprobación/rechazo |
| **Cronograma** | Calendario de mantenciones preventivas y compras programadas. Vistas día / semana / mes |
| **Dashboard** | KPIs de compras y mantención. Selector Neto / Total c/IVA que actualiza todos los gráficos simultáneamente. Filtros por fecha y técnico |
| **Usuarios** | Gestión de usuarios con roles base y permisos granulares por módulo. El jefe puede revocar accesos sin tocar el rol global |

---

## Roles

| Rol | Acceso |
|---|---|
| Admin | Todo |
| Jefe de Mantención | Mantención, activos, cronograma, reportes |
| Técnico / Operario | Mis Mantenciones, Mis Insumos, Activos (lectura) |
| Bodeguero | Bodega, Inventario |
| Compras | Órdenes de compra, cotizaciones, proveedores |
| Cliente | Portal de Solicitudes únicamente |

Los permisos son granulares: un usuario puede tener rol Técnico pero con permiso adicional de `inv_ver` para ver el inventario.

---

## Estructura del proyecto

```
InsuOrders/
├── insuban_db.sql                    # Esquema completo de la BD
│
├── public_html/                      # Frontend React + punto de entrada de la API
│   ├── api/
│   │   ├── index.php                 # Router principal de la API (Front Controller)
│   │   └── .htaccess                 # Rewrite rules
│   ├── src/
│   │   ├── pages/                    # Vistas por módulo
│   │   ├── components/               # Componentes y modales reutilizables
│   │   ├── context/AuthContext.jsx   # Sesión global (JWT cookie + localStorage UI)
│   │   ├── hooks/                    # usePermission y otros custom hooks
│   │   └── api/axiosConfig.js        # Cliente HTTP + interceptor 401
│   └── uploads/                      # Fotos, PDFs y evidencias (generado en runtime)
│
└── insuorders_private/               # Backend PHP — NO debe ser público en el servidor
    └── src/App/
        ├── Controllers/              # 19 controladores (uno por recurso)
        ├── Services/                 # Lógica de negocio y generación de documentos
        ├── Repositories/             # Data Access Layer (PDO directo)
        └── Middleware/AuthMiddleware.php  # Validación JWT + permisos en BD
```

---

## Instalación local

### Requisitos
- PHP 8.0+, Composer
- MySQL 5.7+ o MariaDB
- Node.js 18+, npm

### Pasos

```bash
# 1. Base de datos
mysql -u root -p -e "CREATE DATABASE insuban_db CHARACTER SET utf8mb4"
mysql -u root -p insuban_db < insuban_db.sql

# 2. Backend
cd insuorders_private
composer install
# Editar src/App/Config/Config.php con las credenciales de BD y JWT_SECRET

# 3. Frontend
cd ../public_html
npm install
npm run dev          # http://localhost:5173
```

La API PHP debe servirse desde un servidor Apache/Nginx apuntando a `public_html/` como document root. El directorio `insuorders_private/` debe estar **fuera** del document root.

### Variables de configuración (`Config.php`)

```php
const DB_HOST     = 'localhost';
const DB_NAME     = 'insuban_db';
const DB_USER     = 'tu_usuario';
const DB_PASS     = 'tu_contraseña';
const JWT_SECRET  = 'clave-secreta-larga';
```

---

## Tests

```bash
cd public_html
npm test          # Vitest — 119 tests en 12 suites
```

Cobertura: AuthContext, PermissionGuard, Login, Sidebar, ChecklistRenderer, hooks de permisos, parseBlobError, interceptor Axios.

---

## Seguridad aplicada

- JWT en cookie `HttpOnly` — el token nunca es accesible desde JS
- Validación de rol y permisos en BD en **cada request** (no sólo en el JWT)
- `SELECT ... FOR UPDATE` en recepciones de OC y entregas de material (prevención de race conditions)
- Revalidación de permisos frescos en cada carga de app y evento `focus` de ventana
- Permisos granulares: revocación inmediata sin esperar expiración del token

---

## CI/CD

El repositorio incluye un workflow de GitHub Actions (`.github/workflows/`) que ejecuta los tests de frontend en cada push a `main` y `dev/NicolasSalas`.
