# 🛠️ InsuOrders - Sistema CMMS & ERP

**InsuOrders** es un sistema integral de Gestión de Mantenimiento Computarizado (CMMS) y Planificación de Recursos Empresariales (ERP), diseñado para administrar eficientemente órdenes de trabajo, mantenimientos preventivos, inventario de bodega, gestión de activos y compras.

Este proyecto garantiza la trazabilidad operativa, desde que un cliente solicita un servicio, pasando por la asignación a técnicos, consumo de inventario, hasta la firma de conformidad y el reporte final.

---

## ✨ Características Principales

* **📋 Gestión de Órdenes de Trabajo (OTs):**
    * Ciclo de vida completo: Creación, Asignación, En Proceso, Pausada y Finalizada.
    * Panel dedicado para Técnicos (`Mis Mantenciones`) con control de stock personal y adjunto de evidencias (fotos/videos).
    * Cierre de OT con firma digital y generación automática de reportes en PDF.
* **📅 Mantenimiento Preventivo (Cronograma):**
   * Programación y proyección inteligente de tareas periódicas a futuro (meses o años) sin saturar las vistas del día a día.
* **📦 Bodega e Inventario:**
    * Control estricto de stock de insumos.
    * Entregas de material al personal (Técnicos) y validación de déficit.
    * Asignación de "Kits de Mantenimiento" a Máquinas/Activos y Sub-activos.
* **🛒 Módulo de Compras:**
    * Creación de Órdenes de Compra (OC) manuales o automáticas basadas en el déficit de stock.
    * Recepción de compras (Total o Parcial) con actualización automática del inventario.
    * Gestión de facturas/documentos y exportación.
* **👥 Portal Cliente:**
    * Interfaz exclusiva para que los solicitantes creen tickets y sigan el estado de sus requerimientos en tiempo real.
    * Acceso al reporte final del técnico con fecha de cierre y evidencias multimedia.
* **🔒 Roles y Permisos Dinámicos:**
    * Control de acceso granular (Administrador, Jefe de Mantención, Técnico, Bodeguero, Cliente, etc.). Por ejemplo: modo "solo lectura" para técnicos al visualizar activos.

---

## 🏗️ Arquitectura y Tecnologías

El proyecto está dividido en dos capas principales desacopladas:

### Frontend (`/public_html`)
Desarrollado como una Single Page Application (SPA).
* **Framework:** React.js + Vite
* **Estilos:** Bootstrap 5, Bootstrap Icons, CSS personalizado.
* **Librerías clave:** `axios` (peticiones HTTP), `react-router-dom` (navegación), `sweetalert2` (alertas), `react-signature-canvas` (firma digital).

### Backend API (`/insuorders_private`)
API RESTful construida de forma nativa con PHP, siguiendo el patrón de diseño por capas (Controladores, Servicios, Repositorios).
* **Lenguaje:** PHP 8+
* **Base de Datos:** MySQL (concepción relacional usando PDO).
* **Generación de Archivos:** TCPDF / FPDF (Reportes PDF), PhpSpreadsheet (Exportación Excel).
* **Autenticación:** Basada en tokens/sesiones seguras (JWT/Cookies) gestionadas por middleware propio.

---

## 🚀 Instalación y Configuración (Desarrollo)

### 1. Requisitos Previos
* Servidor web (Apache/Nginx).
* PHP 8.0 o superior.
* MySQL 5.7+ o MariaDB.
* Node.js (v16+) y npm (para compilar el frontend).

### 2. Configuración de la Base de Datos
1.  Crea una base de datos vacía en tu gestor MySQL (ej: `insuban_db`).
2.  Importa el script SQL incluido en la raíz del proyecto (`insuban_db.sql`).

### 3. Configuración del Backend (API)
1.  Ubica la carpeta `insuorders_private/src/App/Config/`.
2.  Edita o verifica el archivo `Config.php` para apuntar a tus credenciales de base de datos locales:
    ```php
    define('DB_HOST', 'localhost');
    define('DB_NAME', 'insuban_db');
    define('DB_USER', 'tu_usuario');
    define('DB_PASS', 'tu_contraseña');
    ```
3.  Asegúrate de que las carpetas de subida de archivos (`public_html/uploads/cierre/` y `public_html/uploads/ordenes/`) tengan permisos de escritura (`chmod 777` en entornos locales o `755` en producción).

### 4. Configuración del Frontend
1.  Abre una terminal y navega a la carpeta del frontend: `cd public_html`.
2.  Instala las dependencias:
    ```bash
    npm install
    ```
3.  Verifica la URL base de tu API en `src/api/axiosConfig.js`. Por defecto apunta a tu servidor local:
    ```javascript
    baseURL: 'http://localhost/api' // Ajusta según tu VirtualHost o entorno
    ```
4.  Inicia el servidor de desarrollo de Vite:
    ```bash
    npm run dev
    ```

### 5. Despliegue a Producción
Para desplegar el frontend, ejecuta `npm run build` dentro de `public_html`. Esto generará una carpeta `dist/` con los archivos estáticos optimizados. Configura tu servidor para servir el `index.html` de esta carpeta y rutea todas las peticiones de `/api/*` hacia el archivo `index.php` del backend.

---

## 📂 Estructura de Directorios Principal

```text
/
├── insuban_db.sql                # Dump de la base de datos
├── public_html/                  # Frontend (React) y Assets públicos
│   ├── src/
│   │   ├── api/                  # Configuración de Axios
│   │   ├── components/           # Modales, Sidebar, Layout, etc.
│   │   ├── context/              # AuthContext (Estado global)
│   │   ├── hooks/                # Custom hooks (ej: usePermission)
│   │   └── pages/                # Vistas principales (Compras, Mantencion, etc.)
│   ├── uploads/                  # Directorio destino de imágenes/pdf (cierre, ordenes)
│   └── package.json              # Dependencias de Node
└── insuorders_private/           # Backend (PHP)
    └── src/
        └── App/
            ├── Config/           # Conexión a BD y constantes
            ├── Controllers/      # Endpoints de la API
            ├── Database/         # Conexión PDO
            ├── Middleware/       # Verificación de Tokens/Permisos
            ├── Repositories/     # Consultas SQL directas (Modelos)
            └── Services/         # Lógica de Negocio, Generación PDF/Excel
