-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 22-12-2025 a las 18:58:14
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `insuban_db`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `activos`
--

CREATE TABLE `activos` (
  `id` int(11) NOT NULL,
  `codigo_interno` varchar(20) DEFAULT NULL,
  `nombre` varchar(100) NOT NULL,
  `tipo` varchar(50) DEFAULT NULL,
  `descripcion` text DEFAULT NULL,
  `ubicacion` varchar(100) DEFAULT NULL,
  `centro_costo_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `activos`
--

INSERT INTO `activos` (`id`, `codigo_interno`, `nombre`, `tipo`, `descripcion`, `ubicacion`, `centro_costo_id`) VALUES
(14, 'MAQ-01', 'Torno CNC', 'Maquinaria', 'Operativo', 'Taller 1', 7);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `activos_docs`
--

CREATE TABLE `activos_docs` (
  `id` int(11) NOT NULL,
  `activo_id` int(11) NOT NULL,
  `nombre_archivo` varchar(255) NOT NULL,
  `url_archivo` varchar(255) NOT NULL,
  `fecha_subida` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `activos_insumos`
--

CREATE TABLE `activos_insumos` (
  `id` int(11) NOT NULL,
  `activo_id` int(11) NOT NULL,
  `insumo_id` int(11) NOT NULL,
  `cantidad_default` decimal(10,2) DEFAULT 1.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `areas_negocio`
--

CREATE TABLE `areas_negocio` (
  `id` int(11) NOT NULL,
  `codigo` varchar(20) NOT NULL,
  `nombre` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `areas_negocio`
--

INSERT INTO `areas_negocio` (`id`, `codigo`, `nombre`) VALUES
(1, '105', 'Tripas de Cerdo / Intestino Delgado'),
(2, '110', 'Hog Stomach / Estomago de Cerdo'),
(3, '115', 'After / Fateends (Recto y Semicular)'),
(4, '120', 'Chitterlings / Bouts'),
(5, '126', 'Mucosa'),
(6, '140', 'By products (Grasa y Pancreas)'),
(7, '200', 'Cordero'),
(8, '300', 'Beef Casing / Tripas de Vacuno'),
(9, '320', 'Horse Casing / Tripas de Equino'),
(10, '109', 'Servicio'),
(11, '730', 'Agrosuper Servicio'),
(12, '999', 'General / Administración / Servicios');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `categorias_insumo`
--

CREATE TABLE `categorias_insumo` (
  `id` int(11) NOT NULL,
  `nombre` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `categorias_insumo`
--

INSERT INTO `categorias_insumo` (`id`, `nombre`) VALUES
(32, 'Acero'),
(37, 'Airolite'),
(30, 'Bombas'),
(26, 'Correas'),
(2, 'Eléctrico'),
(10, 'Ferretería'),
(27, 'Fittings'),
(1, 'General'),
(7, 'Herramientas'),
(3, 'Hidráulico'),
(31, 'Iluminación'),
(21, 'Inflamables'),
(29, 'Karcher'),
(6, 'Lubricantes'),
(4, 'Mecánico'),
(34, 'Motores'),
(25, 'Neumática'),
(22, 'Pinturas'),
(11, 'Retenes'),
(8, 'Rodamientos'),
(5, 'Seguridad / EPP'),
(12, 'Sin Categoría'),
(28, 'Tornillería');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `centros_costo`
--

CREATE TABLE `centros_costo` (
  `id` int(11) NOT NULL,
  `codigo` varchar(20) NOT NULL,
  `alias` varchar(20) DEFAULT NULL,
  `nombre` varchar(100) NOT NULL,
  `area_negocio_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `centros_costo`
--

INSERT INTO `centros_costo` (`id`, `codigo`, `alias`, `nombre`, `area_negocio_id`) VALUES
(1, '6000', 'I-PROD', 'Produccion', 12),
(2, '6012', 'I-MADEJA', 'IDC Madeja', 1),
(3, '6013', 'I-ORILLA', 'VID Orilla', 8),
(4, '6014', 'I-MEDIO', 'VIG Medio', 8),
(5, '6015', 'I-TRIPON', 'VGC Tripona', 8),
(6, '6017', 'I-BOUTS', 'Bouts', 4),
(7, '6021', 'I-TUBING', 'IDC Tubing', 1),
(8, '6031', 'I-HOR', 'HOR', 5),
(9, '6040', 'I-H FINA', 'CIDH Fina', 1),
(10, '6041', 'I-H RIZA', 'CIGH Rizada', 4),
(11, '6042', 'I-EQUINO', 'EID Equino', 9),
(12, '6043', NULL, 'Grasa', 6),
(13, '6044', NULL, 'Pancreas', 6),
(14, '6045', 'I-RECTOS', 'Rectos de cerdo', 3),
(15, '6046', 'I-SEMIC', 'Semiculares', 3),
(16, '6047', 'I-REPROC', 'Reproceso', 1),
(17, '6070', 'I-CORDERO', 'Cordero', 7),
(18, '6130', 'I-COMAFRI', 'Planta Comafri', 1),
(19, '6132', 'I-COEXCA', 'Planta Coexca', 1),
(20, '6135', 'I-CAMER', 'Planta Camer', 8),
(21, '6144', NULL, 'Pancreas Exterior', 6),
(22, '6192', 'I-AGRO', 'Agrosuper Servicio', 11),
(23, '6200', 'I-OPR', 'Operaciones', 12),
(24, '6300', 'I-BODEGA', 'Bodega', 12),
(25, '6400', 'I-MANTEN', 'Mantencion', 12),
(26, '6500', 'I-QUALIT', 'Calidad', 12),
(27, '6600', 'I-CLEAN', 'Aseo', 12),
(28, '7000', 'I-SALE', 'Comercial / Ventas', 12),
(29, '8010', 'I-ADM', 'Finanzas / RRHH', 12),
(30, '8020', NULL, 'Departamento TI', 12),
(31, '9000', NULL, 'Costos Financieros', 12);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `comunas`
--

CREATE TABLE `comunas` (
  `id` int(11) NOT NULL,
  `nombre` varchar(50) NOT NULL,
  `region_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `comunas`
--

INSERT INTO `comunas` (`id`, `nombre`, `region_id`) VALUES
(1, 'Antártica', 1),
(2, 'Puerto Williams', 1),
(3, 'Puerto Toro', 1),
(4, 'Navarino', 1),
(5, 'Antofagasta', 2),
(6, 'Mejillones', 2),
(7, 'Calama', 2),
(8, 'Taltal', 2),
(9, 'Temuco', 3),
(10, 'Angol', 3),
(11, 'Villarrica', 3),
(12, 'Pucón', 3),
(13, 'Arica', 4),
(14, 'Putre', 4),
(15, 'Camarones', 4),
(16, 'General Lagos', 4),
(17, 'Coyhaique', 5),
(18, 'Chile Chico', 5),
(19, 'Aysén', 5),
(20, 'Cisnes', 5),
(21, 'Copiapó', 6),
(22, 'Vallenar', 6),
(23, 'Caldera', 6),
(24, 'Tierra Amarilla', 6),
(25, 'Concepción', 7),
(26, 'Talcahuano', 7),
(27, 'Los Ángeles', 7),
(28, 'Hualpén', 7),
(29, 'La Serena', 8),
(30, 'Coquimbo', 8),
(31, 'Ovalle', 8),
(32, 'Andacollo', 8),
(33, 'Puerto Montt', 9),
(34, 'Castro', 9),
(35, 'Osorno', 9),
(36, 'Puerto Varas', 9),
(37, 'Valdivia', 10),
(38, 'La Unión', 10),
(39, 'Río Bueno', 10),
(40, 'Lago Ranco', 10),
(41, 'Punta Arenas', 11),
(42, 'Puerto Natales', 11),
(43, 'Porvenir', 11),
(44, 'Cabo de Hornos', 11),
(45, 'Talca', 12),
(46, 'Curicó', 12),
(47, 'Linares', 12),
(48, 'Molina', 12),
(49, 'Chillán', 13),
(50, 'San Carlos', 13),
(51, 'Quirihue', 13),
(52, 'Ninhue', 13),
(53, 'Doñihue', 14),
(54, 'Rancagua', 14),
(55, 'Graneros', 14),
(56, 'Pichilemu', 14),
(57, 'Codegua', 14),
(58, 'Buin', 15),
(59, 'Calera de Tango', 15),
(60, 'Cerrillos', 15),
(61, 'Colina', 15),
(62, 'Conchalí', 15),
(63, 'El Bosque', 15),
(64, 'El Monte', 15),
(65, 'Estación Central', 15),
(66, 'Huechuraba', 15),
(67, 'Independencia', 15),
(68, 'Isla de Maipo', 15),
(69, 'La Cisterna', 15),
(70, 'La Florida', 15),
(71, 'La Granja', 15),
(72, 'La Pintana', 15),
(73, 'La Reina', 15),
(74, 'Lampa', 15),
(75, 'Las Condes', 15),
(76, 'Lo Barnechea', 15),
(77, 'Lo Espejo', 15),
(78, 'Lo Prado', 15),
(79, 'Macul', 15),
(80, 'Maipú', 15),
(81, 'María Pinto', 15),
(82, 'Ñuñoa', 15),
(83, 'Padre Hurtado', 15),
(84, 'Paine', 15),
(85, 'Pedro Aguirre Cerda', 15),
(86, 'Peñaflor', 15),
(87, 'Peñalolén', 15),
(88, 'Providencia', 15),
(89, 'Pudahuel', 15),
(90, 'Quilicura', 15),
(91, 'Quinta Normal', 15),
(92, 'San Bernardo', 15),
(93, 'San José de Maipo', 15),
(94, 'Santiago', 15),
(95, 'Talagante', 15),
(96, 'Tiltil', 15),
(97, 'Iquique', 16),
(98, 'Alto Hospicio', 16),
(99, 'Pica', 16),
(100, 'Camiña', 16),
(101, 'Valparaíso', 17),
(102, 'Viña del Mar', 17),
(103, 'San Antonio', 17),
(104, 'Quillota', 17),
(111, 'Quilpue', 17),
(112, 'Rosario', 14),
(113, 'San Miguel', 15),
(114, 'San Ramon', 15),
(115, 'San Joaquin', 15),
(116, 'Vitacura', 15),
(117, 'Renca', 15),
(118, 'Recoleta', 15);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cronograma_insumos`
--

CREATE TABLE `cronograma_insumos` (
  `id` int(11) NOT NULL,
  `cronograma_id` int(11) NOT NULL,
  `insumo_id` int(11) NOT NULL,
  `cantidad` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cronograma_mantencion`
--

CREATE TABLE `cronograma_mantencion` (
  `id` int(11) NOT NULL,
  `solicitud_ot_id` int(11) DEFAULT NULL,
  `activo_id` int(11) NOT NULL,
  `titulo` varchar(150) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `fecha_programada` date NOT NULL,
  `estado` enum('PENDIENTE','AVISADO','PROCESADO') DEFAULT 'PENDIENTE',
  `icono` varchar(50) DEFAULT 'bi-tools',
  `color` varchar(20) DEFAULT '#0d6efd',
  `creado_el` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `detalle_orden_compra`
--

CREATE TABLE `detalle_orden_compra` (
  `id` int(11) NOT NULL,
  `orden_compra_id` int(11) NOT NULL,
  `insumo_id` int(11) NOT NULL,
  `cantidad_solicitada` decimal(10,2) NOT NULL,
  `cantidad_recibida` decimal(10,2) DEFAULT 0.00,
  `precio_unitario` decimal(15,2) DEFAULT NULL,
  `total_linea` decimal(15,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `detalle_solicitud`
--

CREATE TABLE `detalle_solicitud` (
  `id` int(11) NOT NULL,
  `solicitud_id` int(11) NOT NULL,
  `insumo_id` int(11) NOT NULL,
  `cantidad` decimal(10,2) NOT NULL,
  `cantidad_entregada` decimal(10,2) DEFAULT 0.00,
  `estado_linea` varchar(20) DEFAULT 'PENDIENTE',
  `orden_compra_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `empleados`
--

CREATE TABLE `empleados` (
  `id` int(11) NOT NULL,
  `rut` varchar(20) NOT NULL,
  `nombre_completo` varchar(150) NOT NULL,
  `centro_costo_id` int(11) NOT NULL,
  `activo` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `estados_orden_compra`
--

CREATE TABLE `estados_orden_compra` (
  `id` int(11) NOT NULL,
  `nombre` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `estados_orden_compra`
--

INSERT INTO `estados_orden_compra` (`id`, `nombre`) VALUES
(5, 'Anulada'),
(1, 'Borrador'),
(2, 'Emitida'),
(3, 'Recepcion Parcial'),
(4, 'Recepcion Total');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `estados_solicitud`
--

CREATE TABLE `estados_solicitud` (
  `id` int(11) NOT NULL,
  `nombre` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `estados_solicitud`
--

INSERT INTO `estados_solicitud` (`id`, `nombre`) VALUES
(6, 'Anulada'),
(2, 'Aprobada'),
(5, 'Completada'),
(4, 'En Espera de Material'),
(1, 'Pendiente'),
(3, 'Rechazada');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `insumos`
--

CREATE TABLE `insumos` (
  `id` int(11) NOT NULL,
  `codigo_sku` varchar(50) DEFAULT NULL,
  `imagen_url` varchar(255) DEFAULT NULL,
  `nombre` varchar(150) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `categoria_id` int(11) DEFAULT NULL,
  `ubicacion_id` int(11) DEFAULT NULL,
  `stock_actual` decimal(10,2) DEFAULT 0.00,
  `stock_minimo` decimal(10,2) DEFAULT 5.00,
  `precio_costo` decimal(15,2) DEFAULT 0.00,
  `moneda` varchar(5) NOT NULL DEFAULT 'CLP',
  `unidad_medida` varchar(20) DEFAULT 'UN',
  `ubicacion_bodega` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `insumo_stock_ubicacion`
--

CREATE TABLE `insumo_stock_ubicacion` (
  `id` int(11) NOT NULL,
  `insumo_id` int(11) NOT NULL,
  `ubicacion_id` int(11) NOT NULL,
  `cantidad` decimal(10,2) NOT NULL DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `movimientos_inventario`
--

CREATE TABLE `movimientos_inventario` (
  `id` int(11) NOT NULL,
  `insumo_id` int(11) NOT NULL,
  `tipo_movimiento_id` int(11) NOT NULL,
  `cantidad` decimal(10,2) NOT NULL,
  `fecha` datetime DEFAULT current_timestamp(),
  `usuario_id` int(11) NOT NULL,
  `empleado_id` int(11) DEFAULT NULL,
  `referencia_id` int(11) DEFAULT NULL,
  `observacion` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `ordenes_compra`
--

CREATE TABLE `ordenes_compra` (
  `id` int(11) NOT NULL,
  `proveedor_id` int(11) NOT NULL,
  `usuario_creador_id` int(11) NOT NULL,
  `fecha_creacion` datetime DEFAULT current_timestamp(),
  `estado_id` int(11) NOT NULL,
  `moneda` varchar(10) DEFAULT 'CLP',
  `tipo_cambio` decimal(10,2) DEFAULT 1.00,
  `numero_cotizacion` varchar(50) DEFAULT NULL,
  `monto_neto` decimal(15,2) DEFAULT 0.00,
  `impuesto_porcentaje` decimal(5,2) DEFAULT 19.00,
  `impuesto` decimal(15,2) DEFAULT 0.00,
  `monto_total` decimal(15,2) DEFAULT 0.00,
  `url_archivo` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `paises`
--

CREATE TABLE `paises` (
  `id` int(11) NOT NULL,
  `nombre` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `paises`
--

INSERT INTO `paises` (`id`, `nombre`) VALUES
(1, 'Chile'),
(2, 'España'),
(3, 'Argentina'),
(4, 'Dinamarca'),
(5, 'México'),
(6, 'Estados Unidos'),
(7, 'Paraguay');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `proveedores`
--

CREATE TABLE `proveedores` (
  `id` int(11) NOT NULL,
  `rut` varchar(12) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `direccion` varchar(150) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `contacto_vendedor` varchar(100) DEFAULT NULL,
  `tipo_venta_id` int(11) DEFAULT NULL,
  `comuna_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `proveedor_docs`
--

CREATE TABLE `proveedor_docs` (
  `id` int(11) NOT NULL,
  `proveedor_id` int(11) NOT NULL,
  `nombre_archivo` varchar(255) NOT NULL,
  `ruta_archivo` varchar(255) NOT NULL,
  `tipo_documento` varchar(50) DEFAULT NULL,
  `fecha_subida` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `regiones`
--

CREATE TABLE `regiones` (
  `id` int(11) NOT NULL,
  `nombre` varchar(50) NOT NULL,
  `pais_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `regiones`
--

INSERT INTO `regiones` (`id`, `nombre`, `pais_id`) VALUES
(1, 'Antártica Chilena', 1),
(2, 'Antofagasta', 1),
(3, 'Araucanía', 1),
(4, 'Arica y Parinacota', 1),
(5, 'Aysén', 1),
(6, 'Atacama', 1),
(7, 'Biobío', 1),
(8, 'Coquimbo', 1),
(9, 'Los Lagos', 1),
(10, 'Los Ríos', 1),
(11, 'Magallanes', 1),
(12, 'Maule', 1),
(13, 'Ñuble', 1),
(14, 'OHiggins', 1),
(15, 'Region Metropolitana', 1),
(16, 'Tarapacá', 1),
(17, 'Valparaíso', 1),
(18, 'Andalucía', 2),
(19, 'Cataluña', 2),
(20, 'Madrid', 2),
(21, 'Valencia', 2),
(22, 'Buenos Aires', 3),
(23, 'CABA', 3),
(24, 'Mendoza', 3),
(25, 'Santa Fe', 3),
(26, 'Córdoba', 3),
(27, 'Hovedstaden', 4),
(28, 'Midtjylland', 4),
(29, 'Nordjylland', 4),
(30, 'Syddanmark', 4),
(31, 'Ciudad de México', 5),
(32, 'Jalisco', 5),
(33, 'Nuevo León', 5),
(34, 'Puebla', 5),
(35, 'California', 6),
(36, 'Texas', 6),
(37, 'Florida', 6),
(38, 'New York', 6),
(39, 'Asunción', 7),
(40, 'Central', 7),
(41, 'Alto Paraná', 7),
(42, 'Itapúa', 7);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `roles`
--

CREATE TABLE `roles` (
  `id` int(11) NOT NULL,
  `nombre` varchar(50) NOT NULL,
  `descripcion` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `roles`
--

INSERT INTO `roles` (`id`, `nombre`, `descripcion`) VALUES
(1, 'Admin', 'Acceso total al sistema'),
(2, 'Mantencion', 'Solicita insumos y gestiona activos'),
(3, 'Compras', 'Gestiona proveedores y órdenes de compra'),
(4, 'Bodega', 'Recepciona mercadería y controla inventario');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `sectores`
--

CREATE TABLE `sectores` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `codigo` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `sectores`
--

INSERT INTO `sectores` (`id`, `nombre`, `codigo`) VALUES
(1, 'Estantería A01', 'EST-A01'),
(2, 'Estantería B02', 'EST-B02'),
(3, 'Estantería 01B', 'EST-01B'),
(4, 'Estantería 02', 'EST-02'),
(5, 'Estantería 03', 'EST-03'),
(6, 'Estantería 04', 'EST-04'),
(7, 'Estantería 05', 'EST-05'),
(8, 'Estantería 06', 'EST-06'),
(9, 'Estantería 07', 'EST-07'),
(10, 'Estantería 08', 'EST-08'),
(11, 'Estantería 09', 'EST-09'),
(12, 'Estantería 10', 'EST-10'),
(13, 'Estantería 11', 'EST-11'),
(14, 'Estantería 12', 'EST-12'),
(15, 'Estantería 13', 'EST-13'),
(16, 'Áreas Generales', 'GRAL');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `sistema_logs`
--

CREATE TABLE `sistema_logs` (
  `id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `modulo` varchar(50) NOT NULL,
  `accion` varchar(255) NOT NULL,
  `detalle` text DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `fecha` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `solicitudes_ot`
--

CREATE TABLE `solicitudes_ot` (
  `id` int(11) NOT NULL,
  `usuario_solicitante_id` int(11) NOT NULL,
  `activo_id` int(11) DEFAULT NULL,
  `fecha_solicitud` datetime DEFAULT current_timestamp(),
  `fecha_requerida` date DEFAULT NULL,
  `estado_id` int(11) NOT NULL,
  `descripcion_trabajo` text DEFAULT NULL,
  `origen_tipo` varchar(50) DEFAULT 'Interna',
  `origen_referencia` varchar(50) DEFAULT NULL,
  `solicitante_externo` varchar(100) DEFAULT NULL,
  `fecha_solicitud_externa` date DEFAULT NULL,
  `area_negocio` varchar(100) DEFAULT NULL,
  `centro_costo_ot` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tipos_movimiento`
--

CREATE TABLE `tipos_movimiento` (
  `id` int(11) NOT NULL,
  `nombre` varchar(50) NOT NULL,
  `factor` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `tipos_movimiento`
--

INSERT INTO `tipos_movimiento` (`id`, `nombre`, `factor`) VALUES
(1, 'Ingreso por Compra', 1),
(2, 'Salida a Mantención', -1),
(3, 'Ajuste Inventario (+)', 1),
(4, 'Ajuste Inventario (-)', -1),
(5, 'Devolución', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tipos_venta`
--

CREATE TABLE `tipos_venta` (
  `id` int(11) NOT NULL,
  `descripcion` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `tipos_venta`
--

INSERT INTO `tipos_venta` (`id`, `descripcion`) VALUES
(1, 'Contado'),
(2, 'Crédito'),
(3, 'Efectivo'),
(4, 'Cheque'),
(5, 'Transferencia');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `ubicaciones`
--

CREATE TABLE `ubicaciones` (
  `id` int(11) NOT NULL,
  `sector_id` int(11) DEFAULT NULL,
  `codigo` varchar(50) DEFAULT NULL,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `ubicaciones`
--

INSERT INTO `ubicaciones` (`id`, `sector_id`, `codigo`, `nombre`, `descripcion`) VALUES
(1, 16, 'ALM-GRAL', 'General', NULL),
(2, 1, 'EST-A01-PISO-1', 'Piso 1', NULL),
(3, 2, 'EST-B02-PISO-2', 'Piso 2', NULL),
(8, 1, 'EST-A01-PISO-2', 'Piso 2', NULL),
(9, 1, 'EST-A01-PISO-3', 'Piso 3', NULL),
(10, 1, 'EST-A01-PISO-4', 'Piso 4', NULL),
(11, 1, 'EST-A01-PISO-5', 'Piso 5', NULL),
(12, 1, 'EST-A01-PISO-6', 'Piso 6', NULL),
(13, 3, 'EST-01B-PISO-4', 'Piso 4', NULL),
(14, 4, 'EST-02-PISO-1', 'Piso 1', NULL),
(15, 4, 'EST-02-PISO-2', 'Piso 2', NULL),
(16, 4, 'EST-02-PISO-3', 'Piso 3', NULL),
(17, 5, 'EST-03-PISO-0', 'Piso 0', NULL),
(18, 5, 'EST-03-PISO-1', 'Piso 1', NULL),
(19, 5, 'EST-03-PISO-2', 'Piso 2', NULL),
(20, 5, 'EST-03-PISO-3', 'Piso 3', NULL),
(21, 5, 'EST-03-PISO-5', 'Piso 5', NULL),
(22, 6, 'EST-04-PISO-1', 'Piso 1', NULL),
(23, 6, 'EST-04-PISO-3', 'Piso 3', NULL),
(24, 6, 'EST-04-PISO-4', 'Piso 4', NULL),
(25, 6, 'EST-04-PISO-5', 'Piso 5', NULL),
(26, 6, 'EST-04-PISO-6', 'Piso 6', NULL),
(27, 7, 'EST-05-PISO-1', 'Piso 1', NULL),
(28, 7, 'EST-05-PISO-2', 'Piso 2', NULL),
(29, 7, 'EST-05-PISO-3', 'Piso 3', NULL),
(30, 7, 'EST-05-PISO-4', 'Piso 4', NULL),
(31, 7, 'EST-05-PISO-5', 'Piso 5', NULL),
(32, 7, 'EST-05-PISO-6', 'Piso 6', NULL),
(33, 8, 'EST-06-PISO-1', 'Piso 1', NULL),
(34, 8, 'EST-06-PISO-2', 'Piso 2', NULL),
(35, 8, 'EST-06-PISO-3', 'Piso 3', NULL),
(36, 8, 'EST-06-PISO-4', 'Piso 4', NULL),
(37, 8, 'EST-06-PISO-5', 'Piso 5', NULL),
(38, 8, 'EST-06-PISO-6', 'Piso 6', NULL),
(39, 9, 'EST-07-PISO-1', 'Piso 1', NULL),
(40, 9, 'EST-07-PISO-2', 'Piso 2', NULL),
(41, 9, 'EST-07-PISO-3', 'Piso 3', NULL),
(42, 9, 'EST-07-PISO-4', 'Piso 4', NULL),
(43, 9, 'EST-07-PISO-5', 'Piso 5', NULL),
(44, 9, 'EST-07-PISO-6', 'Piso 6', NULL),
(45, 10, 'EST-08-PISO-1', 'Piso 1', NULL),
(46, 10, 'EST-08-PISO-2', 'Piso 2', NULL),
(47, 10, 'EST-08-PISO-3', 'Piso 3', NULL),
(48, 10, 'EST-08-PISO-4', 'Piso 4', NULL),
(49, 10, 'EST-08-PISO-5', 'Piso 5', NULL),
(50, 10, 'EST-08-PISO-6', 'Piso 6', NULL),
(51, 10, 'EST-08-PISO-7', 'Piso 7', NULL),
(52, 10, 'EST-08-PISO-8', 'Piso 8', NULL),
(53, 11, 'EST-09-PISO-1', 'Piso 1', NULL),
(54, 11, 'EST-09-PISO-2', 'Piso 2', NULL),
(55, 11, 'EST-09-PISO-3', 'Piso 3', NULL),
(56, 11, 'EST-09-PISO-4', 'Piso 4', NULL),
(57, 11, 'EST-09-PISO-5', 'Piso 5', NULL),
(58, 11, 'EST-09-PISO-6', 'Piso 6', NULL),
(59, 11, 'EST-09-PISO-7', 'Piso 7', NULL),
(60, 12, 'EST-10-PISO-1', 'Piso 1', NULL),
(61, 12, 'EST-10-PISO-2', 'Piso 2', NULL),
(62, 12, 'EST-10-PISO-3', 'Piso 3', NULL),
(63, 12, 'EST-10-PISO-4', 'Piso 4', NULL),
(64, 12, 'EST-10-PISO-5', 'Piso 5', NULL),
(65, 12, 'EST-10-PISO-6', 'Piso 6', NULL),
(66, 12, 'EST-10-PISO-7', 'Piso 7', NULL),
(67, 12, 'EST-10-PISO-8', 'Piso 8', NULL),
(68, 12, 'EST-10-PISO-9', 'Piso 9', NULL),
(69, 12, 'EST-10-PISO-10', 'Piso 10', NULL),
(70, 12, 'EST-10-PISO-11', 'Piso 11', NULL),
(71, 12, 'EST-10-PISO-12', 'Piso 12', NULL),
(72, 13, 'EST-11-PISO-1', 'Piso 1', NULL),
(73, 13, 'EST-11-PISO-2', 'Piso 2', NULL),
(74, 13, 'EST-11-PISO-3', 'Piso 3', NULL),
(75, 13, 'EST-11-PISO-4', 'Piso 4', NULL),
(76, 13, 'EST-11-PISO-5', 'Piso 5', NULL),
(77, 13, 'EST-11-PISO-6', 'Piso 6', NULL),
(78, 13, 'EST-11-PISO-7', 'Piso 7', NULL),
(79, 14, 'EST-12-PISO-1', 'Piso 1', NULL),
(80, 14, 'EST-12-PISO-2', 'Piso 2', NULL),
(81, 14, 'EST-12-PISO-3', 'Piso 3', NULL),
(82, 14, 'EST-12-PISO-4', 'Piso 4', NULL),
(83, 14, 'EST-12-PISO-5', 'Piso 5', NULL),
(84, 14, 'EST-12-PISO-6', 'Piso 6', NULL),
(85, 14, 'EST-12-PISO-7', 'Piso 7', NULL),
(86, 14, 'EST-12-PISO-8', 'Piso 8', NULL),
(87, 15, 'EST-13-PISO-2', 'Piso 2', NULL),
(88, 15, 'EST-13-PISO-3', 'Piso 3', NULL),
(89, 15, 'EST-13-PISO-4', 'Piso 4', NULL),
(90, 15, 'EST-13-PISO-5', 'Piso 5', NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL,
  `nombre` varchar(50) NOT NULL,
  `apellido` varchar(50) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `email` varchar(100) NOT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `rol_id` int(11) NOT NULL,
  `activo` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id`, `nombre`, `apellido`, `username`, `password_hash`, `email`, `telefono`, `rol_id`, `activo`) VALUES
(1, 'Nicolas', 'Salas', 'nsalas', '$2a$12$NLkp39h0OD0des7c12uhleid1Yts5xA9A99FtWel23h1vAOOf7LRa', 'nsalas@insuban.cl', '229458504', 1, 1),
(2, 'Carlos', 'Ruiz', 'cruiz', '$2y$10$7FejXKMZmUCaoCnv5j/JVe6Km.10IAk7MqkbkJNqLuI/HJ3XL6N2.', 'cruiz@insuban.cl', '', 3, 1),
(3, 'Froilan', 'Urdaneta', 'furdaneta', '$2y$10$Inw8dkuikBbcuhJgSo.0kO9aon.x/Tvk6L603QS1YC/YvWf0QES02', 'furdaneta@insuban.cl', '', 2, 1),
(4, 'Rafael', 'Morales', 'rmorales', '$2y$10$pILoFgFK1n5Yd179zUQQxOk2xpAUGF8KzkrJkjOXpnfy4TpH220ZW', 'rmorales@insuban.cl', '', 4, 1);

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `activos`
--
ALTER TABLE `activos`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `codigo_interno` (`codigo_interno`);

--
-- Indices de la tabla `activos_docs`
--
ALTER TABLE `activos_docs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `activo_id` (`activo_id`);

--
-- Indices de la tabla `activos_insumos`
--
ALTER TABLE `activos_insumos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `activo_id` (`activo_id`),
  ADD KEY `insumo_id` (`insumo_id`);

--
-- Indices de la tabla `areas_negocio`
--
ALTER TABLE `areas_negocio`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `codigo` (`codigo`);

--
-- Indices de la tabla `categorias_insumo`
--
ALTER TABLE `categorias_insumo`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_nombre` (`nombre`);

--
-- Indices de la tabla `centros_costo`
--
ALTER TABLE `centros_costo`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `codigo` (`codigo`),
  ADD KEY `area_negocio_id` (`area_negocio_id`);

--
-- Indices de la tabla `comunas`
--
ALTER TABLE `comunas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `region_id` (`region_id`);

--
-- Indices de la tabla `cronograma_insumos`
--
ALTER TABLE `cronograma_insumos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `cronograma_id` (`cronograma_id`),
  ADD KEY `insumo_id` (`insumo_id`);

--
-- Indices de la tabla `cronograma_mantencion`
--
ALTER TABLE `cronograma_mantencion`
  ADD PRIMARY KEY (`id`),
  ADD KEY `activo_id` (`activo_id`),
  ADD KEY `fk_crono_ot` (`solicitud_ot_id`);

--
-- Indices de la tabla `detalle_orden_compra`
--
ALTER TABLE `detalle_orden_compra`
  ADD PRIMARY KEY (`id`),
  ADD KEY `orden_compra_id` (`orden_compra_id`),
  ADD KEY `insumo_id` (`insumo_id`);

--
-- Indices de la tabla `detalle_solicitud`
--
ALTER TABLE `detalle_solicitud`
  ADD PRIMARY KEY (`id`),
  ADD KEY `solicitud_id` (`solicitud_id`),
  ADD KEY `insumo_id` (`insumo_id`),
  ADD KEY `orden_compra_id` (`orden_compra_id`);

--
-- Indices de la tabla `empleados`
--
ALTER TABLE `empleados`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `rut` (`rut`),
  ADD KEY `centro_costo_id` (`centro_costo_id`);

--
-- Indices de la tabla `estados_orden_compra`
--
ALTER TABLE `estados_orden_compra`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nombre` (`nombre`);

--
-- Indices de la tabla `estados_solicitud`
--
ALTER TABLE `estados_solicitud`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nombre` (`nombre`);

--
-- Indices de la tabla `insumos`
--
ALTER TABLE `insumos`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `codigo_sku` (`codigo_sku`),
  ADD KEY `categoria_id` (`categoria_id`),
  ADD KEY `fk_insumo_ubicacion` (`ubicacion_id`);

--
-- Indices de la tabla `insumo_stock_ubicacion`
--
ALTER TABLE `insumo_stock_ubicacion`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_insumo_ubicacion` (`insumo_id`,`ubicacion_id`),
  ADD KEY `ubicacion_id` (`ubicacion_id`);

--
-- Indices de la tabla `movimientos_inventario`
--
ALTER TABLE `movimientos_inventario`
  ADD PRIMARY KEY (`id`),
  ADD KEY `insumo_id` (`insumo_id`),
  ADD KEY `tipo_movimiento_id` (`tipo_movimiento_id`),
  ADD KEY `usuario_id` (`usuario_id`),
  ADD KEY `fk_movimiento_empleado` (`empleado_id`);

--
-- Indices de la tabla `ordenes_compra`
--
ALTER TABLE `ordenes_compra`
  ADD PRIMARY KEY (`id`),
  ADD KEY `proveedor_id` (`proveedor_id`),
  ADD KEY `usuario_creador_id` (`usuario_creador_id`),
  ADD KEY `estado_id` (`estado_id`);

--
-- Indices de la tabla `paises`
--
ALTER TABLE `paises`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `proveedores`
--
ALTER TABLE `proveedores`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `rut` (`rut`),
  ADD KEY `tipo_venta_id` (`tipo_venta_id`),
  ADD KEY `comuna_id` (`comuna_id`);

--
-- Indices de la tabla `proveedor_docs`
--
ALTER TABLE `proveedor_docs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `proveedor_id` (`proveedor_id`);

--
-- Indices de la tabla `regiones`
--
ALTER TABLE `regiones`
  ADD PRIMARY KEY (`id`),
  ADD KEY `pais_id` (`pais_id`);

--
-- Indices de la tabla `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nombre` (`nombre`);

--
-- Indices de la tabla `sectores`
--
ALTER TABLE `sectores`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nombre` (`nombre`);

--
-- Indices de la tabla `sistema_logs`
--
ALTER TABLE `sistema_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `usuario_id` (`usuario_id`);

--
-- Indices de la tabla `solicitudes_ot`
--
ALTER TABLE `solicitudes_ot`
  ADD PRIMARY KEY (`id`),
  ADD KEY `usuario_solicitante_id` (`usuario_solicitante_id`),
  ADD KEY `activo_id` (`activo_id`),
  ADD KEY `estado_id` (`estado_id`);

--
-- Indices de la tabla `tipos_movimiento`
--
ALTER TABLE `tipos_movimiento`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `tipos_venta`
--
ALTER TABLE `tipos_venta`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `ubicaciones`
--
ALTER TABLE `ubicaciones`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_ubicacion_sector` (`sector_id`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `rol_id` (`rol_id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `activos`
--
ALTER TABLE `activos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT de la tabla `activos_docs`
--
ALTER TABLE `activos_docs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `activos_insumos`
--
ALTER TABLE `activos_insumos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de la tabla `areas_negocio`
--
ALTER TABLE `areas_negocio`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT de la tabla `categorias_insumo`
--
ALTER TABLE `categorias_insumo`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=78;

--
-- AUTO_INCREMENT de la tabla `centros_costo`
--
ALTER TABLE `centros_costo`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=32;

--
-- AUTO_INCREMENT de la tabla `comunas`
--
ALTER TABLE `comunas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=119;

--
-- AUTO_INCREMENT de la tabla `cronograma_insumos`
--
ALTER TABLE `cronograma_insumos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT de la tabla `cronograma_mantencion`
--
ALTER TABLE `cronograma_mantencion`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `detalle_orden_compra`
--
ALTER TABLE `detalle_orden_compra`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=33;

--
-- AUTO_INCREMENT de la tabla `detalle_solicitud`
--
ALTER TABLE `detalle_solicitud`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=67;

--
-- AUTO_INCREMENT de la tabla `empleados`
--
ALTER TABLE `empleados`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `estados_orden_compra`
--
ALTER TABLE `estados_orden_compra`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `estados_solicitud`
--
ALTER TABLE `estados_solicitud`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `insumos`
--
ALTER TABLE `insumos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=546;

--
-- AUTO_INCREMENT de la tabla `insumo_stock_ubicacion`
--
ALTER TABLE `insumo_stock_ubicacion`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=556;

--
-- AUTO_INCREMENT de la tabla `movimientos_inventario`
--
ALTER TABLE `movimientos_inventario`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=99;

--
-- AUTO_INCREMENT de la tabla `ordenes_compra`
--
ALTER TABLE `ordenes_compra`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;

--
-- AUTO_INCREMENT de la tabla `paises`
--
ALTER TABLE `paises`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de la tabla `proveedores`
--
ALTER TABLE `proveedores`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=177;

--
-- AUTO_INCREMENT de la tabla `proveedor_docs`
--
ALTER TABLE `proveedor_docs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `regiones`
--
ALTER TABLE `regiones`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=43;

--
-- AUTO_INCREMENT de la tabla `roles`
--
ALTER TABLE `roles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `sectores`
--
ALTER TABLE `sectores`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT de la tabla `sistema_logs`
--
ALTER TABLE `sistema_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT de la tabla `solicitudes_ot`
--
ALTER TABLE `solicitudes_ot`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT de la tabla `tipos_movimiento`
--
ALTER TABLE `tipos_movimiento`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `tipos_venta`
--
ALTER TABLE `tipos_venta`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `ubicaciones`
--
ALTER TABLE `ubicaciones`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=281;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `activos_docs`
--
ALTER TABLE `activos_docs`
  ADD CONSTRAINT `activos_docs_ibfk_1` FOREIGN KEY (`activo_id`) REFERENCES `activos` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `activos_insumos`
--
ALTER TABLE `activos_insumos`
  ADD CONSTRAINT `activos_insumos_ibfk_1` FOREIGN KEY (`activo_id`) REFERENCES `activos` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `activos_insumos_ibfk_2` FOREIGN KEY (`insumo_id`) REFERENCES `insumos` (`id`);

--
-- Filtros para la tabla `centros_costo`
--
ALTER TABLE `centros_costo`
  ADD CONSTRAINT `centros_costo_ibfk_1` FOREIGN KEY (`area_negocio_id`) REFERENCES `areas_negocio` (`id`);

--
-- Filtros para la tabla `comunas`
--
ALTER TABLE `comunas`
  ADD CONSTRAINT `comunas_ibfk_1` FOREIGN KEY (`region_id`) REFERENCES `regiones` (`id`);

--
-- Filtros para la tabla `cronograma_insumos`
--
ALTER TABLE `cronograma_insumos`
  ADD CONSTRAINT `fk_crono_insumo` FOREIGN KEY (`cronograma_id`) REFERENCES `cronograma_mantencion` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_crono_item` FOREIGN KEY (`insumo_id`) REFERENCES `insumos` (`id`);

--
-- Filtros para la tabla `cronograma_mantencion`
--
ALTER TABLE `cronograma_mantencion`
  ADD CONSTRAINT `crono_activo_fk` FOREIGN KEY (`activo_id`) REFERENCES `activos` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_crono_ot` FOREIGN KEY (`solicitud_ot_id`) REFERENCES `solicitudes_ot` (`id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `detalle_orden_compra`
--
ALTER TABLE `detalle_orden_compra`
  ADD CONSTRAINT `detalle_orden_compra_ibfk_1` FOREIGN KEY (`orden_compra_id`) REFERENCES `ordenes_compra` (`id`),
  ADD CONSTRAINT `detalle_orden_compra_ibfk_2` FOREIGN KEY (`insumo_id`) REFERENCES `insumos` (`id`);

--
-- Filtros para la tabla `detalle_solicitud`
--
ALTER TABLE `detalle_solicitud`
  ADD CONSTRAINT `detalle_solicitud_ibfk_1` FOREIGN KEY (`solicitud_id`) REFERENCES `solicitudes_ot` (`id`),
  ADD CONSTRAINT `detalle_solicitud_ibfk_2` FOREIGN KEY (`insumo_id`) REFERENCES `insumos` (`id`),
  ADD CONSTRAINT `detalle_solicitud_ibfk_3` FOREIGN KEY (`orden_compra_id`) REFERENCES `ordenes_compra` (`id`);

--
-- Filtros para la tabla `empleados`
--
ALTER TABLE `empleados`
  ADD CONSTRAINT `empleados_ibfk_1` FOREIGN KEY (`centro_costo_id`) REFERENCES `centros_costo` (`id`);

--
-- Filtros para la tabla `insumos`
--
ALTER TABLE `insumos`
  ADD CONSTRAINT `fk_insumo_ubicacion` FOREIGN KEY (`ubicacion_id`) REFERENCES `ubicaciones` (`id`),
  ADD CONSTRAINT `insumos_ibfk_1` FOREIGN KEY (`categoria_id`) REFERENCES `categorias_insumo` (`id`);

--
-- Filtros para la tabla `insumo_stock_ubicacion`
--
ALTER TABLE `insumo_stock_ubicacion`
  ADD CONSTRAINT `insumo_stock_ubicacion_ibfk_1` FOREIGN KEY (`insumo_id`) REFERENCES `insumos` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `insumo_stock_ubicacion_ibfk_2` FOREIGN KEY (`ubicacion_id`) REFERENCES `ubicaciones` (`id`);

--
-- Filtros para la tabla `movimientos_inventario`
--
ALTER TABLE `movimientos_inventario`
  ADD CONSTRAINT `fk_movimiento_empleado` FOREIGN KEY (`empleado_id`) REFERENCES `empleados` (`id`),
  ADD CONSTRAINT `movimientos_inventario_ibfk_1` FOREIGN KEY (`insumo_id`) REFERENCES `insumos` (`id`),
  ADD CONSTRAINT `movimientos_inventario_ibfk_2` FOREIGN KEY (`tipo_movimiento_id`) REFERENCES `tipos_movimiento` (`id`),
  ADD CONSTRAINT `movimientos_inventario_ibfk_3` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`);

--
-- Filtros para la tabla `ordenes_compra`
--
ALTER TABLE `ordenes_compra`
  ADD CONSTRAINT `ordenes_compra_ibfk_1` FOREIGN KEY (`proveedor_id`) REFERENCES `proveedores` (`id`),
  ADD CONSTRAINT `ordenes_compra_ibfk_2` FOREIGN KEY (`usuario_creador_id`) REFERENCES `usuarios` (`id`),
  ADD CONSTRAINT `ordenes_compra_ibfk_3` FOREIGN KEY (`estado_id`) REFERENCES `estados_orden_compra` (`id`);

--
-- Filtros para la tabla `proveedores`
--
ALTER TABLE `proveedores`
  ADD CONSTRAINT `proveedores_ibfk_1` FOREIGN KEY (`tipo_venta_id`) REFERENCES `tipos_venta` (`id`),
  ADD CONSTRAINT `proveedores_ibfk_2` FOREIGN KEY (`comuna_id`) REFERENCES `comunas` (`id`);

--
-- Filtros para la tabla `proveedor_docs`
--
ALTER TABLE `proveedor_docs`
  ADD CONSTRAINT `proveedor_docs_ibfk_1` FOREIGN KEY (`proveedor_id`) REFERENCES `proveedores` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `regiones`
--
ALTER TABLE `regiones`
  ADD CONSTRAINT `regiones_ibfk_1` FOREIGN KEY (`pais_id`) REFERENCES `paises` (`id`);

--
-- Filtros para la tabla `sistema_logs`
--
ALTER TABLE `sistema_logs`
  ADD CONSTRAINT `sistema_logs_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`);

--
-- Filtros para la tabla `solicitudes_ot`
--
ALTER TABLE `solicitudes_ot`
  ADD CONSTRAINT `solicitudes_ot_ibfk_1` FOREIGN KEY (`usuario_solicitante_id`) REFERENCES `usuarios` (`id`),
  ADD CONSTRAINT `solicitudes_ot_ibfk_2` FOREIGN KEY (`activo_id`) REFERENCES `activos` (`id`),
  ADD CONSTRAINT `solicitudes_ot_ibfk_3` FOREIGN KEY (`estado_id`) REFERENCES `estados_solicitud` (`id`);

--
-- Filtros para la tabla `ubicaciones`
--
ALTER TABLE `ubicaciones`
  ADD CONSTRAINT `fk_ubicacion_sector` FOREIGN KEY (`sector_id`) REFERENCES `sectores` (`id`);

--
-- Filtros para la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD CONSTRAINT `usuarios_ibfk_1` FOREIGN KEY (`rol_id`) REFERENCES `roles` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
