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
    * Control de acceso granular (Administrador, Jefe de Mantención, Técnico, Bodeguero, Cliente, etc.). 
    * Modos de "solo lectura" adaptables a cada vista según el rol.

---

## 🏗️ Arquitectura y Tecnologías

El proyecto está dividido en dos capas principales totalmente desacopladas por seguridad y escalabilidad:

### Frontend + API Pública (`/public_html`)
Desarrollado como una Single Page Application (SPA) y actúa como la capa expuesta a Internet.
* **Framework:** React.js + Vite.
* **Estilos:** Bootstrap 5, Bootstrap Icons, CSS personalizado.
* **Librerías clave:** `axios` (peticiones HTTP), `react-router-dom` (navegación), `sweetalert2` (alertas), `react-signature-canvas` (firma digital).
* **API Router:** Contiene la carpeta `/api` con su propio `.htaccess` y un `index.php` que actúa como puente seguro hacia el core privado.

### Backend Privado (`/insuorders_private`)
API RESTful construida de forma nativa con PHP, siguiendo el patrón de diseño por capas (Controladores, Servicios, Repositorios). **Esta carpeta no debe ser accesible públicamente por el servidor web.**
* **Lenguaje:** PHP 8+
* **Base de Datos:** MySQL (concepción relacional usando PDO).
* **Dependencias (Composer):** Utiliza librerías como TCPDF (Reportes PDF), PhpSpreadsheet (Exportación Excel) y JWT.
* **Autenticación:** Basada en tokens seguros gestionados por middleware propio.

---

## 🚀 Instalación y Configuración (Desarrollo)

### 1. Requisitos Previos
* Servidor web (Apache/Nginx).
* PHP 8.0 o superior.
* MySQL 5.7+ o MariaDB.
* Composer (Para dependencias PHP).
* Node.js (v16+) y npm (para compilar el frontend).

### 2. Configuración de la Base de Datos
1.  Crea una base de datos vacía en tu gestor MySQL (ej: `insuban_db`).
2.  Importa el script SQL incluido en la raíz del proyecto (`insuban_db.sql`).

### 3. Configuración del Backend (API Privada)
1.  Abre una terminal, navega a la carpeta `insuorders_private/` e instala las dependencias de PHP:
    ```bash
    composer install
    ```
2.  Ubica la carpeta `insuorders_private/src/App/Config/`.
3.  Edita o verifica el archivo `Config.php` para apuntar a tus credenciales de base de datos locales:
    ```php
    define('DB_HOST', 'localhost');
    define('DB_NAME', 'insuban_db');
    define('DB_USER', 'tu_usuario');
    define('DB_PASS', 'tu_contraseña');
    ```
4.  Asegúrate de que la carpeta pública de archivos (`public_html/uploads/`) tenga permisos de escritura (`chmod 777` en entornos locales o `755` en producción) para guardar fotos y PDFs.

### 4. Configuración del Frontend
1.  Abre una terminal y navega a la carpeta pública: `cd public_html`.
2.  Instala las dependencias de Node:
    ```bash
    npm install
    ```
3.  Verifica la URL base de tu API en `public_html/src/api/axiosConfig.js`. Por defecto apunta a tu servidor local:
    ```javascript
    baseURL: 'http://localhost/api' // Ajusta según tu entorno
    ```
4.  Inicia el servidor de desarrollo de Vite:
    ```bash
    npm run dev
    ```

---

## 📂 Estructura de Directorios Principal

```text
/
├── insuban_db.sql                # Dump principal de la base de datos
├── public_html/                  # Frontend (React) y acceso público de la API
│   ├── api/                      # Router de la API pública
│   │   ├── .htaccess             # Redirección limpia de rutas de la API
│   │   └── index.php             # Front Controller (puente hacia insuorders_private)
│   ├── assets/                   # Recursos estáticos globales (ej: imágenes, logos)
│   │   └── img/
│   ├── public/                   # Archivos estáticos de Vite (favicon, .htaccess frontend)
│   ├── src/                      # Código fuente de React (SPA)
│   │   ├── api/                  # Configuración de Axios (axiosConfig.js)
│   │   ├── assets/               # Recursos estáticos propios de React
│   │   ├── components/           # Componentes reutilizables, UI y modales
│   │   ├── context/              # AuthContext (Estado global de sesión)
│   │   ├── hooks/                # Custom hooks (ej: usePermission)
│   │   ├── pages/                # Vistas principales (Compras, Mantencion, etc.)
│   │   ├── App.jsx               # Enrutador principal (React Router)
│   │   └── main.jsx              # Punto de montaje de React
│   ├── uploads/                  # Directorio destino de archivos (cierre, ordenes)
│   ├── index.html                # Plantilla HTML base
│   ├── package.json              # Dependencias de Node (React, Vite, Bootstrap)
│   └── vite.config.js            # Configuración de empaquetado del frontend
└── insuorders_private/           # Backend (PHP Core - Protegido, fuera del acceso web)
    ├── composer.json             # Declaración de dependencias PHP
    ├── composer.lock             # Versiones fijadas de dependencias PHP
    └── src/
        ├── App/                  # Lógica de la aplicación
        │   ├── Config/           # Conexión a BD y variables constantes
        │   ├── Controllers/      # Endpoints de la API
        │   ├── Database/         # Manejador de conexión PDO
        │   ├── Middleware/       # Verificación de Tokens y Permisos
        │   ├── Repositories/     # Consultas SQL directas (Data Access Layer)
        │   └── Services/         # Lógica de Negocio y Generación PDF/Excel
        └── core/                 # Inicialización del núcleo
            └── init.php          # Carga de clases, autoloader y configuración base
