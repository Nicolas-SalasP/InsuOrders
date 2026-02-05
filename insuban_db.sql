-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 21-01-2026 a las 21:00:22
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
  `codigo_maquina` varchar(50) DEFAULT NULL,
  `nombre` varchar(100) NOT NULL,
  `tipo` varchar(50) DEFAULT NULL,
  `marca` varchar(50) DEFAULT NULL,
  `modelo` varchar(50) DEFAULT NULL,
  `imagen_url` varchar(255) DEFAULT NULL,
  `anio` int(11) DEFAULT NULL,
  `numero_serie` varchar(100) DEFAULT NULL,
  `descripcion` text DEFAULT NULL,
  `ubicacion` varchar(100) DEFAULT NULL,
  `centro_costo_id` int(11) DEFAULT NULL,
  `estado_activo` enum('OPERATIVO','EN_MANTENCION','BAJA') DEFAULT 'OPERATIVO',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL,
  `plantilla_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`plantilla_json`)),
  `frecuencia_mantencion` int(11) DEFAULT NULL,
  `unidad_frecuencia` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `activos`
--

INSERT INTO `activos` (`id`, `codigo_interno`, `codigo_maquina`, `nombre`, `tipo`, `marca`, `modelo`, `imagen_url`, `anio`, `numero_serie`, `descripcion`, `ubicacion`, `centro_costo_id`, `estado_activo`, `created_at`, `updated_at`, `deleted_at`, `plantilla_json`, `frecuencia_mantencion`, `unidad_frecuencia`) VALUES
(1, '1028', '6988-2', 'Metradora', 'Maquinaria', 'Stridhs', 'DI-ME-804', NULL, 2002, '6988-2', '', 'Planta 1', 1, 'EN_MANTENCION', '2025-12-29 19:48:43', '2026-01-20 19:28:03', NULL, '{\"titulo\":\"REGISTRO DE MANTENCIÓN - METRADORA GARROTXA DI-ME-804\",\"codigo_doc\":\"R. SOP03\\/1 v0.2\",\"secciones\":[{\"titulo\":\"1. Pre-requisitos de Seguridad\",\"key\":\"seguridad\",\"tipo\":\"checklist_si_no\",\"items\":[{\"key\":\"permiso\",\"label\":\"Solicitud de permiso de trabajo con prevención\"},{\"key\":\"ats\",\"label\":\"Análisis de trabajo seguro (ATS)\"},{\"key\":\"capacitacion\",\"label\":\"Capacitación del procedimiento\"},{\"key\":\"epp\",\"label\":\"Inspección de EPP\"},{\"key\":\"loto\",\"label\":\"Bloqueo de energías (LOTO)\"},{\"key\":\"limpieza\",\"label\":\"Lavado y sanitización previa\"}]},{\"titulo\":\"2. Revisión Técnica (Estado)\",\"key\":\"revision_tecnica\",\"tipo\":\"estado_observacion\",\"items\":[{\"key\":\"banda_motriz\",\"label\":\"Revisión de banda motriz\"},{\"key\":\"resorte_freno\",\"label\":\"Revisión resorte sistema de freno\"},{\"key\":\"param_electricos\",\"label\":\"Revisión parámetros eléctricos\"},{\"key\":\"rodamientos\",\"label\":\"Condición de rodamientos\"},{\"key\":\"sensores\",\"label\":\"Funcionamiento de sensores\"},{\"key\":\"componentes_gral\",\"label\":\"Componentes eléctricos generales\"}]},{\"titulo\":\"3. Repuestos Críticos\",\"key\":\"repuestos\",\"tipo\":\"repuestos_validacion\",\"items\":[{\"key\":\"rod_607\",\"label\":\"Rodamiento SKF 607 2RSR C3\",\"sku\":\"990000071991090\",\"cant\":4},{\"key\":\"rod_685\",\"label\":\"Rodamiento SKF 685 2RS FKC\",\"sku\":\"990000071992162\",\"cant\":4},{\"key\":\"correa\",\"label\":\"Correa Rueda Estiradera\",\"sku\":\"990000071992495\",\"cant\":4},{\"key\":\"freno\",\"label\":\"Freno Magnético 24V\",\"sku\":\"990000071992500\",\"cant\":6},{\"key\":\"plc\",\"label\":\"PLC 805-160\",\"sku\":\"990000071992507\",\"cant\":1}]}]}', NULL, NULL),
(2, '1027', '9016-A', 'Metradora ', 'Maquinaria', 'Stridhs', 'DI-ME-804', NULL, 2011, '9016-A', '', 'Planta 1', NULL, 'EN_MANTENCION', '2026-01-12 11:22:34', '2026-01-12 15:47:20', NULL, NULL, NULL, NULL),
(3, '1029', '6988-1', 'Metradora', 'Maquinaria', 'Stridhs', 'DI-ME-804', NULL, 2002, '6988-1', '', 'Planta 1', NULL, 'OPERATIVO', '2026-01-12 11:30:24', '2026-01-12 15:47:27', NULL, NULL, NULL, NULL),
(4, '1030', '1102', 'Metradora', 'Maquinaria', 'Stridhs', 'STR805', NULL, 2021, '1102', '', 'Planta 1', NULL, 'EN_MANTENCION', '2026-01-12 11:33:27', '2026-01-12 15:47:34', NULL, NULL, NULL, NULL),
(5, 'TUBIN-01', '', 'Entubadora TSS1', 'Maquinaria', '', '', NULL, NULL, '', '', '', NULL, 'OPERATIVO', '2026-01-12 14:38:15', '2026-01-12 14:46:51', NULL, NULL, NULL, NULL),
(6, 'TUBIN-02', '', 'Entubadora TSS2', 'Maquinaria', '', '', NULL, NULL, '', '', '', NULL, 'OPERATIVO', '2026-01-12 14:38:34', '2026-01-12 14:47:02', NULL, NULL, NULL, NULL),
(7, 'TUBIN-03', '', 'Entubadora TSS3', 'Maquinaria', '', '', NULL, NULL, '', '', '', NULL, 'OPERATIVO', '2026-01-12 14:46:05', '2026-01-12 14:47:13', NULL, NULL, NULL, NULL),
(8, 'TUBIN-04', '', 'Entubadora TSS4', 'Maquinaria', '', '', NULL, NULL, '', '', '', NULL, 'OPERATIVO', '2026-01-12 14:46:19', '2026-01-12 14:47:26', NULL, NULL, NULL, NULL),
(9, 'TUBIN-05', '', 'Entubadora TSS5', '', '', '', NULL, NULL, '', '', '', NULL, 'OPERATIVO', '2026-01-12 14:46:43', '2026-01-12 14:46:43', NULL, NULL, NULL, NULL),
(10, 'TUBIN-06', '', 'Entubadora TSS6', 'Maquinaria', '', '', NULL, NULL, '', '', '', NULL, 'OPERATIVO', '2026-01-12 14:47:55', '2026-01-12 14:47:55', NULL, NULL, NULL, NULL),
(11, 'TUBIN-07', '', 'Entubadora TSS7', 'Maquinaria', '', '', NULL, NULL, '', '', '', NULL, 'OPERATIVO', '2026-01-12 14:48:26', '2026-01-12 14:48:32', NULL, NULL, NULL, NULL),
(12, 'TUBIN-08', '', 'Entubadora TSS8', 'Maquinaria', '', '', NULL, NULL, '', '', '', NULL, 'OPERATIVO', '2026-01-12 14:48:52', '2026-01-12 14:49:44', NULL, NULL, NULL, NULL),
(13, 'TUBIN-09', '', 'Entubadora TSS9', 'Maquinaria', '', '', NULL, NULL, '', '', '', NULL, 'OPERATIVO', '2026-01-12 14:49:14', '2026-01-12 14:49:52', NULL, NULL, NULL, NULL),
(14, 'TUBIN-10', '', 'Entubadora TSS10', 'Maquinaria', '', '', NULL, NULL, '', '', '', NULL, 'OPERATIVO', '2026-01-12 14:49:35', '2026-01-12 14:49:35', NULL, NULL, NULL, NULL),
(15, 'TUBIN-11', '', 'Entubadora TSS11', 'Maquinaria', '', '', NULL, NULL, '', '', '', NULL, 'OPERATIVO', '2026-01-12 14:52:10', '2026-01-12 14:52:10', NULL, NULL, NULL, NULL),
(16, 'TUBIN-12', '', 'Entubadora TSS12', 'Maquinaria', '', '', NULL, NULL, '', '', '', NULL, 'OPERATIVO', '2026-01-12 14:52:33', '2026-01-12 14:52:33', NULL, NULL, NULL, NULL),
(17, 'TUBIN-13', '', 'Entubadora TSS13', 'Maquinaria', '', '', NULL, NULL, '', '', '', NULL, 'OPERATIVO', '2026-01-12 14:52:52', '2026-01-12 14:52:52', NULL, NULL, NULL, NULL),
(18, 'TUBIN-14', '', 'Entubadora TSS14', 'Maquinaria', '', '', NULL, NULL, '', '', '', NULL, 'OPERATIVO', '2026-01-12 14:53:15', '2026-01-12 14:53:15', NULL, NULL, NULL, NULL),
(19, 'TUBIN-15', '', 'Entubadora TSS15', 'Maquinaria', '', '', NULL, NULL, '', '', '', NULL, 'OPERATIVO', '2026-01-12 14:53:30', '2026-01-12 14:53:30', NULL, NULL, NULL, NULL),
(20, 'TUBIN-16', '', 'Entubadora TSS16', 'Maquinaria', '', '', NULL, NULL, '', '', '', NULL, 'OPERATIVO', '2026-01-12 14:53:50', '2026-01-12 14:53:50', NULL, NULL, NULL, NULL),
(21, 'TUBIN-17', '', 'Entubadora TSS17', 'Maquinaria', '', '', NULL, NULL, '', '', '', NULL, 'OPERATIVO', '2026-01-12 14:54:07', '2026-01-12 14:54:07', NULL, NULL, NULL, NULL),
(22, 'TUBIN-18', '', 'Entubadora TSS18', 'Maquinaria', '', '', NULL, NULL, '', '', '', NULL, 'OPERATIVO', '2026-01-12 14:54:38', '2026-01-12 14:54:38', NULL, NULL, NULL, NULL),
(23, 'TUBIN-19', '', 'Entubadora TSS19', 'Maquinaria', '', '', NULL, NULL, '', '', '', NULL, 'OPERATIVO', '2026-01-12 15:06:24', '2026-01-12 15:06:24', NULL, NULL, NULL, NULL),
(24, 'TUBIN-20', '', 'Entubadora TSS20', 'Maquinaria', '', '', NULL, NULL, '', '', '', NULL, 'OPERATIVO', '2026-01-12 15:08:27', '2026-01-12 15:08:27', NULL, NULL, NULL, NULL),
(25, 'CMFR-01', '', 'LT-2', '', '', '', NULL, NULL, '', '', '', 20, 'OPERATIVO', '2026-01-12 15:10:06', '2026-01-12 16:51:37', NULL, NULL, NULL, NULL),
(26, 'CMFR-02', '', 'Mucosa', 'Maquinaria', '', '', NULL, NULL, '', '', '', 18, 'OPERATIVO', '2026-01-12 15:10:30', '2026-01-12 15:10:42', NULL, NULL, NULL, NULL),
(27, 'CMER-03', '', 'Centrifuga', 'Maquinaria', '', '', NULL, NULL, '', '', '', 20, 'OPERATIVO', '2026-01-12 15:11:02', '2026-01-12 17:07:21', NULL, NULL, NULL, NULL),
(28, 'MAQ-01', '', 'Extractor', 'Maquinaria', '', '', NULL, NULL, '', '', '', NULL, 'OPERATIVO', '2026-01-12 15:12:04', '2026-01-12 15:12:04', NULL, NULL, NULL, NULL),
(29, 'MAQ-02', '', 'Prensa neumática', 'Maquinaria', '', '', NULL, NULL, '', '', '', NULL, 'OPERATIVO', '2026-01-12 15:12:51', '2026-01-12 15:12:51', NULL, NULL, NULL, NULL),
(30, 'AUPS-01', 'AUPS-01-INS', 'ASmart UPS XL', 'Equipo', 'APC', 'Smart', '/uploads/activos/ACT_696e866d2b2a9.jpeg', 2020, '3r14213412341234', '', 'Bodega', 13, 'OPERATIVO', '2026-01-12 15:13:05', '2026-01-21 18:41:28', NULL, NULL, 4, 'MESES'),
(31, 'MAQ-04', '', 'Tanque de almacenamiento de salmuera', 'Maquinaria', '', '', NULL, NULL, '', '', '', NULL, 'OPERATIVO', '2026-01-12 15:13:25', '2026-01-12 15:13:25', NULL, NULL, NULL, NULL),
(32, 'MAQ-05', '', 'Bomba de salmuera dosificación', 'Maquinaria', '', '', NULL, NULL, '', '', '', NULL, 'OPERATIVO', '2026-01-12 15:13:50', '2026-01-12 15:13:50', NULL, NULL, NULL, NULL),
(33, 'MAQ-06', '', 'Tornillo sinfín ', 'Maquinaria', '', '', NULL, NULL, '', '', '', NULL, 'OPERATIVO', '2026-01-12 15:16:33', '2026-01-12 15:16:33', NULL, NULL, NULL, NULL),
(34, 'KIT-01', '', 'Auditoría', 'Infraestructura', '', '', NULL, NULL, '', 'Kit de distintos insumos para auditoria', '', 25, 'OPERATIVO', '2026-01-12 15:17:42', '2026-01-12 15:44:17', NULL, NULL, NULL, NULL);

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

--
-- Volcado de datos para la tabla `activos_docs`
--

INSERT INTO `activos_docs` (`id`, `activo_id`, `nombre_archivo`, `url_archivo`, `fecha_subida`) VALUES
(1, 1, 'Logo Atlas2.png', '/uploads/activos/DOC_1_695da9b60cddf.png', '2026-01-06 21:32:54'),
(3, 34, 'DOC_1_6966559a5461d.pdf', '/uploads/activos/DOC_34_696f9868951bd.pdf', '2026-01-20 11:59:52');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `activos_imagenes`
--

CREATE TABLE `activos_imagenes` (
  `id` int(11) NOT NULL,
  `activo_id` int(11) NOT NULL,
  `imagen_url` varchar(255) NOT NULL,
  `tipo` varchar(50) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `activos_imagenes`
--

INSERT INTO `activos_imagenes` (`id`, `activo_id`, `imagen_url`, `tipo`, `created_at`) VALUES
(1, 30, '/uploads/activos/galeria/ACT_696e83787fa91.jpeg', 'Atrás', '2026-01-19 19:18:16'),
(2, 30, '/uploads/activos/galeria/ACT_696e83787ffe2.jpeg', 'Frente', '2026-01-19 19:18:16');

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

--
-- Volcado de datos para la tabla `activos_insumos`
--

INSERT INTO `activos_insumos` (`id`, `activo_id`, `insumo_id`, `cantidad_default`) VALUES
(5, 1, 89, 4.00),
(6, 1, 1118, 4.00),
(7, 1, 1452, 1.00),
(8, 1, 1453, 1.00),
(9, 1, 1454, 1.00),
(10, 1, 1455, 1.00),
(11, 1, 1456, 1.00),
(12, 1, 1457, 1.00),
(13, 1, 1458, 1.00),
(14, 1, 1459, 1.00),
(15, 1, 1460, 1.00),
(16, 1, 1461, 1.00),
(17, 1, 1462, 1.00),
(18, 1, 1463, 1.00),
(19, 1, 1464, 1.00),
(20, 1, 1465, 1.00),
(21, 1, 1466, 1.00),
(22, 1, 1467, 1.00),
(23, 1, 1468, 1.00),
(24, 1, 1469, 1.00),
(25, 1, 1470, 1.00),
(26, 1, 1471, 1.00),
(27, 1, 1472, 1.00),
(28, 3, 89, 4.00),
(30, 3, 1120, 4.00),
(31, 3, 1452, 1.00),
(32, 3, 1453, 1.00),
(33, 3, 1454, 1.00),
(34, 3, 1455, 1.00),
(35, 3, 1456, 1.00),
(36, 3, 1457, 1.00),
(37, 3, 1458, 1.00),
(38, 3, 1459, 1.00),
(39, 3, 1460, 1.00),
(40, 3, 1461, 1.00),
(41, 3, 1462, 1.00),
(42, 3, 1463, 1.00),
(43, 3, 1464, 1.00),
(44, 3, 1465, 1.00),
(45, 3, 1466, 1.00),
(46, 3, 1467, 1.00),
(47, 3, 1468, 1.00),
(48, 3, 1469, 1.00),
(49, 3, 1470, 1.00),
(50, 3, 1471, 1.00),
(51, 3, 1472, 1.00),
(52, 2, 89, 4.00),
(53, 2, 1120, 4.00),
(54, 2, 1452, 1.00),
(55, 2, 1453, 1.00),
(56, 2, 1454, 1.00),
(57, 2, 1455, 1.00),
(58, 2, 1456, 1.00),
(59, 2, 1457, 1.00),
(60, 2, 1458, 1.00),
(61, 2, 1459, 1.00),
(62, 2, 1460, 1.00),
(63, 2, 1461, 1.00),
(64, 2, 1462, 1.00),
(65, 2, 1463, 1.00),
(66, 2, 1464, 1.00),
(67, 2, 1465, 1.00),
(68, 2, 1466, 1.00),
(69, 2, 1467, 1.00),
(70, 2, 1468, 1.00),
(71, 2, 1469, 1.00),
(72, 2, 1470, 1.00),
(73, 2, 1471, 1.00),
(74, 2, 1472, 1.00),
(75, 4, 89, 4.00),
(76, 4, 1120, 4.00),
(77, 4, 1452, 1.00),
(78, 4, 1453, 1.00),
(79, 4, 1454, 1.00),
(80, 4, 1455, 1.00),
(81, 4, 1456, 1.00),
(82, 4, 1457, 1.00),
(83, 4, 1458, 1.00),
(84, 4, 1459, 1.00),
(85, 4, 1460, 1.00),
(86, 4, 1461, 1.00),
(87, 4, 1462, 1.00),
(88, 4, 1463, 1.00),
(89, 4, 1464, 1.00),
(90, 4, 1465, 1.00),
(91, 4, 1466, 1.00),
(92, 4, 1467, 1.00),
(93, 4, 1468, 1.00),
(94, 4, 1469, 1.00),
(95, 4, 1470, 1.00),
(96, 4, 1471, 1.00),
(97, 4, 1472, 1.00),
(98, 34, 380, 12.00),
(99, 34, 1419, 7.00),
(100, 34, 1053, 7.00),
(101, 34, 202, 24.00),
(102, 34, 1421, 12.00),
(103, 34, 225, 3.00),
(104, 34, 1422, 1.00),
(105, 34, 1117, 6.00),
(106, 34, 1198, 10.00),
(107, 34, 228, 10.00),
(108, 34, 1197, 10.00),
(109, 28, 1280, 2.00),
(110, 28, 1281, 2.00),
(111, 29, 966, 8.00),
(112, 29, 71, 1.00),
(113, 29, 1358, 1.00),
(114, 29, 1357, 8.00),
(115, 29, 767, 2.00),
(116, 29, 790, 1.00),
(117, 30, 1294, 1.00),
(118, 30, 1295, 1.00),
(119, 30, 1431, 1.00),
(120, 33, 700, 2.00),
(121, 33, 1221, 1.00),
(122, 25, 115, 2.00),
(123, 25, 160, 4.00),
(124, 25, 817, 4.00),
(125, 25, 127, 2.00),
(126, 25, 696, 2.00),
(127, 27, 1555, 2.00),
(128, 27, 1556, 2.00),
(129, 27, 1557, 2.00),
(130, 27, 1558, 2.00),
(131, 27, 1559, 1.00),
(132, 27, 1560, 2.00),
(133, 27, 1561, 1.00),
(134, 27, 1562, 1.00);

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
  `alias` varchar(50) DEFAULT NULL,
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
-- Estructura de tabla para la tabla `cotizaciones`
--

CREATE TABLE `cotizaciones` (
  `id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `fecha_creacion` datetime DEFAULT current_timestamp(),
  `estado_id` int(11) NOT NULL DEFAULT 1,
  `observacion` text DEFAULT NULL,
  `total_estimado` decimal(10,2) DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `cotizaciones`
--

INSERT INTO `cotizaciones` (`id`, `usuario_id`, `fecha_creacion`, `estado_id`, `observacion`, `total_estimado`) VALUES
(1, 3, '2026-01-13 10:17:34', 1, '', 0.00),
(2, 1, '2026-01-14 17:00:58', 1, '', 0.00);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cronograma_insumos`
--

CREATE TABLE `cronograma_insumos` (
  `id` int(11) NOT NULL,
  `cronograma_id` int(11) NOT NULL,
  `insumo_id` int(11) NOT NULL,
  `cantidad` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `cronograma_insumos`
--

INSERT INTO `cronograma_insumos` (`id`, `cronograma_id`, `insumo_id`, `cantidad`) VALUES
(42, 7, 89, 4.00),
(43, 7, 1120, 4.00),
(44, 7, 1452, 1.00),
(45, 7, 1453, 1.00),
(46, 7, 1454, 1.00),
(47, 7, 1455, 1.00),
(48, 7, 1456, 1.00),
(49, 7, 1457, 1.00),
(50, 7, 1458, 1.00),
(51, 7, 1459, 1.00),
(52, 7, 1460, 1.00),
(53, 7, 1461, 1.00),
(54, 7, 1462, 1.00),
(55, 7, 1463, 1.00),
(56, 7, 1464, 1.00),
(57, 7, 1465, 1.00),
(58, 7, 1466, 1.00),
(59, 7, 1467, 1.00),
(60, 7, 1468, 1.00),
(61, 7, 1469, 1.00),
(62, 7, 1470, 1.00),
(63, 7, 1471, 1.00),
(64, 7, 1472, 1.00),
(295, 10, 89, 4.00),
(296, 10, 1120, 4.00),
(297, 10, 1452, 1.00),
(298, 10, 1453, 1.00),
(299, 10, 1454, 1.00),
(300, 10, 1455, 1.00),
(301, 10, 1456, 1.00),
(302, 10, 1457, 1.00),
(303, 10, 1458, 1.00),
(304, 10, 1459, 1.00),
(305, 10, 1460, 1.00),
(306, 10, 1461, 1.00),
(307, 10, 1462, 1.00),
(308, 10, 1463, 1.00),
(309, 10, 1464, 1.00),
(310, 10, 1465, 1.00),
(311, 10, 1466, 1.00),
(312, 10, 1467, 1.00),
(313, 10, 1468, 1.00),
(314, 10, 1469, 1.00),
(315, 10, 1470, 1.00),
(316, 10, 1471, 1.00),
(317, 10, 1472, 1.00),
(318, 11, 1280, 2.00),
(319, 11, 1281, 2.00),
(326, 13, 1294, 1.00),
(327, 13, 1295, 1.00),
(328, 13, 1431, 1.00),
(340, 9, 89, 4.00),
(341, 9, 1120, 4.00),
(342, 9, 1452, 1.00),
(343, 9, 1453, 1.00),
(344, 9, 1454, 1.00),
(345, 9, 1455, 1.00),
(346, 9, 1456, 1.00),
(347, 9, 1457, 1.00),
(348, 9, 1458, 1.00),
(349, 9, 1459, 1.00),
(350, 9, 1460, 1.00),
(351, 9, 1461, 1.00),
(352, 9, 1462, 1.00),
(353, 9, 1463, 1.00),
(354, 9, 1464, 1.00),
(355, 9, 1465, 1.00),
(356, 9, 1466, 1.00),
(357, 9, 1467, 1.00),
(358, 9, 1468, 1.00),
(359, 9, 1469, 1.00),
(360, 9, 1470, 1.00),
(361, 9, 1471, 1.00),
(362, 9, 1472, 1.00),
(441, 16, 202, 24.00),
(442, 16, 225, 3.00),
(443, 16, 228, 10.00),
(444, 16, 380, 12.00),
(445, 16, 1053, 7.00),
(446, 16, 1117, 6.00),
(447, 16, 1197, 10.00),
(448, 16, 1198, 10.00),
(449, 16, 1419, 7.00),
(450, 16, 1421, 12.00),
(451, 16, 1422, 1.00),
(452, 8, 89, 4.00),
(453, 8, 1452, 1.00),
(454, 8, 1453, 1.00),
(455, 8, 1454, 1.00),
(456, 8, 1455, 1.00),
(457, 8, 1456, 1.00),
(458, 8, 1457, 1.00),
(459, 8, 1458, 1.00),
(460, 8, 1459, 1.00),
(461, 8, 1460, 1.00),
(462, 8, 1461, 1.00),
(463, 8, 1462, 1.00),
(464, 8, 1463, 1.00),
(465, 8, 1464, 1.00),
(466, 8, 1465, 1.00),
(467, 8, 1466, 1.00),
(468, 8, 1467, 1.00),
(469, 8, 1468, 1.00),
(470, 8, 1469, 1.00),
(471, 8, 1470, 1.00),
(472, 8, 1471, 1.00),
(473, 8, 1472, 1.00),
(474, 8, 1120, 4.00),
(475, 17, 1294, 1.00),
(476, 17, 1295, 1.00),
(477, 17, 1431, 1.00),
(478, 18, 1294, 1.00),
(479, 18, 1295, 1.00),
(480, 18, 1431, 1.00),
(481, 19, 1294, 1.00),
(482, 19, 1295, 1.00),
(483, 19, 1431, 1.00),
(484, 20, 1294, 1.00),
(485, 20, 1295, 1.00),
(486, 20, 1431, 1.00),
(487, 21, 1294, 1.00),
(488, 21, 1295, 1.00),
(489, 21, 1431, 1.00),
(490, 22, 1294, 1.00),
(491, 22, 1295, 1.00),
(492, 22, 1431, 1.00),
(493, 23, 1294, 1.00),
(494, 23, 1295, 1.00),
(495, 23, 1431, 1.00),
(496, 24, 1294, 1.00),
(497, 24, 1295, 1.00),
(498, 24, 1431, 1.00);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cronograma_mantencion`
--

CREATE TABLE `cronograma_mantencion` (
  `id` int(11) NOT NULL,
  `tipo_evento` enum('MANTENCION','COMPRA','INSPECCION') DEFAULT 'MANTENCION',
  `titulo` varchar(150) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `fecha_programada` date NOT NULL,
  `hora_programada` time DEFAULT NULL,
  `estado` enum('PENDIENTE','EN_PROCESO','COMPLETADO','CANCELADO') DEFAULT 'PENDIENTE',
  `solicitud_ot_id` int(11) DEFAULT NULL,
  `activo_id` int(11) DEFAULT NULL,
  `insumo_id` int(11) DEFAULT NULL,
  `cantidad` decimal(10,2) DEFAULT NULL,
  `monto_estimado` int(11) DEFAULT NULL,
  `icono` varchar(50) DEFAULT 'bi-tools',
  `color` varchar(20) DEFAULT '#0d6efd',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `cronograma_mantencion`
--

INSERT INTO `cronograma_mantencion` (`id`, `tipo_evento`, `titulo`, `descripcion`, `fecha_programada`, `hora_programada`, `estado`, `solicitud_ot_id`, `activo_id`, `insumo_id`, `cantidad`, `monto_estimado`, `icono`, `color`, `created_at`, `updated_at`) VALUES
(7, 'MANTENCION', 'Mantenimiento preventivo', '', '2026-01-12', NULL, '', 19, 3, NULL, NULL, NULL, 'bi-tools', '#eebb2f', '2026-01-12 12:07:33', '2026-01-12 12:07:33'),
(8, 'MANTENCION', 'Mantenimiento preventivo OT 1671', 'Mantenimiento preventivo OT 1671', '2026-01-14', NULL, NULL, 20, 1, NULL, NULL, NULL, 'bi-tools', '#4F6815', '2026-01-12 12:14:26', '2026-01-12 19:57:46'),
(9, 'MANTENCION', 'Mantenimiento preventivo OT 1673', 'Mantenimiento preventivo OT 1673', '2026-01-20', NULL, NULL, 21, 2, NULL, NULL, NULL, 'bi-tools', '#4F6815', '2026-01-12 14:19:32', '2026-01-12 19:57:26'),
(10, 'MANTENCION', 'Mantenimiento preventivo OT 1703', '', '2026-01-16', NULL, NULL, 22, 4, NULL, NULL, NULL, 'bi-tools', '#4F6815', '2026-01-12 14:25:25', '2026-01-12 17:11:35'),
(11, 'MANTENCION', 'Mantenimiento preventivo', '', '2026-02-02', NULL, '', 23, 28, NULL, NULL, NULL, 'bi-tools', '#4F6815', '2026-01-12 18:30:45', '2026-01-12 18:30:45'),
(13, 'MANTENCION', 'Mantenimiento preventivo ', '', '2026-02-10', NULL, '', 25, 30, NULL, NULL, NULL, 'bi-tools', '#4F6815', '2026-01-12 18:33:27', '2026-01-12 18:33:27'),
(14, 'MANTENCION', 'Mantenimiento preventivo', 'Mantenimiento preventivo', '2026-02-12', NULL, '', 26, 31, NULL, NULL, NULL, 'bi-tools', '#4F6815', '2026-01-12 18:34:12', '2026-01-12 19:56:49'),
(16, 'COMPRA', 'Auditoría Perú', 'Auditoría Perú', '2026-01-22', NULL, NULL, 29, 34, NULL, NULL, NULL, 'bi-tools', '#e89191', '2026-01-12 20:03:50', '2026-01-12 20:08:56'),
(17, 'MANTENCION', 'Mantencion preventivo', '', '2026-01-30', NULL, '', 33, 30, NULL, NULL, NULL, 'bi-tools', '#0d6efd', '2026-01-21 18:41:46', '2026-01-21 18:41:46'),
(18, 'MANTENCION', 'Mantencion preventivo', '', '2026-05-30', NULL, '', 34, 30, NULL, NULL, NULL, 'bi-tools', '#0d6efd', '2026-01-21 18:41:47', '2026-01-21 18:41:47'),
(19, 'MANTENCION', 'Mantencion', '', '2026-02-10', NULL, '', 35, 30, NULL, NULL, NULL, 'bi-cart-fill', '#0d6efd', '2026-01-21 18:42:38', '2026-01-21 18:42:38'),
(20, 'MANTENCION', 'Mantencion', '', '2026-06-10', NULL, '', 36, 30, NULL, NULL, NULL, 'bi-cart-fill', '#0d6efd', '2026-01-21 18:42:38', '2026-01-21 18:42:38'),
(21, 'MANTENCION', 'Mantencion General', '', '2026-02-11', NULL, '', 37, 30, NULL, NULL, NULL, 'bi-tools', '#3c905c', '2026-01-21 18:52:38', '2026-01-21 18:52:38'),
(22, 'MANTENCION', 'Mantencion General', '', '2026-06-11', NULL, '', 38, 30, NULL, NULL, NULL, 'bi-tools', '#3c905c', '2026-01-21 18:52:38', '2026-01-21 18:52:38'),
(23, 'MANTENCION', 'Mantencion General', '', '2026-10-11', NULL, '', 39, 30, NULL, NULL, NULL, 'bi-tools', '#3c905c', '2026-01-21 18:52:38', '2026-01-21 18:52:38'),
(24, 'MANTENCION', 'Mantencion General', '', '2027-02-11', NULL, '', 40, 30, NULL, NULL, NULL, 'bi-tools', '#3c905c', '2026-01-21 18:52:38', '2026-01-21 18:52:38');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `detalle_cotizacion`
--

CREATE TABLE `detalle_cotizacion` (
  `id` int(11) NOT NULL,
  `cotizacion_id` int(11) NOT NULL,
  `insumo_id` int(11) DEFAULT NULL COMMENT 'Null si es producto nuevo',
  `nombre_item` varchar(150) NOT NULL COMMENT 'Nombre del insumo o texto libre',
  `cantidad` decimal(10,2) NOT NULL,
  `precio_unitario` decimal(10,2) DEFAULT 0.00,
  `total_linea` decimal(10,2) GENERATED ALWAYS AS (`cantidad` * `precio_unitario`) STORED
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `detalle_cotizacion`
--

INSERT INTO `detalle_cotizacion` (`id`, `cotizacion_id`, `insumo_id`, `nombre_item`, `cantidad`, `precio_unitario`) VALUES
(1, 1, 39, 'RODAMIENTO 1205.C3', 5.00, NULL),
(2, 2, 1106, '(DELFIN COATINGS) BLANCO - POLIURETANO INDUSTRIAL DCI-500 IU500T9100B15', 10.00, NULL);

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

--
-- Volcado de datos para la tabla `detalle_orden_compra`
--

INSERT INTO `detalle_orden_compra` (`id`, `orden_compra_id`, `insumo_id`, `cantidad_solicitada`, `cantidad_recibida`, `precio_unitario`, `total_linea`) VALUES
(11, 11, 384, 3.00, 3.00, 17497.00, 52491.00),
(12, 11, 545, 20.00, 10.00, 3720.00, 74400.00),
(13, 240000, 380, 8.00, 8.00, 100.00, 800.00),
(14, 240000, 1197, 1.00, 0.00, 2000.00, 2000.00),
(15, 240000, 1294, 1.00, 0.00, 600.00, 600.00),
(16, 240000, 1295, 1.00, 0.00, 80000.00, 80000.00),
(17, 240000, 1419, 2.00, 0.00, 56000.00, 112000.00),
(18, 240001, 1026, 1.00, 0.00, 60000.00, 60000.00);

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
  `estado_linea` enum('PENDIENTE','APROBADO','RECHAZADO','REQUIERE_COMPRA','EN_BODEGA','COMPRADO','RESERVADO','ENTREGADO','PARCIAL','CANCELADO','ANULADO') DEFAULT 'PENDIENTE',
  `orden_compra_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `detalle_solicitud`
--

INSERT INTO `detalle_solicitud` (`id`, `solicitud_id`, `insumo_id`, `cantidad`, `cantidad_entregada`, `estado_linea`, `orden_compra_id`) VALUES
(22, 18, 89, 4.00, 0.00, 'ANULADO', NULL),
(23, 18, 1118, 4.00, 0.00, 'ANULADO', NULL),
(24, 18, 1452, 1.00, 0.00, 'ANULADO', NULL),
(25, 18, 1453, 1.00, 0.00, 'ANULADO', NULL),
(26, 18, 1454, 1.00, 0.00, 'ANULADO', NULL),
(27, 18, 1455, 1.00, 0.00, 'ANULADO', NULL),
(28, 18, 1456, 1.00, 0.00, 'ANULADO', NULL),
(29, 18, 1457, 1.00, 0.00, 'ANULADO', NULL),
(30, 18, 1458, 1.00, 0.00, 'ANULADO', NULL),
(31, 18, 1459, 1.00, 0.00, 'ANULADO', NULL),
(32, 18, 1460, 1.00, 0.00, 'ANULADO', NULL),
(33, 18, 1461, 1.00, 0.00, 'ANULADO', NULL),
(34, 18, 1462, 1.00, 0.00, 'ANULADO', NULL),
(35, 18, 1463, 1.00, 0.00, 'ANULADO', NULL),
(36, 18, 1464, 1.00, 0.00, 'ANULADO', NULL),
(37, 18, 1465, 1.00, 0.00, 'ANULADO', NULL),
(38, 18, 1466, 1.00, 0.00, 'ANULADO', NULL),
(39, 18, 1467, 1.00, 0.00, 'ANULADO', NULL),
(40, 18, 1468, 1.00, 0.00, 'ANULADO', NULL),
(41, 18, 1469, 1.00, 0.00, 'ANULADO', NULL),
(42, 18, 1470, 1.00, 0.00, 'ANULADO', NULL),
(43, 18, 1471, 1.00, 0.00, 'ANULADO', NULL),
(44, 18, 1472, 1.00, 0.00, 'ANULADO', NULL),
(45, 19, 89, 4.00, 0.00, 'CANCELADO', NULL),
(46, 19, 1120, 4.00, 0.00, 'CANCELADO', NULL),
(47, 19, 1452, 1.00, 0.00, 'CANCELADO', NULL),
(48, 19, 1453, 1.00, 0.00, 'CANCELADO', NULL),
(49, 19, 1454, 1.00, 0.00, 'CANCELADO', NULL),
(50, 19, 1455, 1.00, 0.00, 'CANCELADO', NULL),
(51, 19, 1456, 1.00, 0.00, 'CANCELADO', NULL),
(52, 19, 1457, 1.00, 0.00, 'CANCELADO', NULL),
(53, 19, 1458, 1.00, 0.00, 'CANCELADO', NULL),
(54, 19, 1459, 1.00, 0.00, 'CANCELADO', NULL),
(55, 19, 1460, 1.00, 0.00, 'CANCELADO', NULL),
(56, 19, 1461, 1.00, 0.00, 'CANCELADO', NULL),
(57, 19, 1462, 1.00, 0.00, 'CANCELADO', NULL),
(58, 19, 1463, 1.00, 0.00, 'CANCELADO', NULL),
(59, 19, 1464, 1.00, 0.00, 'CANCELADO', NULL),
(60, 19, 1465, 1.00, 0.00, 'CANCELADO', NULL),
(61, 19, 1466, 1.00, 0.00, 'CANCELADO', NULL),
(62, 19, 1467, 1.00, 0.00, 'CANCELADO', NULL),
(63, 19, 1468, 1.00, 0.00, 'CANCELADO', NULL),
(64, 19, 1469, 1.00, 0.00, 'CANCELADO', NULL),
(65, 19, 1470, 1.00, 0.00, 'CANCELADO', NULL),
(66, 19, 1471, 1.00, 0.00, 'CANCELADO', NULL),
(67, 19, 1472, 1.00, 0.00, 'CANCELADO', NULL),
(68, 20, 89, 4.00, 4.00, 'PENDIENTE', NULL),
(70, 20, 1452, 1.00, 0.00, 'PENDIENTE', NULL),
(71, 20, 1453, 1.00, 0.00, 'PENDIENTE', NULL),
(72, 20, 1454, 1.00, 0.00, 'PENDIENTE', NULL),
(73, 20, 1455, 1.00, 1.00, 'PENDIENTE', NULL),
(74, 20, 1456, 1.00, 0.00, 'PENDIENTE', NULL),
(75, 20, 1457, 1.00, 0.00, 'PENDIENTE', NULL),
(76, 20, 1458, 1.00, 0.00, 'PENDIENTE', NULL),
(77, 20, 1459, 1.00, 1.00, 'PENDIENTE', NULL),
(78, 20, 1460, 1.00, 1.00, 'PENDIENTE', NULL),
(79, 20, 1461, 1.00, 0.00, 'PENDIENTE', NULL),
(80, 20, 1462, 1.00, 0.00, 'PENDIENTE', NULL),
(81, 20, 1463, 1.00, 0.00, 'PENDIENTE', NULL),
(82, 20, 1464, 1.00, 1.00, 'REQUIERE_COMPRA', NULL),
(83, 20, 1465, 1.00, 0.00, 'PENDIENTE', NULL),
(84, 20, 1466, 1.00, 0.00, 'PENDIENTE', NULL),
(85, 20, 1467, 1.00, 0.00, 'PENDIENTE', NULL),
(86, 20, 1468, 1.00, 0.00, 'PENDIENTE', NULL),
(87, 20, 1469, 1.00, 0.00, 'PENDIENTE', NULL),
(88, 20, 1470, 1.00, 0.00, 'PENDIENTE', NULL),
(89, 20, 1471, 1.00, 0.00, 'PENDIENTE', NULL),
(90, 20, 1472, 1.00, 0.00, 'PENDIENTE', NULL),
(91, 20, 1120, 4.00, 4.00, 'ENTREGADO', NULL),
(92, 21, 89, 4.00, 0.00, 'PENDIENTE', NULL),
(93, 21, 1120, 4.00, 0.00, 'PENDIENTE', NULL),
(94, 21, 1452, 1.00, 0.00, 'PENDIENTE', NULL),
(95, 21, 1453, 1.00, 0.00, 'PENDIENTE', NULL),
(96, 21, 1454, 1.00, 0.00, 'PENDIENTE', NULL),
(97, 21, 1455, 1.00, 0.00, 'PENDIENTE', NULL),
(98, 21, 1456, 1.00, 0.00, 'PENDIENTE', NULL),
(99, 21, 1457, 1.00, 0.00, 'PENDIENTE', NULL),
(100, 21, 1458, 1.00, 0.00, 'PENDIENTE', NULL),
(101, 21, 1459, 1.00, 0.00, 'PENDIENTE', NULL),
(102, 21, 1460, 1.00, 0.00, 'PENDIENTE', NULL),
(103, 21, 1461, 1.00, 0.00, 'PENDIENTE', NULL),
(104, 21, 1462, 1.00, 0.00, 'PENDIENTE', NULL),
(105, 21, 1463, 1.00, 0.00, 'PENDIENTE', NULL),
(106, 21, 1464, 1.00, 0.00, 'PENDIENTE', NULL),
(107, 21, 1465, 1.00, 0.00, 'PENDIENTE', NULL),
(108, 21, 1466, 1.00, 0.00, 'PENDIENTE', NULL),
(109, 21, 1467, 1.00, 0.00, 'PENDIENTE', NULL),
(110, 21, 1468, 1.00, 0.00, 'PENDIENTE', NULL),
(111, 21, 1469, 1.00, 0.00, 'PENDIENTE', NULL),
(112, 21, 1470, 1.00, 0.00, 'PENDIENTE', NULL),
(113, 21, 1471, 1.00, 0.00, 'PENDIENTE', NULL),
(114, 21, 1472, 1.00, 0.00, 'PENDIENTE', NULL),
(115, 22, 89, 4.00, 0.00, 'REQUIERE_COMPRA', NULL),
(116, 22, 1120, 4.00, 0.00, 'REQUIERE_COMPRA', NULL),
(117, 22, 1452, 1.00, 0.00, 'REQUIERE_COMPRA', NULL),
(118, 22, 1453, 1.00, 0.00, 'REQUIERE_COMPRA', NULL),
(119, 22, 1454, 1.00, 0.00, 'REQUIERE_COMPRA', NULL),
(120, 22, 1455, 1.00, 0.00, 'REQUIERE_COMPRA', NULL),
(121, 22, 1456, 1.00, 0.00, 'REQUIERE_COMPRA', NULL),
(122, 22, 1457, 1.00, 0.00, 'REQUIERE_COMPRA', NULL),
(123, 22, 1458, 1.00, 0.00, 'REQUIERE_COMPRA', NULL),
(124, 22, 1459, 1.00, 0.00, 'REQUIERE_COMPRA', NULL),
(125, 22, 1460, 1.00, 0.00, 'REQUIERE_COMPRA', NULL),
(126, 22, 1461, 1.00, 0.00, 'REQUIERE_COMPRA', NULL),
(127, 22, 1462, 1.00, 0.00, 'REQUIERE_COMPRA', NULL),
(128, 22, 1463, 1.00, 0.00, 'REQUIERE_COMPRA', NULL),
(129, 22, 1464, 1.00, 0.00, 'REQUIERE_COMPRA', NULL),
(130, 22, 1465, 1.00, 0.00, 'REQUIERE_COMPRA', NULL),
(131, 22, 1466, 1.00, 0.00, 'REQUIERE_COMPRA', NULL),
(132, 22, 1467, 1.00, 0.00, 'REQUIERE_COMPRA', NULL),
(133, 22, 1468, 1.00, 0.00, 'REQUIERE_COMPRA', NULL),
(134, 22, 1469, 1.00, 0.00, 'REQUIERE_COMPRA', NULL),
(135, 22, 1470, 1.00, 0.00, 'REQUIERE_COMPRA', NULL),
(136, 22, 1471, 1.00, 0.00, 'REQUIERE_COMPRA', NULL),
(137, 22, 1472, 1.00, 0.00, 'REQUIERE_COMPRA', NULL),
(138, 23, 1280, 2.00, 0.00, 'REQUIERE_COMPRA', NULL),
(139, 23, 1281, 2.00, 0.00, 'REQUIERE_COMPRA', NULL),
(140, 24, 71, 1.00, 0.00, 'ANULADO', NULL),
(141, 24, 767, 2.00, 0.00, 'ANULADO', NULL),
(142, 24, 790, 1.00, 0.00, 'ANULADO', NULL),
(143, 24, 966, 8.00, 0.00, 'ANULADO', NULL),
(144, 24, 1357, 8.00, 0.00, 'ANULADO', NULL),
(145, 24, 1358, 1.00, 0.00, 'ANULADO', NULL),
(146, 25, 1294, 1.00, 0.00, 'COMPRADO', 240000),
(147, 25, 1295, 1.00, 0.00, 'COMPRADO', 240000),
(148, 25, 1431, 1.00, 0.00, 'REQUIERE_COMPRA', NULL),
(149, 27, 202, 24.00, 0.00, 'ANULADO', NULL),
(150, 27, 225, 3.00, 0.00, 'ANULADO', NULL),
(151, 27, 228, 10.00, 0.00, 'ANULADO', NULL),
(152, 27, 380, 12.00, 0.00, 'ANULADO', NULL),
(153, 27, 1053, 7.00, 0.00, 'ANULADO', NULL),
(154, 27, 1117, 6.00, 0.00, 'ANULADO', NULL),
(155, 27, 1197, 10.00, 0.00, 'ANULADO', NULL),
(156, 27, 1198, 10.00, 0.00, 'ANULADO', NULL),
(157, 27, 1419, 7.00, 0.00, 'ANULADO', NULL),
(158, 27, 1421, 12.00, 0.00, 'ANULADO', NULL),
(159, 27, 1422, 1.00, 0.00, 'ANULADO', NULL),
(160, 28, 1569, 1.00, 0.00, 'PENDIENTE', NULL),
(161, 28, 1565, 1.00, 0.00, 'PENDIENTE', NULL),
(162, 28, 467, 1.00, 0.00, 'PENDIENTE', NULL),
(163, 28, 1539, 1.00, 0.00, 'PENDIENTE', NULL),
(164, 28, 1570, 25.00, 0.00, 'PENDIENTE', NULL),
(165, 29, 202, 24.00, 0.00, 'PENDIENTE', NULL),
(166, 29, 225, 3.00, 0.00, 'PENDIENTE', NULL),
(167, 29, 228, 10.00, 0.00, 'PENDIENTE', NULL),
(168, 29, 380, 12.00, 0.00, 'PENDIENTE', 240000),
(169, 29, 1053, 7.00, 0.00, 'PENDIENTE', NULL),
(170, 29, 1117, 6.00, 0.00, 'PENDIENTE', NULL),
(171, 29, 1197, 10.00, 0.00, 'REQUIERE_COMPRA', 240000),
(172, 29, 1198, 10.00, 0.00, 'PENDIENTE', NULL),
(173, 29, 1419, 7.00, 0.00, 'REQUIERE_COMPRA', 240000),
(174, 29, 1421, 12.00, 0.00, 'PENDIENTE', NULL),
(175, 29, 1422, 1.00, 0.00, 'PENDIENTE', NULL),
(176, 30, 1431, 1.00, 1.00, 'ENTREGADO', NULL),
(177, 31, 89, 4.00, 0.00, 'PENDIENTE', NULL),
(178, 31, 1452, 1.00, 0.00, 'PENDIENTE', NULL),
(179, 31, 1453, 1.00, 0.00, 'PENDIENTE', NULL),
(180, 31, 1454, 1.00, 0.00, 'PENDIENTE', NULL),
(181, 31, 1455, 1.00, 0.00, 'PENDIENTE', NULL),
(182, 31, 1456, 1.00, 0.00, 'PENDIENTE', NULL),
(183, 31, 1457, 1.00, 0.00, 'PENDIENTE', NULL),
(184, 31, 1458, 1.00, 0.00, 'PENDIENTE', NULL),
(185, 31, 1459, 1.00, 0.00, 'PENDIENTE', NULL),
(186, 31, 1460, 1.00, 0.00, 'PENDIENTE', NULL),
(187, 31, 1461, 1.00, 0.00, 'PENDIENTE', NULL),
(188, 31, 1462, 1.00, 0.00, 'PENDIENTE', NULL),
(189, 31, 1463, 1.00, 0.00, 'PENDIENTE', NULL),
(190, 31, 1464, 1.00, 0.00, 'PENDIENTE', NULL),
(191, 31, 1465, 1.00, 0.00, 'PENDIENTE', NULL),
(192, 31, 1466, 1.00, 0.00, 'PENDIENTE', NULL),
(193, 31, 1467, 1.00, 0.00, 'PENDIENTE', NULL),
(194, 31, 1468, 1.00, 0.00, 'PENDIENTE', NULL),
(195, 31, 1469, 1.00, 0.00, 'PENDIENTE', NULL),
(196, 31, 1470, 1.00, 0.00, 'PENDIENTE', NULL),
(197, 31, 1471, 1.00, 0.00, 'PENDIENTE', NULL),
(198, 31, 1472, 1.00, 0.00, 'PENDIENTE', NULL),
(199, 32, 552, 10.00, 0.00, 'REQUIERE_COMPRA', NULL),
(200, 33, 1294, 1.00, 0.00, 'REQUIERE_COMPRA', NULL),
(201, 33, 1295, 1.00, 0.00, 'REQUIERE_COMPRA', NULL),
(202, 33, 1431, 1.00, 0.00, 'REQUIERE_COMPRA', NULL),
(203, 34, 1294, 1.00, 0.00, 'REQUIERE_COMPRA', NULL),
(204, 34, 1295, 1.00, 0.00, 'REQUIERE_COMPRA', NULL),
(205, 34, 1431, 1.00, 0.00, 'REQUIERE_COMPRA', NULL),
(206, 35, 1294, 1.00, 0.00, 'REQUIERE_COMPRA', NULL),
(207, 35, 1295, 1.00, 0.00, 'REQUIERE_COMPRA', NULL),
(208, 35, 1431, 1.00, 0.00, 'REQUIERE_COMPRA', NULL),
(209, 36, 1294, 1.00, 0.00, 'REQUIERE_COMPRA', NULL),
(210, 36, 1295, 1.00, 0.00, 'REQUIERE_COMPRA', NULL),
(211, 36, 1431, 1.00, 0.00, 'REQUIERE_COMPRA', NULL),
(212, 37, 1294, 1.00, 0.00, 'REQUIERE_COMPRA', NULL),
(213, 37, 1295, 1.00, 0.00, 'REQUIERE_COMPRA', NULL),
(214, 37, 1431, 1.00, 0.00, 'REQUIERE_COMPRA', NULL),
(215, 38, 1294, 1.00, 0.00, 'REQUIERE_COMPRA', NULL),
(216, 38, 1295, 1.00, 0.00, 'REQUIERE_COMPRA', NULL),
(217, 38, 1431, 1.00, 0.00, 'REQUIERE_COMPRA', NULL),
(218, 39, 1294, 1.00, 0.00, 'REQUIERE_COMPRA', NULL),
(219, 39, 1295, 1.00, 0.00, 'REQUIERE_COMPRA', NULL),
(220, 39, 1431, 1.00, 0.00, 'REQUIERE_COMPRA', NULL),
(221, 40, 1294, 1.00, 0.00, 'REQUIERE_COMPRA', NULL),
(222, 40, 1295, 1.00, 0.00, 'REQUIERE_COMPRA', NULL),
(223, 40, 1431, 1.00, 0.00, 'REQUIERE_COMPRA', NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `empleados`
--

CREATE TABLE `empleados` (
  `id` int(11) NOT NULL,
  `nombre_completo` varchar(150) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `cargo` varchar(100) DEFAULT NULL,
  `rut` varchar(20) DEFAULT NULL,
  `centro_costo_id` int(11) DEFAULT NULL,
  `usuario_id` int(11) DEFAULT NULL,
  `activo` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `empleados`
--

INSERT INTO `empleados` (`id`, `nombre_completo`, `email`, `cargo`, `rut`, `centro_costo_id`, `usuario_id`, `activo`, `created_at`, `updated_at`) VALUES
(1, 'Nicolas Salas', 'nsalas@insuban.cl', 'Tecnico', '263285808', 30, 1, 1, '2026-01-07 03:56:04', '2026-01-20 14:37:07'),
(2, 'Froilan Urdaneta', 'furdaneta@insuban.cl', 'Usuario Sistema', NULL, NULL, 2, 1, '2026-01-07 03:56:04', '2026-01-07 03:56:04'),
(3, 'Carlos Ruiz', 'cruiz@insuban.cl', 'Usuario Sistema', NULL, NULL, 3, 1, '2026-01-07 03:56:04', '2026-01-07 03:56:04'),
(4, 'Rafael Morales', 'rmorales@insuban.cl', 'Usuario Sistema', NULL, NULL, 4, 1, '2026-01-07 03:56:04', '2026-01-07 03:56:04'),
(5, 'Carla Tapia', NULL, NULL, '243791588', 23, NULL, 1, '2026-01-12 00:33:02', '2026-01-12 00:33:02');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `entregas_personal`
--

CREATE TABLE `entregas_personal` (
  `id` int(11) NOT NULL,
  `insumo_id` int(11) NOT NULL,
  `usuario_operario_id` int(11) DEFAULT NULL,
  `receptor_externo` varchar(150) DEFAULT NULL,
  `usuario_bodeguero_id` int(11) NOT NULL,
  `estado_id` int(11) NOT NULL DEFAULT 1,
  `observacion` text DEFAULT NULL,
  `referencia_ot_id` int(11) DEFAULT NULL,
  `cantidad_entregada` decimal(10,2) NOT NULL,
  `cantidad_utilizada` decimal(10,2) DEFAULT 0.00,
  `fecha_entrega` datetime DEFAULT current_timestamp(),
  `fecha_aceptacion` datetime DEFAULT NULL,
  `fecha_uso` datetime DEFAULT NULL,
  `observacion_rechazo` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `entregas_personal`
--

INSERT INTO `entregas_personal` (`id`, `insumo_id`, `usuario_operario_id`, `receptor_externo`, `usuario_bodeguero_id`, `estado_id`, `observacion`, `referencia_ot_id`, `cantidad_entregada`, `cantidad_utilizada`, `fecha_entrega`, `fecha_aceptacion`, `fecha_uso`, `observacion_rechazo`) VALUES
(1, 552, 1, NULL, 1, 3, 'Nicolas', NULL, 9.00, 9.00, '2026-01-07 01:36:20', '2026-01-09 13:15:30', '2026-01-11 20:18:10', NULL),
(2, 552, 1, NULL, 1, 3, 'Material para OT #S/N', NULL, 98.00, 98.00, '2026-01-09 13:33:17', '2026-01-09 13:33:22', '2026-01-09 13:33:35', NULL),
(3, 552, 1, NULL, 3, 3, 'Entrega operario', NULL, 5.00, 5.00, '2026-01-12 10:33:09', '2026-01-12 10:35:06', '2026-01-12 10:35:14', NULL),
(4, 552, 1, NULL, 3, 3, 'Entrega operario', NULL, 9.00, 9.00, '2026-01-12 10:35:51', '2026-01-12 10:36:11', '2026-01-12 10:36:18', NULL),
(5, 552, 1, NULL, 3, 2, 'Entrega operario', NULL, 164.00, 0.00, '2026-01-12 16:56:02', '2026-01-13 10:28:18', NULL, NULL),
(6, 71, 1, NULL, 1, 4, 'Entrega operario', NULL, 10.00, 0.00, '2026-01-13 10:30:27', '2026-01-14 15:36:30', NULL, 'Rechazado por operario'),
(7, 552, 1, NULL, 1, 4, 'Entrega operario', NULL, 100.00, 0.00, '2026-01-13 10:42:37', '2026-01-14 15:36:59', NULL, 'Rechazado por operario'),
(8, 71, NULL, 'Carla Tapia', 1, 2, 'Entrega operario', NULL, 10.00, 0.00, '2026-01-14 14:12:08', '2026-01-14 18:12:08', NULL, NULL),
(9, 89, 1, NULL, 1, 2, 'Entrega Masiva OT #20', 20, 4.00, 4.00, '2026-01-14 15:25:21', '2026-01-14 15:36:13', '2026-01-21 12:51:33', NULL),
(10, 1455, 1, NULL, 1, 2, 'Entrega Masiva OT #20', 20, 1.00, 1.00, '2026-01-14 15:25:21', '2026-01-20 11:41:35', '2026-01-21 12:51:33', NULL),
(11, 552, 1, NULL, 1, 2, 'Entrega operario', NULL, 10.00, 0.00, '2026-01-14 16:32:34', '2026-01-14 16:32:41', NULL, NULL),
(12, 552, NULL, 'Carla Tapia', 1, 2, 'Entrega operario', NULL, 50.00, 0.00, '2026-01-14 16:37:39', '2026-01-14 20:37:39', NULL, NULL),
(13, 552, 2, NULL, 1, 1, 'Entrega operario', NULL, 10.00, 0.00, '2026-01-14 16:41:28', NULL, NULL, NULL),
(14, 552, NULL, 'Carla Tapia', 1, 2, 'Entrega operario', NULL, 29.00, 0.00, '2026-01-14 16:47:02', '2026-01-14 20:47:02', NULL, NULL),
(15, 552, 2, NULL, 1, 1, 'Entrega operario', NULL, 1.00, 0.00, '2026-01-14 16:47:08', NULL, NULL, NULL),
(16, 71, 3, NULL, 1, 1, 'Entrega operario', NULL, 10.00, 0.00, '2026-01-14 16:49:16', NULL, NULL, NULL),
(17, 1421, 2, NULL, 1, 1, 'Entrega operario', NULL, 3.00, 0.00, '2026-01-14 16:50:49', NULL, NULL, NULL),
(18, 1421, 2, NULL, 1, 1, 'Entrega operario', NULL, 10.00, 0.00, '2026-01-14 16:59:11', NULL, NULL, NULL),
(19, 202, NULL, 'Carla Tapia', 1, 2, 'Entrega operario', NULL, 8.00, 0.00, '2026-01-14 16:59:24', '2026-01-14 20:59:24', NULL, NULL),
(20, 1431, 1, NULL, 1, 2, 'Material para OT #30', 30, 1.00, 0.00, '2026-01-20 11:41:28', '2026-01-20 11:41:32', NULL, NULL),
(21, 1464, 1, NULL, 1, 2, 'Material para OT #20', 20, 1.00, 1.00, '2026-01-21 12:28:50', '2026-01-21 12:29:12', '2026-01-21 12:51:33', NULL),
(22, 1460, 1, NULL, 1, 2, 'Entrega Masiva OT #20', 20, 1.00, 1.00, '2026-01-21 12:29:01', '2026-01-21 12:29:07', '2026-01-21 12:51:33', NULL),
(23, 1459, 1, NULL, 1, 2, 'Entrega Masiva OT #20', 20, 1.00, 1.00, '2026-01-21 12:29:01', '2026-01-21 12:29:10', '2026-01-21 12:51:33', NULL),
(24, 1120, 1, NULL, 1, 2, 'Material para OT #20', 20, 4.00, 4.00, '2026-01-21 12:50:28', '2026-01-21 13:05:10', '2026-01-21 12:51:33', NULL),
(25, 552, 1, NULL, 1, 4, 'Entrega operario', NULL, 10.00, 0.00, '2026-01-21 14:05:55', '2026-01-21 14:07:05', NULL, 'Rechazado por operario'),
(26, 552, 1, NULL, 1, 2, 'LT7 - 1232\n', NULL, 10.00, 0.00, '2026-01-21 15:30:49', '2026-01-21 15:53:23', NULL, NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `estados_cotizacion`
--

CREATE TABLE `estados_cotizacion` (
  `id` int(11) NOT NULL,
  `nombre` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `estados_cotizacion`
--

INSERT INTO `estados_cotizacion` (`id`, `nombre`) VALUES
(1, 'Pendiente'),
(2, 'Aprobada'),
(3, 'Rechazada');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `estados_entrega`
--

CREATE TABLE `estados_entrega` (
  `id` int(11) NOT NULL,
  `codigo` varchar(50) NOT NULL,
  `nombre` varchar(50) NOT NULL,
  `descripcion` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `estados_entrega`
--

INSERT INTO `estados_entrega` (`id`, `codigo`, `nombre`, `descripcion`) VALUES
(1, 'PENDIENTE', 'Pendiente de Aceptación', 'El bodeguero entregó, pero el técnico aún no acepta'),
(2, 'EN_POSESION', 'En Posesión', 'El técnico aceptó y tiene el insumo en su poder'),
(3, 'FINALIZADO', 'Finalizado', 'El insumo fue consumido totalmente'),
(4, 'RECHAZADO', 'Rechazado', 'El técnico rechazó la entrega (error, dañado, etc.)');

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
(4, 'En Proceso'),
(1, 'Pendiente'),
(3, 'Rechazada');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `insumos`
--

CREATE TABLE `insumos` (
  `id` int(11) NOT NULL,
  `codigo_sku` varchar(50) DEFAULT NULL,
  `nombre` varchar(150) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `categoria_id` int(11) DEFAULT NULL,
  `stock_actual` decimal(10,2) DEFAULT 0.00,
  `stock_minimo` decimal(10,2) DEFAULT 5.00,
  `stock_critico` decimal(10,2) DEFAULT 2.00,
  `precio_costo` decimal(15,2) DEFAULT 0.00,
  `moneda` varchar(5) NOT NULL DEFAULT 'CLP',
  `unidad_medida` varchar(20) DEFAULT 'UN',
  `imagen_url` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `insumos`
--

INSERT INTO `insumos` (`id`, `codigo_sku`, `nombre`, `descripcion`, `categoria_id`, `stock_actual`, `stock_minimo`, `stock_critico`, `precio_costo`, `moneda`, `unidad_medida`, `imagen_url`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, '990000071990000', 'FLETE', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:19', '2025-12-30 16:34:19', NULL),
(2, '990000071990001', 'REPARACIONES EN GENERAL', 'Acero', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:19', '2025-12-30 16:34:19', NULL),
(3, '990000071991001', 'RODAMIENTO 1206 C3', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:19', '2025-12-30 16:34:19', NULL),
(4, '990000071991002', 'RODAMIENTO 16009', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:19', '2025-12-30 16:34:19', NULL),
(5, '990000071991003', 'RODAMIENTO 51111', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:19', '2025-12-30 16:34:19', NULL),
(6, '990000071991004', 'RODAMIENTO 6307 2R C3 EMQ', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:19', '2025-12-30 16:34:19', NULL),
(7, '990000071991005', 'RETEN 50-70-13.5', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:19', '2025-12-30 16:34:19', NULL),
(8, '990000071991006', 'RODAMIENTO 3206-BD-XL-2HRS-TVH', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:19', '2025-12-30 16:34:19', NULL),
(9, '990000071991007', 'RODAMIENTO 3206-BD-XL-2HRS-TVH#E-1', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:19', '2025-12-30 16:34:19', NULL),
(10, '990000071991008', 'RODAMIENTO 6306-2SR-L038', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:19', '2025-12-30 16:34:19', NULL),
(11, '990000071991009', 'RODAMIENTO 6007-2RSR', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:19', '2025-12-30 16:34:19', NULL),
(12, '990000071991010', 'RODAMIENTO 3207-BD-XL-2HRS-TVH', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:19', '2025-12-30 16:34:19', NULL),
(13, '990000071991012', 'RETEN 50-70-14', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:19', '2025-12-30 16:34:19', NULL),
(14, '990000071991013', 'RODAMIENTO 6204ZZC3/2AS', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:19', '2025-12-30 16:34:19', NULL),
(15, '990000071991014', 'RODAMIENTO 6006LLUC3/L627', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:19', '2025-12-30 16:34:19', NULL),
(16, '990000071991015', 'RODAMIENTO 6006LLUC3/2AS', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:19', '2025-12-30 16:34:19', NULL),
(17, '990000071991016', 'RODAMIENTO D6256212', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:19', '2025-12-30 16:34:19', NULL),
(18, '990000071991017', 'RODAMIENTO 6206LLHC3/L627', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:19', '2025-12-30 16:34:19', NULL),
(19, '990000071991019', 'RODAMIENTO 6308LLUC3/2HS', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:19', '2025-12-30 16:34:19', NULL),
(20, '990000071991020', 'RODAMIENTO 6206-2RS1', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:19', '2025-12-30 16:34:19', NULL),
(21, '990000071991021', 'RODAMIENTO 6006-2RS1', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:19', '2025-12-30 16:34:19', NULL),
(22, '990000071991022', 'RODAMIENTO 6201-2RSH/C3', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:19', '2025-12-30 16:34:19', NULL),
(23, '990000071991023', 'RODAMIENTO 607-2RSH/C3', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:19', '2025-12-30 16:34:19', NULL),
(24, '990000071991024', 'RODAMIENTO 6203', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:19', '2025-12-30 16:34:19', NULL),
(25, '990000071991025', 'RODAMIENTO 6207-2RS1/C3', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:19', '2025-12-30 16:34:19', NULL),
(26, '990000071991026', 'RODAMIENTO 6202-2RSH', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:19', '2025-12-30 16:34:19', NULL),
(27, '990000071991027', 'RODAMIENTO 6305-2Z-C3', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:19', '2025-12-30 16:34:19', NULL),
(28, '990000071991028', 'RODAMIENTO 6207-2RS1', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:19', '2025-12-30 16:34:19', NULL),
(29, '990000071991029', 'RODAMIENTO 1206 ETN9', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:19', '2025-12-30 16:34:19', NULL),
(30, '990000071991030', 'RODAMIENTO 6208-2RS1/C3', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:19', '2025-12-30 16:34:19', NULL),
(31, '990000071991031', 'RODAMIENTO 6012-2RS1/C3', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:19', '2025-12-30 16:34:19', NULL),
(32, '990000071991032', 'RODAMIENTO 6311-2RS1/C3', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:19', '2025-12-30 16:34:19', NULL),
(33, '990000071991033', 'RODAMIENTO 6312-2RS1/C3', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:19', '2025-12-30 16:34:19', NULL),
(34, '990000071991034', 'RODAMIENTO 6308-2RS1', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:19', '2025-12-30 16:34:19', NULL),
(35, '990000071991036', 'RODAMIENTO 6212-2RS1', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:19', '2025-12-30 16:34:19', NULL),
(36, '990000071991037', 'RODAMIENTO 6211-2RS1', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:19', '2025-12-30 16:34:19', NULL),
(37, '990000071991038', 'RODAMIENTO 6205EEC3', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:19', '2025-12-30 16:34:19', NULL),
(38, '990000071991039', 'RODAMIENTO 30202R', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:19', '2025-12-30 16:34:19', NULL),
(39, '990000071991040', 'RODAMIENTO 1205.C3', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:19', '2025-12-30 16:34:19', NULL),
(40, '990000071991041', 'RODAMIENTO 1206 2RS', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:19', '2025-12-30 16:34:19', NULL),
(41, '990000071991042', 'RODAMIENTO 6208.EEC3', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:19', '2025-12-30 16:34:19', NULL),
(42, '990000071991043', 'RODAMIENTO 6009.EEC3', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:19', '2025-12-30 16:34:19', NULL),
(43, '990000071991044', 'RODAMIENTO 30212JR', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:19', '2025-12-30 16:34:19', NULL),
(44, '990000071991045', 'RODAMIENTO HI-CAP33209JR', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:19', '2025-12-30 16:34:19', NULL),
(45, '990000071991046', 'RODAMIENTO HC0202R', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:19', '2025-12-30 16:34:19', NULL),
(46, '990000071991047', 'RODAMIENTO 6004 2RSC3(KOYO)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:19', '2026-01-07 04:44:44', NULL),
(47, '990000071991048', 'RODAMIENTO 60052RSC3', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:19', '2025-12-30 16:34:19', NULL),
(48, '990000071991049', 'RODAMIENTO HI-CAPM802048/11', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:19', '2025-12-30 16:34:19', NULL),
(49, '990000071991050', 'RODAMIENTO 2206C3', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:19', '2025-12-30 16:34:19', NULL),
(50, '990000071991051', 'RODAMIENTO 63052RSC3', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:19', '2025-12-30 16:34:19', NULL),
(51, '990000071991052', 'RODAMIENTO 52052RS', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:19', '2025-12-30 16:34:19', NULL),
(52, '990000071991053', 'RODAMIENTO 30205JR-1RS', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:19', '2025-12-30 16:34:19', NULL),
(53, '990000071991054', 'RODAMIENTO 52062RS', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:19', '2025-12-30 16:34:19', NULL),
(54, '990000071991055', 'RODAMIENTO 51111(KOYO)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:19', '2025-12-30 16:34:19', NULL),
(55, '990000071991056', 'RODAMIENTO 62072RSC3', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:19', '2025-12-30 16:34:19', NULL),
(56, '990000071991057', 'RODAMIENTO 60122RS', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:19', '2025-12-30 16:34:19', NULL),
(57, '990000071991058', 'RODAMIENTO UCFC208J', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:19', '2025-12-30 16:34:19', NULL),
(58, '990000071991060', 'RODAMIENTO 62922ESC3', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:19', '2025-12-30 16:34:19', NULL),
(59, '990000071991061', 'RODAMIENTO 62032RSC3', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:19', '2025-12-30 16:34:19', NULL),
(60, '990000071991062', 'RODAMIENTO 1205', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:19', '2025-12-30 16:34:19', NULL),
(61, '990000071991064', 'RODAMIENTO 60093RSCM', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:19', '2025-12-30 16:34:19', NULL),
(62, '990000071991067', 'RODAMIENTO 6012ZRSC3', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:19', '2025-12-30 16:34:19', NULL),
(63, '990000071991069', 'RODAMIENTO 62052RSC3', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:19', '2025-12-30 16:34:19', NULL),
(64, '990000071991071', 'RODAMIENTO 1205C3', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:19', '2025-12-30 16:34:19', NULL),
(65, '990000071991072', 'RODAMIENTO GC30292R', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:19', '2025-12-30 16:34:19', NULL),
(66, '990000071991073', 'RODAMIENTO 16009C3', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:19', '2025-12-30 16:34:19', NULL),
(67, '990000071991074', 'RODAMIENTO 52072RS', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:19', '2025-12-30 16:34:19', NULL),
(68, '990000071991075', 'RODAMIENTO 62072ZC3', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:19', '2025-12-30 16:34:19', NULL),
(69, '990000071991076', 'RODAMIENTO 62122RSC3', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:19', '2025-12-30 16:34:19', NULL),
(70, '990000071991077', 'RODAMIENTO 6309-2RS-CO7-C3', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:19', '2025-12-30 16:34:19', NULL),
(71, '990000071991078', 'RODAMIENTO 6204-2RS2', '', NULL, 46.00, 1.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:19', '2026-01-14 19:49:16', NULL),
(72, '990000071991079', 'RODAMIENTO 6209-2R2-C3', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(73, '990000071991080', 'RODAMIENTO 6206-2RS2', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(74, '990000071991081', 'RODAMIENTO 6206-RS2-C3', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(75, '990000071991082', 'RODAMIENTO 6203-2RS2', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(76, '990000071991083', 'RODAMIENTO 6018-2RSR-C3', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(77, '990000071991084', 'RODAMIENTO 6306-2RS2-C3', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(78, '990000071991085', 'RODAMIENTO 6007-2RS2-C3', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(79, '990000071991086', 'RODAMIENTO 3205-B-2RS-TV', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(80, '990000071991087', 'RODAMIENTO 3205-B-2RS-TV-C3', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(81, '990000071991088', 'RODAMIENTO 2206-TV-C3', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(82, '990000071991107', 'RODAMIENTO 3206-B-2RS-TV-C3', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(83, '990000071991090', 'RODAMIENTO 3206-B-2Z-TV-C3', '', NULL, 0.00, 0.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2026-01-12 11:54:46', NULL),
(84, '990000071991091', 'RODAMIENTO 16009-C3', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(85, '990000071991092', 'RODAMIENTO 51109', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(86, '990000071991093', 'RODAMIENTO 6308-2LFS', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(87, '990000071991094', 'RODAMIENTO 6009-2RS2-C3', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(88, '990000071991095', 'RODAMIENTO 6007-2RS-C3', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(89, '990000071991096', 'RODAMIENTO 607-2RSR-C3', '', NULL, 20.00, 16.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2026-01-14 18:25:21', NULL),
(90, '990000071991097', 'RODAMIENTO UCF205', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(91, '990000071991098', 'RODAMIENTO 6211-2RS2', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(92, '990000071991099', 'RODAMIENTO 6212-2RS2', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(93, '990000071991100', 'RODAMIENTO 3207-B-2RS-TV', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(94, '990000071991101', 'RODAMIENTO 3207-B-2RS-TV-C3', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(95, '990000071991102', 'RODAMIENTO NKE1205-C3', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(96, '990000071991103', 'RODAMIENTO 6205LLUC3', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(97, '990000071991104', 'RODAMIENTO 6405-2Z-C3', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(98, '990000071991105', 'RODAMIENTO 3205-B-TV-C3', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(99, '990000071991109', 'RODAMIENTO 6206-2RS2-C3', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(100, '990000071991111', 'RODAMIENTO 6205-2RS2-C3', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(101, '990000071991112', 'RODAMIENTO 3207-B-TV-C3', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(102, '990000071991113', 'RODAMIENTO CONICO M802048/11', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(103, '990000071991114', 'RETEN 100-150-13', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(104, '990000071991115', 'RETEN 70-100-13', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(105, '990000071991116', 'RETEN 70-100-12', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(106, '990000071991117', 'RETEN 70-100-10', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(107, '990000071991118', 'RETEN 55-100-10', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(108, '990000071991119', 'RETEN 65-85-10', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(109, '990000071991120', 'RETEN 60-80-8', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(110, '990000071991121', 'RETEN 55-72-10', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(111, '990000071991122', 'RETEN 45-72-8', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(112, '990000071991123', 'RETEN 45-65-8', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(113, '990000071991124', 'RETEN 40-72-7', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(114, '990000071991125', 'RETEN 44-60-7', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(115, '990000071991126', 'RETEN 45-62-10', '', NULL, 0.00, 2.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2026-01-12 16:47:36', NULL),
(116, '990000071991127', 'RETEN 40-62-7', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(117, '990000071991128', 'RETEN 45-55-7', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(118, '990000071991129', 'RETEN 45-62-7', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(119, '990000071991130', 'RETEN 44-62-9', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(120, '990000071991131', 'RETEN 48-72-10', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(121, '990000071991132', 'RETEN 35-62-7', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(122, '990000071991133', 'RETEN 30-62-10', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(123, '990000071991134', 'RETEN 36-52-7', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(124, '990000071991135', 'RETEN 35-50-10', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(125, '990000071991136', 'RETEN 35-72-7', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(126, '990000071991137', 'RETEN 30-47-7', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(127, '990000071991138', 'RETEN 30-40-7', '', NULL, 0.00, 2.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2026-01-12 16:50:19', NULL),
(128, '990000071991139', 'RETEN 25-37-7', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(129, '990000071991140', 'RETEN 25-40-8', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(130, '990000071991141', 'RETEN 25-36-7', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(131, '990000071991142', 'RETEN 20-42-7', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(132, '990000071991143', 'RETEN 20-40-7', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(133, '990000071991144', 'RETEN 20-35-7', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(134, '990000071991145', 'RETEN 20-30-7', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(135, '990000071991146', 'RETEN 16-28-7', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(136, '990000071991147', 'RETEN 10-26-7', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(137, '990000071991148', 'RETEN 20-52-10', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(138, '990000071991149', 'RETEN 30-52-7', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(139, '990000071991150', 'RETEN 32-47-7', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(140, '990000071991151', 'RETEN 30-42-7', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(141, '990000071991152', 'RETEN 30-50-10', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(142, '990000071991153', 'RETEN 32-47-10', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(143, '990000071991154', 'RETEN 32-47-8', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(144, '990000071991155', 'RETEN 45-60-8', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(145, '990000071991156', 'RETEN 40-55-8', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(146, '990000071991157', 'RETEN 44-58-8', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(147, '990000071991158', 'RETEN 40-62-10', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(148, '990000071991159', 'RETEN 30-52-10', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(149, '990000071991160', 'RETEN 175-125-25', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(150, '990000071991161', 'RETEN 36-52-8', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(151, '990000071991162', 'RETEN 30-55-7', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(152, '990000071991163', 'RETEN 35-50-8', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(153, '990000071991164', 'RETEN 35-65-8', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(154, '990000071991165', 'RETEN 30-72-10', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(155, '990000071991166', 'RETEN 38-62-7', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(156, '990000071991167', 'RETEN 38-62-10', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(157, '990000071991168', 'RETEN 18-35-7', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(158, '990000071991169', 'RETEN 30-55-8', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(159, '990000071991170', 'RETEN 24-47-7', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(160, '990000071991171', 'RETEN 25-35-7', '', NULL, 0.00, 4.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2026-01-12 16:47:46', NULL),
(161, '990000071991172', 'RETEN 35-55-10', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(162, '990000071991173', 'RETEN 15-25-5', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(163, '990000071991174', 'RETEN 24-38-8', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(164, '990000071991175', 'RETEN 35-52-9', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(165, '990000071991176', 'RETEN 18-28-7', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(166, '990000071991177', 'RETEN 15-35-5', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(167, '990000071991178', 'RETEN 44-62-8', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(168, '990000071991179', 'RETEN 20-28-6', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(169, '990000071991180', 'RETEN 30-62-8', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(170, '990000071991181', 'RETEN 35-52-7', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(171, '990000071991182', 'ADHESIVO PVC TRADICIONAL 240CC (VINILIT)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(172, '990000071991183', 'CARTUCHO DE GAS BUTANO CON VALVULA DE SEGURIDAD 190GR (YANES )', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(173, '990000071991184', 'CARTUCHO METALICO DE GAS DESECHABLE (PRAKTUS)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(174, '990000071991185', 'CARTUCHO DE GAS CON VALVULA (YANES)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(175, '990000071991186', 'AEROSOL DE ACERO INOXIDABLE SPRAY PERFECT 400ML (WURTH)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(176, '990000071991187', 'ROST OFF 300ML ( WURTH)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(177, '990000071991188', 'WIT-P 200 (WURTH)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(178, '990000071991189', 'ACEITE PARA LUBRICADORES NEUMATICOS (SMC)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(179, '990000071991190', 'ESPUMA EXPANSIVA 750ML (REX)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(180, '990000071991191', 'ESPUMA EXPANSIVA MULTIUSO 750ML (SOUDAL)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(181, '990000071991192', 'ESPUMA EXPANSIVA FOAM- 1N 500 ML (FULL SELLO)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(182, '990000071991193', 'ESPUMA EXPANSIVA FOAM- 1N 750 ML (FULL SELLO)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(183, '990000071991194', 'ESPANFIX PRO MANUAL (WURTH)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(184, '990000071991195', 'PURITY FG2 (PETRO- CANADA)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(185, '990000071991196', 'POWER LUBE 255G LUBRICANTE MULTIUSO (CRC)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(186, '990000071991197', 'LIMPIA CONTACTO ( WURTH)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(187, '990000071991198', 'LIMPIA CONTACTO (W-MAX)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(188, '990000071991199', 'QD CONTACT CLEANER 311G AZUL (CRC)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(189, '990000071991200', 'A40 MAGIC (AKFIX)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(190, '990000071991201', 'SELLANTE Y ADESHIVO POLIURETANO (TX)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(191, '990000071991202', 'ANTI MIST SPRAY ANTIEMPAÃANTE (SONAX)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(192, '990000071991203', 'CHAIN LUBE (WYNNS) 500ML', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(193, '990000071991205', 'SELLANTE DE POLIUTERANO PU 3500 (SELLOTEC)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(194, '990000071991206', 'SELLANTE POLIETURENO (SELLOMAC)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(195, '990000071991207', 'SILICONA BLANCA ACETICA 300ML', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(196, '990000071991209', 'SILICONA BLANCA TRANSPARENTE 300ML', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(197, '990000071991210', 'SILICONA ACETICA CON FUNGICIDA SC1000S (SELLOTEC)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(198, '990000071991211', 'ESMALTE SINTETICO CERELUXE -GRIS PERLA (CERESITA)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(199, '990000071991212', 'HUAIPE', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(200, '990000071991213', 'SPRAY ANTI-FLASH ROJO (ROYAL)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(201, '990000071991214', 'SPRAY DE ZINC BRILLANTE (WURT)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(202, '990000071991215', '(WALTEK) SPRAY PAINT BLANCO BRILLANTE', '', NULL, 40.00, 24.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2026-01-14 19:59:24', NULL),
(203, '990000071991216', '(WALTEK) SPRAY PAINT ROJO', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(204, '990000071991217', '(WALTEK) SPRAY PAINT GRIS MAQUINA', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(205, '990000071991218', '(WALTEK) SPRAY PAINT AZUL CIELO', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(206, '990000071991219', 'SPRAY COLOR ROJO NARANJA (FERRETOOLS)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(207, '990000071991220', '(WALTEK) SPRAY PAINT NEGRO BRILLANTE', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(208, '990000071991221', 'PINTURA SPRAY NEGRO BRILLANTE (REX)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(209, '990000071991222', 'SPRAY ALUMINIO (MARSON)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(210, '990000071991223', 'REFRIGERANTE COOLANT PARA AUTO 5L (BIOKIM)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(211, '990000071991224', 'LUBRICANTE 10W-40(LUBRAX)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(212, '990000071991225', 'DILUYENTE DUCO PXL (5L) (DIDEVAL)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(213, '990000071991226', 'LUBRICANTE 15W-40 (SHELL HELIX)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(214, '990000071991227', 'METIL ETIL CETONA (REGON)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(215, '990000071991228', '(ECOSA) RODILLO DE CHIPORRO SINTETICO 12CM/5\" 18MM', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(216, '990000071991229', 'RODILLO DE CHIPORRO SINTETICO 23 CM (ECOSA)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(217, '990000071991230', '(LIZCAL) RODILLO DE CHIPORRO NATURAL 9CM/4\"', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(218, '990000071991231', 'RODILLO PELO CORTO 6MM 9CM', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(219, '990000071991232', '(HELA) RODILLO CORTA GOTA 12CM/5\"', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(220, '990000071991233', '(HELA) RODILLO DE CHIPORRO NATURAL 18 CM/7\"', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(221, '990000071991234', '(LIZCAL) RODILLO DE CHIPORRO NATURAL 23CM/9\"', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(222, '990000071991235', '(HELA) RODILLO CHICO 50MM', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(223, '990000071991236', '(HELA) RODILLO MEDIANO 70MM', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(224, '990000071991237', '(HELA) ESPATULA 60MM', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(225, '990000071991238', 'ESPATULA 50MM', '', NULL, 6.00, 3.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2026-01-12 19:03:51', NULL),
(226, '990000071991239', '(HELA) BROCHA CERDA 5/8X1', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(227, '990000071991240', '(HELA) BROCHA CERDA 6/8X2', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(228, '990000071991241', '(HELA) BROCHA CERDA 5/8 X3', '', NULL, 12.00, 10.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2026-01-13 12:29:16', NULL),
(229, '990000071991242', '(HELA) BROCHA CERDA 5/8X5', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(230, '990000071991243', 'BROCHA 1 (ECOSA)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(231, '990000071991244', 'BROCHA 4( ECOSA )', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(232, '990000071991245', 'AISLANTE ELECTRICO BLANCO PVC 19MMX 18', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(233, '990000071991246', 'AISLANTE ELECTRICO BLANCO EE100', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(234, '990000071991247', 'AISLANTE ELECTRICO NEGRO EE100', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(235, '990000071991249', 'CINTA AISLANTE ELECTRICO NEGRO 19MM X 20M X 0.177', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(236, '990000071991250', 'AISLANTE ELECTRICO NEGRO 130 C', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(237, '990000071991251', 'RETEN 35-62-10', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(238, '990000071991252', 'RETEN 36-52-10', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(239, '990000071991253', 'RETEN 15-29-7', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(240, '990000071991254', 'RETEN 20-30-43', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(241, '990000071991255', 'RETEN 35-52-10', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(242, '990000071991256', 'RETEN 40-68-10', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(243, '990000071991257', 'RETEN 40-60-7', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(244, '990000071991258', 'RETEN 35-47-7', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(245, '990000071991259', 'RETEN 26-38-7', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(246, '990000071991260', 'RETEN 60-90-10', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(247, '990000071991261', 'RETEN 90-120-12', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(248, '990000071991262', 'CAJA IDROBOX 2 MODULOS', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(249, '990000071991263', 'CAJA IDROBOX 3 MODULOS', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(250, '990000071991264', 'ENCHUFE HEMBRA SOBREPUESTO 63 A- 6H 200/346V', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(251, '990000071991265', 'ENCHUFE HEMBRA SOBREPUESTO 16A-6H 200-250V', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(252, '990000071991266', 'ENCHUFE HEMBRA SOBREPUESTO 32A-6H 380-415V', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(253, '990000071991267', 'ENCHUFE HEMBRA SOBREPUESTO 32A-6H 200/346V', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(254, '990000071991268', 'ENCHUFE TRIFASICO HEMBRA 16A-6H 380-415V', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(255, '990000071991269', 'ENCHUFE TRIFASICO HEMBRA 32A-6H 380-415V', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(256, '990000071991270', 'ENCHUFE TRIFASICO HEMBRA 32A-6H 200-250V', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(257, '990000071991271', 'ENCHUFE TRIFASICO HEMBRA 16A-6H 200-250V', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(258, '990000071991272', 'ENCHUFE TRIFASICO MACHO 32A.6H 200-346V', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(259, '990000071991273', 'ENCHUFE TRIFASICO MACHO 32A.6H 200-346V IPP 66 IPP67', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(260, '990000071991274', 'ENCHUFE TRIFASICO MACHO 16A-6H 380-415V', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(261, '990000071991275', 'ENCHUFE TRIFASICO MACHO 32A-6H 200-250V', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(262, '990000071991276', 'ENCHUFE TRIFASICO MACHO -63A-6H 200-346V', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(263, '990000071991277', 'ENCHUFE TRIFASICO MACHO 16A-6H 380-415V IPP66', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(264, '990000071991278', 'ENCHUFE TRIFASICO MACHO 16A-6H/200-346V', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(265, '990000071991279', 'ENCHUFE TRIFASICO MACHO 32A-6H/ 200-346V', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(266, '990000071991280', 'CAJAS RECTANGULARES PVC', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(267, '990000071991281', 'CAJAS RECTANGULARES METALICAS', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(268, '990000071991282', 'CAJAS CUADRADAS METALICAS', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(269, '990000071991283', 'BASE PARA DIN 600V 20-8 AWG', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(270, '990000071991284', 'BASE PARA DIN 300V 22-10 AWG', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(271, '990000071991285', 'BASE PARA DIN 600V 22-10 AWG', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(272, '990000071991286', 'BASE PARA DIN JST2.5 PE', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(273, '990000071991287', 'BASE PARA DIN 500V 22-10 AWG', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:20', '2025-12-30 16:34:20', NULL),
(274, '990000071991289', 'BASE PARA DIN 800V 101A', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(275, '990000071991290', 'BASE PARA DIN 800V 4MM', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(276, '990000071991291', 'BASE PARA DIN 600V 16-4 AWG', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(277, '990000071991292', 'BASE PARA DIN 300V 12 AWG', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(278, '990000071991293', 'BASE PARA DIN 600V 20-12 AWG', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(279, '990000071991294', 'BASE PARA DIN 12 CONT7PVC VERDE', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(280, '990000071991295', 'SELLO 2636 CAMION', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(281, '990000071991296', 'PLC', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(282, '990000071991297', 'RELE AMPLIFICADOR', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(283, '990000071991298', 'RELE DE SEGURIDAD', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(284, '990000071991299', 'Sensor ultrasonico analogo Sensor Ultrasonic Analog TYP AQGKU 1500', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(285, '990000071991300', 'Fuente de poder', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(286, '990000071991301', 'Sensor mucosa', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(287, '990000071991302', 'Cable 4 Pines', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(288, '990000071991303', 'Cable tapa sensor', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(289, '990000071991304', 'Filtro de manga NW 25', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(290, '990000071991305', 'Sello bomba Jabsco Metabisulfito ( 10 bombas )', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(291, '990000071991306', 'Rotor Jabsco grande Mucosa 8983-0005B', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(292, '990000071991307', 'Rotor Jabsco pequeño Metabisulfito 8980-0005B', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(293, '990000071991308', 'Flujometro Flow sensor Puls PNP Mode. SSFL BURKERT 8012.', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(294, '990000071991309', 'Densimetro Grande', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(295, '990000071991310', 'Densimetro Chico', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(296, '990000071991311', 'Machones acoplamiento', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(297, '990000071991312', 'Goma acoplamiento', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(298, '990000071991313', 'TERMINAL 10-12', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(299, '990000071991314', 'TERMINAL 5-10', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(300, '990000071991315', 'TERMINAL SUV 5-4', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(301, '990000071991316', 'TERMINAL RV 5.5- 10', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(302, '990000071991317', 'TERMIANL SV 5.5-4', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(303, '990000071991318', 'TERMINAL PTV 5-13', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(304, '990000071991319', 'TERMINAL SV 5-5.6', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(305, '990000071991320', 'TERMINAL RV 5.5-6', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(306, '990000071991321', 'TERMINAL REDONDO 12', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(307, '990000071991322', 'TERMINAL SV 1.25-3', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(308, '990000071991323', 'TERMINAL RV 2-6', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(309, '990000071991324', 'TERMINAL RV 2.32', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(310, '990000071991325', 'TERMINAL SV 2-3.2', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(311, '990000071991326', 'TERMINAL E1510', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL);
INSERT INTO `insumos` (`id`, `codigo_sku`, `nombre`, `descripcion`, `categoria_id`, `stock_actual`, `stock_minimo`, `stock_critico`, `precio_costo`, `moneda`, `unidad_medida`, `imagen_url`, `created_at`, `updated_at`, `deleted_at`) VALUES
(312, '990000071991327', 'TERMIANL E1010', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(313, '990000071991328', 'TERMINAL SV 1.25-4', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(314, '990000071991329', 'TERMINAL E0508', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(315, '990000071991330', 'TERMINAL RVL 25.3', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(316, '990000071991331', 'TERMINAL E 6012', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(317, '990000071991332', 'TERMINAL RV 25-6', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(318, '990000071991333', 'TERMINAL PTU 1.25-10', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(319, '990000071991334', 'TERMINAL E 7508', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(320, '990000071991335', 'CONECTOR DE DERIVACION AMARILLO', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(321, '990000071991336', 'CONTACTOS AUX', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(322, '990000071991337', 'CONECTOR CONICO NARANJA', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(323, '990000071991338', 'CONECTOR DE DERIVACION AZUL 1.5-2.5 MM', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(324, '990000071991342', 'RED RTV SILICONE', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(325, '990000071991343', 'COFRE /GUARDAMOTOR IP5 TE90842 GV2MC02', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(326, '990000071991344', 'PARADA EMERGENCIA ROJO XB4BS8442', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(327, '990000071991345', 'SENSOR FOTOELECTRICO 12 TE12244', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(328, '990000071991346', 'CABEZAL PULZADOR TE52065', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(329, '990000071991347', 'INTERRUPTOR DE POSICION FIN DE CARRERA', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(330, '990000071991348', 'CAJA BOT.3 PUESTOS VACIA', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(331, '990000071991351', 'PULSADOR LUM LED ROJO 23 XB4BW34M5 TE48444', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(332, '990000071991365', 'CAJA PARADA EMERGENCIA XALK178 TE52848', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(333, '990000071991353', 'PULSADOR RED ROJO 22MM TE44242', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(334, '990000071991354', 'PULSADOR LUM LED VERDE 23 XB4BW33M5 TE48443', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(335, '990000071991355', 'PILOTO ROJO LED 230/240XB4BVM4 TE47534', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(336, '990000071991356', 'BLOCK DE CONTACTO 1NA PAR TE52101 ZBE101', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(337, '990000071991357', 'BLOCK CONTACTO 1NC ZBE102 TE52102', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(338, '990000071991358', 'CONTADOR NA P/CAJAS XAL ZEN111', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(339, '990000071991359', 'PULSADOR RED 22MM XB4BO31 TE44231', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(340, '990000071991360', 'PULSADOR LUM LED VERDE 24VA TE4833', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(341, '990000071991361', 'PULSADOR LUM LED VERDE 23', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(342, '990000071991362', 'MATIX A5374 ADAPTADOR 1 MODULO BTICINO', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(343, '990000071991363', 'CONTACTOR LC1K0901M7', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(344, '990000071991364', 'INTERRUPTOR DE SEGURIDAD AZ 16-22 ZVRK-M16', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(345, '990000071991366', 'PULSADOR RAS VERDE 238 02', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(346, '990000071991367', 'PULSADOR RAS ROJO 238 01', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(347, '990000071991368', 'PULSADOR ROJO DIAM40 238 82', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(348, '990000071991369', 'BLOCK DE CONTACTOS OSMOZ 24242', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(349, '990000071991371', 'TEMPORIZADOR RELE ESTRELLA TRIANGULO RE22R2QGMR TE93632, ELECTRICO, 1, 0, G2', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(350, '990000071991372', 'TEMPORIZADOR DE RETARDO DESACTIVADO RE22R2CMR TE93646', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(351, '990000071991373', 'GUARDAMOTOR 1.6 -2.5 AMP TE14656 GV2ME07', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(352, '990000071991374', 'GUARDAMOTOR 13.0 -18-0AMP TE14661', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(353, '990000071991375', 'GUARDAMOTOR MAG/TERMICO GV2P07 TE92613', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(354, '990000071991376', 'INTERRUPTOR HORARIO DIGITAL SWITCH TIMER CCT15443 SCHNEIDER MG15224', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(355, '990000071991377', 'CONTACTOR 12 AP 1NA 1NC LC1D12B7 TE 17105', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(356, '990000071991378', 'CAJA VACIA P/2 PULSADORES TE52060 XALD02', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(357, '990000071991379', 'CAJA BOT 3 PUESTOS VACIA TE52061', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(358, '990000071991380', 'MAGIC INTERRUPTOR 5003LCH BTICINO', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(359, '990000071991381', 'INTERRUPTOR DIFERENCIAL IID 2P 40A 30MMA-AC', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(360, '990000071991382', 'HARMONY Control - Relé de control modular de nivel de líquido', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(361, '990000071991383', 'GUARDAMOTOR 9.0.14 TE14660', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(362, '990000071991384', 'SELECTOR DE POSICION MANETA L TE44261', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(363, '990000071991385', 'SELECTOR MANDO MANETA LARGA 3 POSICIONES NEGRO 22MM', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(364, '990000071991386', 'PILOTO VERDE LED TE47533', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(365, '990000071991387', 'BLOCK DE CONTACTO 600V TE52075 ZENL1111', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(366, '990000071991388', 'BLOCK DE CONTACTO ZENL1121 TE52076', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(367, '990000071991389', 'SONDA PARA CONTROL DE NI TE89039', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(368, '990000071991390', 'PLACA DE MONTAJE LISA 300X250 GALVANIZADO LEX80325', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(369, '990000071991391', 'BASE PARA DIN TT-311 4-20MA', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(370, '990000071991392', 'SELCCIONADOR ROTATIVO 221 30', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(371, '990000071991393', 'LUZ PILOTO REDONDO METALICO RED ROJO 22,0 MM 24V TE47334', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(372, '990000071991395', 'Bisagra GALVANIZADA 4X4X1.9 MM (FERRAWYY)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(373, '990000071991396', 'SPRAY PAINT NEGRO 400 ML (ALTA TEMPERATURA)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(374, '990000071991397', 'RODAMIENTO 6205-2RS2', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(375, '990000071991398', 'RODAMIENTO 607-2RSH', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(376, '990000071991399', 'CADENA PHC40-1X10FT(SKF)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(377, '990000071991400', 'CADENA DE ACOPLAMIENTO  PHC40-1 C/L', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(378, '990000071991401', 'CADENA DE ACOPLAMIENTO PHC40-1 O/L', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(379, '990000071991402', 'AISLANTE ELECTRICO ROJO PVC 19MMX 18', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(380, '990000071991403', 'DILUYENTE DUCO PXL 400 (1L) (DIDEVAL)', '', NULL, 12.00, 12.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2026-01-20 12:35:45', NULL),
(381, '990000071991404', 'BISAGRA 4X4 (SCANAVINI)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(382, '990000071991405', 'BISAGRA L38', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(383, '990000071991406', 'BISAGRA DE ACERO POLI 3\' x 3\' RUSTICA', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(384, '990000071991407', 'GEL DECAPANTE DE ACERO(CELINOX)', '', NULL, 3.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2026-01-20 12:11:07', NULL),
(385, '990000071991408', 'TYPE 275 RED(VERSACHEM)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(386, '990000071991409', 'TRABADOR DE RODAMIENTOS 50ML(WURTH)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(387, '990000071991410', 'CINTA AISLANTE(WURTH)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(388, '990000071991411', 'TRABADOR DE RODAMIENTOS 15ML (WURTH)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(389, '990000071991412', 'HEAD GASKET SHELLAC(ABRO)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(390, '990000071991414', 'CINTA MASKING 1 1/2X 40MT', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(391, '990000071991415', 'CINTA MASKING 24MMX40MT', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(392, '990000071991416', 'PINTURA PARA PISOS Y MULTICANCHAS DE ALTO TRAFICO (TRICOLOR)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(393, '990000071991417', 'SIERRA PERFORADORA 3\"(76MM)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(394, '990000071991418', 'BI,METAL LOCHSAGE 92MM 3 5/8(WURTH)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(395, '990000071991419', '(STARRETT) SIERRA PERFORADORA 2\"(51MM)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(396, '990000071991420', '(STARRETT) SIERRA PERFORADORA 11/4 (32MM)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(397, '990000071991421', '(STARRETT) SIERRA PERFORADORA 11/2 38MM', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(398, '990000071991423', 'SOLDADURA ELECT WTC-34 1/8 SEM-000320085', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(399, '990000071991424', 'SIRRA PERFORADORA 1.5/8(41MM)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(400, '990000071991425', 'SOLDADURA DE COBRE', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(401, '990000071991426', 'CARS SUPER- POWER IRRADIATION LAMP 60860', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(402, '990000071991427', 'PROYECTOR LED 30W LUZ BLANCA 10-30V DC(HULUX)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(403, '990000071991428', 'LUZ DE DIA 22W 6500K/865 (WESTINGHOUSE)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(404, '990000071991429', 'PROYECTOR DE AREA 10W AC220-240V (LED KM)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(405, '990000071991430', 'LED REFLECTOR 20W 10-30V (ARS)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(406, '990000071991431', 'LED REFLECTOR 30W 10-30V (ARS)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(407, '990000071991432', 'LED PROYECTOR 150W 220-240V(JIE ILUMINACION)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(408, '990000071991433', 'PANEL LED SOBREPUESTO 12W 85-265V (LED KM)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(409, '990000071991434', 'LED PROYECTOR 30W 12V(JIE ILUMINACION)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(410, '990000071991435', 'LED LUZ NEUTRA 30X 25W AC160-265V (MCASA)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(411, '990000071991436', 'LED PANEL SURFACE LIGHT (SAVE) 24W-WHITE AC175-265V', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(412, '990000071991437', 'PERNO HEXAGONAL M12X70', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(413, '990000071991438', 'PERNO HEXAGOANAL M12X60', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(414, '990000071991439', 'PERNO HEXAGONAL M12X60', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(415, '990000071991440', 'PERNO HEXAGONAL M16X70', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(416, '990000071991441', 'TORNILLO MARIPOSA', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(417, '990000071991442', 'PERNO HEXAGONAL M12X75', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(418, '990000071991443', 'REMACHE DE 3/16X 1/2', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(419, '990000071991444', 'TUERCA HEXAGONAL M12-1,75', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(420, '990000071991445', 'TUERCA HEXAGONAL M18', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(421, '990000071991446', 'PERNO PARKER C. CILINDRICA M8X50', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(422, '990000071991447', 'TUERCA HEXAGONAL M16-2', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(423, '990000071991448', 'PERNO HEXAGONAL M5X50', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(424, '990000071991449', 'PERNO HEXAGONAL M8X30', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(425, '990000071991450', 'PERNO HEXAGONAL M10X7O DIN933', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(426, '990000071991451', 'PERNO HEXAGONAL M6X60 DIN933', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(427, '990000071991452', 'PERNO HEXAGONAL M8X50 DIN 933', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(428, '990000071991453', 'PERNO HEXAGONAL M8X70 DIN 933', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(429, '990000071991454', 'PERNO HEXAGONAL M6X70 DIN933', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(430, '990000071991455', 'TUERCA HEXAGONAL M10', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(431, '990000071991456', 'PERNO HEXAGONAL M8X60 INOXIDABLE A2(304)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(432, '990000071991457', 'PERNO PARKER CABEZA PLANA M6X50', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(433, '990000071991458', 'TUERCA HEXGONAL M10X1.5 DIN 934', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(434, '990000071991459', 'TUERCA HEXAGONAL INOXIDABLE 304 3/8 UNC', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(435, '990000071991460', 'PERNO PARKER CABEZA CILINDRICA DIN 912 M5X50', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(436, '990000071991461', 'PERNO HEXAGONAL HILO TOTAL DIN 933 M5X50', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(437, '990000071991462', 'PERNO PARKER CABEZA CILINDRICA DIN 912 M5X30', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(438, '990000071991463', 'PERNO PARKER CILINDRICO DIN912 M6X30', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(439, '990000071991464', 'TUERCA C/SEGURO NYLON M6-1', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(440, '990000071991465', 'PERNO PARKER CABEZA PLANA M8X25', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(441, '990000071991466', 'TUERCA HEXAGONAL 1/2 UNC', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(442, '990000071991467', 'PERNO PARKER CABEZA CILINDRICA M5X20', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(443, '990000071991468', 'TORNILLO HEXAGONAL M8X25', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(444, '990000071991469', 'TORNILLO AUTOPERFORANTE C.LENTEJA 1.5/8', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(445, '990000071991470', 'TONILLO VOLCANITA PUNTA BROCA 1.5X8', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(446, '990000071991471', 'TONILLO VOLCANITA PUNTA BROCA 1.2X8', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(447, '990000071991472', 'PERNO DE ANCLAJE 1/4X2.3/4', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(448, '990000071991473', 'AUTOPERFORANTE HEX C/GOL NEOPRE 12-14X2\"', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(449, '990000071991474', 'AUTOPERF HEX C/GOL NEOPRE 12X1\"', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(450, '990000071991475', 'PERNO HEX 5/16-18X5/8', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(451, '990000071991477', 'TORNILLO DYWALL ROSCA MADERA 8X3', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(452, '990000071991478', 'PERNO PARKER CABEZA REDONDA 10X50', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(453, '990000071991479', 'PERNO PARKER CABEZA REDONDA 10X60', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(454, '990000071991480', 'TUERCA SEG INOXIDABLE M8-1.25', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(455, '990000071991481', 'TUERCA HEXAGONAL SEGURO M12', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(456, '990000071991482', 'PERNO PARKER CABEZA CILINDRICA 10X20', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(457, '990000071991483', 'POMEL DE 3/4', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(458, '990000071991484', 'POMEL DE 1/2 X50', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(459, '990000071991485', 'PERNO DE ANGLAJE 5,8X150', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(460, '990000071991486', 'PERNO DE ANGLAJE 5,8X75', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(461, '990000071991487', 'PERNO DE ANGLAJE M16', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(462, '990000071991488', 'RUEDA PARA PORTONES', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(463, '990000071991489', 'ABRAZADERA PARA RIEL 25MM', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(464, '990000071991490', 'ABRAZADERA PARA RIEL DE 32MM', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(465, '990000071991491', 'ABRAZADERA PARA RIEL 3/4', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(466, '990000071991501', 'INTERRUPTOR', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(467, '990000071991502', 'CONTROLADOR CONFIGURABLE Fuzzy. 1 salida rele. 1 alarma. entradas:PT100/ TC. 48x48 mm', '', NULL, 2.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2026-01-12 19:42:29', NULL),
(468, '990000071991503', 'GUARDAMOTOR 40.6 3AMP PB2ME10 TE14658', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(469, '990000071991505', 'RELE MOTO CIRCUITO GV2P16 TE92582', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(470, '990000071991506', 'GUARDAMOTOR MMS - 32H REG 4-6 AMCU', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(471, '990000071991507', 'INTERRUPTOR DE SEGURIDAD AZ 16-12ZVRK.M16 1966118', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(472, '990000071991508', 'INTERRUPTOR DIFERENCIAL A9R50225 2P 25A 300MA', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(473, '990000071991509', 'INTERRUPTOR DE POSICION XCKJ10541 FIN DE CARRERA TE10942', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(474, '990000071991510', 'PILOTO MONOB LED 22MM (FNX)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(475, '990000071991511', 'CARTOUCHES FUSIBLES 8.5X31.5', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(476, '990000071991512', 'CONTACTO AUX FRONTAL LADN20', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(477, '990000071991513', 'BOTONERA TJ-AG-0818-K3 80x180x70 IP66', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(478, '990000071991514', 'TERMOCONTRAIBLE AZUL 9/4.5 MM', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(479, '990000071991515', 'TERMOCONTRAIBLE AZUL 4.5/2.25 MM', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(480, '990000071991516', 'TERMOCONTRAIBLE AZUL 2.0/ 1.0 MM', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(481, '990000071991517', 'TERMOCONTRAIBLE AZUL 18/9', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(482, '990000071991518', 'TERMOCONTRAIBLE ROJO 18/9', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(483, '990000071991519', 'TERMOCONTRAIBLE ROJO 9/4.5 MM', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(484, '990000071991520', 'TERMOCONTRAIBLE ROJO 2.0/1.0 MM', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(485, '990000071991521', 'TERMOCONTRAIBLE ROJO 4.5/2.25CMM', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(486, '990000071991522', 'TERMOCONTRAIBLE BLANCO 9.0/4.5 MM', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(487, '990000071991523', 'TERMOCONTRAIBLE BLANCO 18/9 MM', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(488, '990000071991524', 'TERMOCONTRAIBLE BLANCO 4.5/2.25 MM', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:21', '2025-12-30 16:34:21', NULL),
(489, '990000071991525', 'TERMOCONTRAIBLE BLANCO 2/1 MM', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(490, '990000071991526', 'TERMOCONTRAIBLE BLANCO 2.0/1.0 MM', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(491, '990000071991527', 'TERMOCONTRAIBLE VERDE 18/9 MM', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(492, '990000071991528', 'TERMOCONTRAIBLE VERDE 4.5/2.25 MM', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(493, '990000071991529', 'TERMOCONTRAIBLE VERDE 2/1 MM', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(494, '990000071991530', 'TERMOCONTRAIBLE NEGRO 5MM', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(495, '990000071991531', 'TERMOCONTRAIBLE NEGRO 4.5/2.25 MM', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(496, '990000071991532', 'TERMOCONTRAIBLE NEGRO 9.0/4.5 MM', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(497, '990000071991533', 'TERMOCONTRAIBLE NEGRO 2/1 MM', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(498, '990000071991534', 'CONECTOR EMT 25MM', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(499, '990000071991535', 'CONECTOR EMT 20 MM', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(500, '990000071991536', 'TUERCA RESORTE', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(501, '990000071991537', 'MORDASA RIEL', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(502, '990000071991538', 'VALVULA DE BOLA ACERO 3/4', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(503, '990000071991539', 'VALVULA DE BOLA ACERO DN 20', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(504, '990000071991540', 'VALVULA DE BOLA ACERO DN 1550', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(505, '990000071991541', 'VALVULA DE BOLA ACERO 1 1/2', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(506, '990000071991542', 'SOPORTE DE FRL', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(507, '990000071991543', 'CONECTOR PARA FLEXIBLE 21MM', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(508, '990000071991544', 'CONECTOR PARA FLEXIBLE 32MM', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(509, '990000071991545', 'CONECTOR PARA FLEXIBLE 50MM', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(510, '990000071991546', 'CONECTOR CURVO METALICO 25MM', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(511, '990000071991547', 'CONECTOR CURVO METALICO 32MM', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(512, '990000071991548', 'CONECTOR TUBO EMT 32M', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(513, '990000071991549', 'CONECTOR EMT 50M', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(514, '990000071991550', 'CONECTOR DE 20 MM', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(515, '990000071991551', 'COPLA DE ALUMINIO 25MM', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(516, '990000071991552', 'TERMINAL METALICO 25MM', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(517, '990000071991553', 'TERMINAL METALICO 20MM', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(518, '990000071991554', 'COPLA DE ALUMINIO 32MM', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(519, '990000071991555', 'ABRAZADERA DE TORNILLO 25M', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(520, '990000071991556', 'ABRAZADERA DE TORNILLO 32M', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(521, '990000071991557', 'ABRAZADERA OMEGA 25MM', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(522, '990000071991558', 'ABRAZADERA OMEGA 32MM', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(523, '990000071991559', 'ABRAZADERA DE TORNILLO 40MM', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(524, '990000071991560', 'PRENSA ESTOPA PG11', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(525, '990000071991561', 'PRENSA ESTOPA PG16', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(526, '990000071991562', 'PRENSA ESTOPA PG13.5', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(527, '990000071991563', 'PRENSA ESTOPA PG20', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(528, '990000071991564', 'PRENSA ESTOPA PG21', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(529, '990000071991565', 'PRENSA ESTOPA PG24', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(530, '990000071991566', 'PRENSA ESTOPA PG29', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(531, '990000071991567', 'PRENSA ESTOPA M25X1.5', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(532, '990000071991568', 'STATER CEBADOR DE SEGURIDAD', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(533, '990000071991569', 'PILOTO LED 22M ROJO', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(534, '990000071991570', 'PERNOS DE ANGLAJE GALVANIZADOS', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(535, '990000071991571', 'CADENAS DE ACOPLAMIENTO 1/2 PASO', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(536, '990000071991572', 'PLACA BASE 1 MODULO', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(537, '990000071991573', 'PLACA BASE 2 MODULOS', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(538, '990000071991574', 'PLACA BASE 3 MODULOS', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(539, '990000071991575', 'TAPA CIEGA METALICA', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(540, '990000071991576', 'PORTA MODULO', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(541, '990000071991577', 'BASE TOMA CORRIENTE', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(542, '990000071991578', 'TOMA CORRIENTE TRIPLE 10 AMP', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(543, '990000071991579', 'ENCHUFE HEMBRA 10-16 AMP', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(544, '990000071991580', 'ENCHUFE MACHO 10-16 AMP', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(545, '990000071991581', 'Tungsteno 2% Thorio 3/32 2.4Mmx Tg332K', '', 10, 10.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2026-01-20 12:11:07', NULL),
(546, '990000071991582', 'VARILLAS DE TUNGSTENO 3.2MMX175MM', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(547, '990000071991583', 'VARILLAS DE TUNGSTENO 1.6MMX175MM', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(548, '990000071991584', 'SIERRAS PERFORADORAS 1.5/8(41MM)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(549, '990000071991585', '(IRWIN) BROCA PARA CONCRETO 3.0MMX75MM', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(550, '990000071991586', '(ALPEN) BROCA PARA CONCRETO 5.0MMX85MM', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(551, '990000071991587', '(Alpen) Broca Para Concreto 4.0Mmx75Mm', '', 32, 0.00, 0.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2026-01-21 15:16:01', NULL),
(552, '990000071991588', '(Alpen) Broca Para Concreto 3.0Mmx60Mm', '', 10, 0.00, 0.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2026-01-21 18:30:49', NULL),
(553, '990000071991589', 'BROCA PARA CONCRETO 10mmx150MM(IRWIN)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(554, '990000071991590', 'BROCA PARA CONCRETO 12.0MMX150MM(ALPEN)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(555, '990000071991591', 'BROCA PARA CONCRETO 12.0MM(KRAFT)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(556, '990000071991592', '(IRWIN) BROCA PARA CONCRETO 8.0MMX 120MM', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(557, '990000071991593', 'BROCA PARA CONCRETO 16.0MMX150MM(ALPEN)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(558, '990000071991594', '(COBALTO) BROCA PARA CONCRETO 4MM', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(559, '990000071991595', 'BROCA PARA CONCRETO 20.0MM(MAYKESTAG)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(560, '990000071991596', 'BROCA PARA CONCRETO 20.0MM(DEBOR)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(561, '990000071991597', 'BROCA PARA CONCRETO 12MM(ECEF)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(562, '990000071991598', 'BROCA PARA CONCRETO 8MM(ECEF)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(563, '990000071991599', 'BROCA PARA CONCRETO 10MM(ECEF)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(564, '990000071991600', 'MACHOS DE ROSCAR(URANGA)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(565, '990000071991601', 'PIERDRA DE DESBASTAR', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(566, '990000071991602', 'COLLET 2.4 p10n24(PARKER)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(567, '990000071991603', 'GAS LENS BODY 3/32 P45V26', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(568, '990000071991604', 'STANDARD COLLET BODY 3/32/24MM(PARKER)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(569, '990000071991605', 'GAS LENS BODY 1/8/ 32MM P45V27', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(570, '990000071991606', 'BLACK CAP SHHORT P57Y04', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(571, '990000071991607', 'GAS LENS 1/2 13MM P54N14', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(572, '990000071991608', 'BLACK CAP LONG P57Y02', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(573, '990000071991609', 'BLACK CAP SHORT P57Y04', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(574, '990000071991610', 'CINTAS DE TEFLON 50X0.1X3/4(AQUAFIT)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(575, '990000071991611', 'CINTA DE TEFLON 1P(25.40MM)X10M (TOPEX)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(576, '990000071991612', 'TEFLON MAESTRO 3/4 (TAUMM)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(577, '990000071991613', 'TEFLON 1/2 AMARILLO (TAUMM)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(578, '990000071991614', 'PICAPORTE DE AUMINIO 2', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(579, '990000071991615', 'CERRADURA DE PUERTA CORREDERA(ODIS)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(580, '990000071991616', 'PICAPORTE DORADA 3(UYUSTOOLS)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(581, '990000071991617', 'PICAPORTE DE ALUMINIO 500/60MM (AMIG)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(582, '990000071991618', 'KIT DE EMERGENCIA LED (JIE)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(583, '990000071991619', 'FUENTE SWITCHING 12V FAX 06 (MEAN WELL)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(584, '990000071991620', 'TOPES PARA PUERTAS (FERRETOOLS)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(585, '990000071991621', '(NORTON) LIJA FIERRO METAL 225X275MM 120 ALOX', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(586, '990000071991622', '(NORTON) LIJA PARA MADERA A257 180 ALOX', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(587, '990000071991623', 'CERRADURA DE SOBREPONER (SCANAVINI)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(588, '990000071991624', 'CERRADURA DE POMOS (SCANAVINI)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(589, '990000071991625', 'CERRADURA EMBUTIDA (DUCASSE)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(590, '990000071991626', 'CERRADURA DE EMBUTIR CON MANILLA(SCANAVINI)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(591, '990000071991627', 'PLIEGO DE LIJA GRANO 40(HEMIC)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(592, '990000071991628', 'DISCO DE CORTE 115X22.23MM (HEMIC)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(593, '990000071991629', 'DISCO DE DESBASTE PARA ARCO/ACERO (W-MAX)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(594, '990000071991630', 'DISCO ABRASIVO PARA LIMPIEZA Y PULIDO 7P 1200 (PULINOX)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(595, '990000071991631', 'DISCO ABRASIVO PARA LIMPIEZA Y PULIDO 5P240 (PULINOX)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(596, '990000071991632', 'DISCO DE CORTE 4 1/2', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(597, '990000071991633', 'DISCO ACONDICIONADOR DE SUPERFICIE CAFÉ (3M)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(598, '990000071991634', 'DISCO ACONDICIONADOR DE SUPERFICIE MORADO (3M)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(599, '990000071991635', 'DISCO DE CORTE DIAMANTADO115X22.23MM EN 13236(WURTH)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(600, '990000071991636', 'DISCO DE DESBASTE METAL(NORTON)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(601, '990000071991637', 'DISCO FLAP ARCO W-MAX 115MM(WURTH)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(602, '990000071991638', 'DISCO DE DESBASTE 27E-4-4850(TYROLIT)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(603, '990000071991639', 'DISCO DE CORTE 41F-19-5662 (TYROLIT)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(604, '990000071991640', '(SIA) DISCO LIJA RESPALDO 24', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(605, '990000071991641', 'DISCO DE CORTE 41-180X1.6X22.23MM (ATLAS)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(606, '990000071991642', 'DISCO DE CORTE DE CERAMICA E Y PORCELANATO 180X22.23MM(NORTON)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(607, '990000071991643', 'DISCO DE CORTE 230X3.0X22.23 (RASTA)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL);
INSERT INTO `insumos` (`id`, `codigo_sku`, `nombre`, `descripcion`, `categoria_id`, `stock_actual`, `stock_minimo`, `stock_critico`, `precio_costo`, `moneda`, `unidad_medida`, `imagen_url`, `created_at`, `updated_at`, `deleted_at`) VALUES
(608, '990000071991644', 'DISCO DE RESPALDO 3M 01917', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(609, '990000071991645', 'DISCO DE RESPALDO EN13743(DRONCO)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(610, '990000071991646', 'DISCO DE CORTE DE METAL 355X2.8X25MM', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(611, '990000071991647', 'FRAGUAE ESTÁNDARD GRIS (BEKRON)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(612, '990000071991648', 'FRAGUAE ESTÁNDARD BLANCO (BEKRON)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(613, '990000071991649', 'SOLDADURA ELECTRODO 170-LA 1KG (H&H)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(614, '990000071991650', 'SOLDADURA ELECTRODO 1/8AWS E.6011 (H&H)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(615, '990000071991651', 'SOLDADURA ELECTRODO 3/32 (H&H)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(616, '990000071991652', 'SOLDADURA ELECTRODO 3/32 E7018 KRAFTER', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(617, '990000071991653', 'SOLDADURA E-7018 3/32(SOLWELD)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(618, '990000071991654', 'SOLDADURA 2.50X350MM (ROYAL)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(619, '990000071991655', 'TARUGO BROCA', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(620, '990000071991656', 'TARUGO PALOMA VOLCANITA', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(621, '990000071991657', 'BUSHA DE GESSO', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(622, '990000071991658', 'BOQUILLAS DE GOTEO', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(623, '990000071991659', 'GRAPA PARA CABLE', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(624, '990000071991660', 'PICAPORTE DE PRESION', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(625, '990000071991661', 'PERNO CON TUERCA', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(626, '990000071991662', 'ARANDELA DE HIERRO', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(627, '990000071991663', 'PERNO PRISIONERO 6X20', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(628, '990000071991664', 'PERNO PRISIONERO M10X20', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(629, '990000071991665', 'PERNO PRISIONERO 6X10', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(630, '990000071991666', 'TUERCA HEXAGONAL GALVANIZADA M12', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(631, '990000071991667', 'TUERCA HEXAGONAL INOXIDABLE M8', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(632, '990000071991668', 'PERNO PARKER CABEZA CILINDRICA HILO TOTAL M6X40/40', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(633, '990000071991669', 'PERNO PRISIONERO 8X20', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(634, '990000071991670', 'REMACHE 3X10', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(635, '990000071991671', 'REMACHE 5X30', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(636, '990000071991672', 'REMACHE 5X15', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(637, '990000071991673', 'TACO DE ANCLAJE', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(638, '990000071991674', 'PERNO PARTIDO DE BRONCE', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(639, '990000071991675', 'PASADOR DE ACERO INOXIDABLE', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(640, '990000071991676', 'GOLILLA PLANA M22', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(641, '990000071991677', 'GOLILLA PLANA 5/8', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(642, '990000071991678', 'GOLILLA PLANA 3/4', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(643, '990000071991679', 'GOLILLA A PRESION M16', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(644, '990000071991680', 'GOLILLA DE PRESION 3/4', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(645, '990000071991681', 'GOLILLA PRESION', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(646, '990000071991682', 'GOLILLA PRESION 1/2', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(647, '990000071991683', 'TORNILLO HEXAGONAL M10X25', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(648, '990000071991684', 'TERMINAL TUBO METALICO 25MM', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(649, '990000071991685', 'TEMINAL TUVO METALICO 20MM', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(650, '990000071991686', 'TUERCA HEXAGONAL M8X12', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(651, '990000071991687', 'PERNO PARKER C.REDONDA M10X35', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(652, '990000071991688', 'PERNO PARKER C.REDONDA M10X20', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(653, '990000071991689', 'CLAVO DE 3.5X2.1/2', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(654, '990000071991690', 'CLAVO 3X2.5', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(655, '990000071991691', 'TUERCA HEXAGONAL INOXIDABLE M6.1', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(656, '990000071991692', 'REMACHE 5X25', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(657, '990000071991693', 'REMACHE 5X40', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(658, '990000071991694', 'AUTOPERFORANTE HEX C/GOLILLA NEOPRE 12-14X3', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(659, '990000071991695', 'CHAPA PLASTICO METAL NEGRA', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(660, '990000071991696', 'TUERCA BISHING GALVANIZADA 20MM', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(661, '990000071991697', 'TUERCA HEXAGONAL GALVANIZADA M10', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(662, '990000071991699', 'TUERCA HEXAGONAL SEGURO M16', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(663, '990000071991700', 'PRISIONERO ALLEN M12X100', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(664, '990000071991701', 'EJE DE TUBI MODELO LARGO NUEVO', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(665, '990000071991702', 'EJE DE TUBO MODELO CORTO NUEVO', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(666, '990000071991703', 'EJE DE TUBI MODELO LARGO ANTIGUO', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(667, '990000071991704', 'EJE DE TUBI MODELO CORTO ANTIGUO', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(668, '990000071991705', 'EJES TENSORES', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(669, '990000071991706', 'POLEAS DENTADAS DE 20', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(670, '990000071991707', 'POLEAS DENTADAS DE 15', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(671, '990000071991708', 'GOLILLA PLANA M10', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(672, '990000071991709', 'TORNILLO LENTEJA PUNTA FINA 8X1', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(673, '990000071991710', 'GOLILLA PLANA 5/16', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(674, '990000071991711', 'TORNILLO HEXAGONAL M6X20', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(675, '990000071991712', 'PERNO PRIOSIONERO ALLEN M8X10', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(676, '990000071991713', 'REMACHE 4X13', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(677, '990000071991714', 'TORNILLO LENTEJA PUNTA BROCA 8X1/2', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(678, '990000071991715', 'TARUGO VOLCAN METAL M13X42', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(679, '990000071991716', 'ROSCALATA 6X1 1/4', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(680, '990000071991717', 'ABRAZADERA 13-23 MM', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(681, '990000071991718', 'ABRAZADERA 14.2X26.9', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(682, '990000071991719', 'ABRAZADERA 21-38MM', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(683, '990000071991720', 'ABRAZADERA 8-12MM', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(684, '990000071991721', 'ABRAZADERA 6-16MM', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(685, '990000071991722', 'ABRAZADERA 14-27MM', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(686, '990000071991723', 'BARRA TETRAPOLAR 400411', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:22', '2025-12-30 16:34:22', NULL),
(687, '990000071991724', 'BARRA TETRAPOLAR 400408', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(688, '990000071991725', 'PUNTAS DE PRUEBA FK35044', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(689, '990000071991726', 'FILTRO DE ACEITE W940/1', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(690, '990000071991727', 'VALVULA SODENOIDE US-20', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(691, '990000071991728', 'VALVULA SODENOIEDE UW-10-25', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(692, '990000071991729', 'ESCOBILLA COPA TWISTED', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(693, '990000071991730', '(TRANSLINK) RODAMIENTO UFL002', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(694, '990000071991731', 'CADENA(SEDIS)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(695, '990000071991732', 'PREMIUM ROLLER CHAIN 29I12', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(696, '990000071991733', 'CADENA 40-1 (SEDIS)', '', NULL, 0.00, 2.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2026-01-12 16:50:32', NULL),
(697, '990000071991734', 'CHUMACERA UCF210(TIMKEN)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(698, '990000071991735', 'CHUMACERA TP-F207 (KML)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(699, '990000071991736', 'CONECTOR CURVO METALICO 21MM', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(700, '990000071991737', 'CHUMACERA F207 WHITE(TRANSLINK)', '', NULL, 0.00, 2.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2026-01-12 16:44:38', NULL),
(701, '990000071991738', 'CHUMACERA UFF205(TIMKEN)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(702, '990000071991739', 'FY50TF', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(703, '990000071991740', 'RODAMIENTO UFL002(A', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(704, '990000071991741', 'PORTAF.UNIP.10x38(VITEL)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(705, '990000071991742', 'BISAGRA ALUMINIO SATIN 145MM', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(706, '990000071991743', 'MODULO INTERRUPTOR 9/12 C/PILOTO 5001LCH', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(707, '990000071991744', 'PULSADOR ROJO XB4BP42', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(708, '990000071991745', 'CABEZAL PULSADOR TE53305', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(709, '990000071991746', 'CORDON DE ORRIN 8X3MTS', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(710, '990000071991747', 'CORDON DE ORRIN 6X2 MTS', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(711, '990000071991748', 'TOPE PARA PUERTA (FIXSER)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(712, '990000071991749', 'PULSADOR HONGO ROJO TE45050', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(713, '990000071991750', 'CONTROLADOR DE PID FUXXY 1 SALIDA PT100', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(714, '990000071991751', 'PULSADOR VERDE TE48333', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(715, '990000071991752', 'PULSADOR BLANCO TE48441', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(716, '990000071991753', 'INTERUPTOR SELECCIONADOR ROTATIVO 3X8 221 06', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(717, '990000071991754', 'FLUORECENTE SOBREPUESTO 2X26W (FOCO)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(718, '990000071991755', 'ENCHUFE TRIFASICO HEMBRA 3P+N+T 16A-6H/200-346V 555359', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(719, '990000071991756', '(TRUPER) PUNTA DE CARBURO DE TUNGSTENO 5/16', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(720, '990000071991757', 'BROCA CON RANURA DE POTENCIA', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(721, '990000071991758', 'MACHOS DE ROSCAR M4X0.70', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(722, '990000071991759', '(URANGA) MACHOS DE ROSCAR M6X1.00', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(723, '990000071991760', 'MACHO DE ROSCAR M18(GSR)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(724, '990000071991761', '(WURTH) CORONA HSS ROMPERITUTAS COMPL D=22', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(725, '990000071991762', '(COBALTO) BROCA PARA CONCRETO 10MM', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(726, '990000071991763', 'BROCA PARA CONCRETO 12MM(COBALTO)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(727, '990000071991764', 'BROCA DE 4 PUNTAS 8X160MM(HEMIC)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(728, '990000071991765', 'BROCA DE 4 PUNTAS 10X60MM(HEMIC)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(729, '990000071991766', 'BROCA 160/100MM(WURTH)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(730, '990000071991767', 'BROCA 210/150(WURTH)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(731, '990000071991768', '(COBALTO) BROCA PARA CONCRETO 8MM', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(732, '990000071991769', 'BROCA DE CONCRETO 22MM(DELTA)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(733, '990000071991771', '(COBALTO) BROCA PARA CONCRETO 5MM', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(734, '990000071991772', '(COBALTO) BROCA DE CONCRETO 6MM', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(735, '990000071991773', 'FRESA ESCALON ZEBRA 4:30MM', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(736, '990000071991774', '(JK) BROCA COBALTO 3.10MM', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(737, '990000071991775', 'BROCA PARA CONCRETO 16MM(COBALTO)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(738, '990000071991776', '(JK) BROCA COBALTO 6.50MM', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(739, '990000071991777', 'TUERCA DE BUSHING 20MM', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(740, '990000071991778', 'PERNO PARKER C.REDONDA M6X12MM', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(741, '990000071991779', 'TUERCA HEXAGONAL M5X0,8', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(742, '990000071991780', 'PERNO PRISIONERO 6X10MM', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(743, '990000071991781', 'TUERCA HEXAGONAL M6-1', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(744, '990000071991782', 'PERNO PRISIONERO 6X30MM', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(745, '990000071991783', 'TUERCA C/SEGURO M5-0.8', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(746, '990000071991784', 'TUERCA HEXAGONAL GALVANIZADA 5/16', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(747, '990000071991785', 'PERNO HEXAGONAL HILO COMPLETO M6X30', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(748, '990000071991786', 'TORNILLO LENTEJA PUNTA BROCA 8X3/4', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(749, '990000071991787', 'PERNO PARKER C.CILINDRICA M5X20', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(750, '990000071991788', 'GOLILLA PLANA M12', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(751, '990000071991789', 'GOLILLA PRESION M12', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(752, '990000071991791', 'PERNO PARKER C.CILINDRICA M6X12', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(753, '990000071991792', 'GOLILLA PRESION M10', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(754, '990000071991793', 'ELETROVALVULA EN1', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(755, '990000071991794', 'SOPORTE AC30 TIPO T MODULAR Y300T', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(756, '990000071991795', 'RACOR DE 3/8 PARA MANGUERA DE 10MM CONECTOR RECTO T10X3/8in NIQUE (KQ2H10-03NS)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(757, '990000071991796', 'SILEN PLASTIC.COMPACTO 1/SIN', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(758, '990000071991797', 'CONECTOR RECTO T06X1 KQ2H06-02NS', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(759, '990000071991798', 'CONECTOR CODO T10X3/8IN KQ2L10-03NS', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(760, '990000071991799', 'CONECTOR CODO T/08 KQG2L08-01S', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(761, '990000071991800', 'CONECTOR RECTO 08X1 KQ2H08-02NS', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(762, '990000071991801', 'CONECTOR RECTO T 10X1 KQ2H10-04NS', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(763, '990000071991802', 'CONECTOR RECTO 10X3 KQ2H10-03NS', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(764, '990000071991803', 'FIL-REG-LUB 1/2 MANOM PUR/NA AC40-04DE-B', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(765, '990000071991804', 'TEMPORIZ.24-240VAC/DC 8201', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(766, '990000071991805', 'KQG2H10-04S', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(767, '990000071991806', 'VAL.REG.FLUJO T/10', '', NULL, 4.00, 2.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2026-01-12 19:04:47', NULL),
(768, '990000071991807', 'PERNO D1=25L1=242X5CRNI18-10', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(769, '990000071991808', 'BLACKET TIPO T FRL 40 Y400T-A', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(770, '990000071991809', 'VALVULA 3/2 MANUAL VHS40-04B', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(771, '990000071991810', 'CONECTO CODO T 06X3/8IN KQ2L06-03NS', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(772, '990000071991811', 'KQ2H06-02NS', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(773, '990000071991812', 'VAL.5/3 VSH431A-03', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(774, '990000071991813', 'FILTRO AIRE 1/4 AUTO DRENAJE AF30-02D-A', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(775, '990000071991814', 'CONECTO PASAMURO T KQ2E06-00N', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(776, '990000071991815', 'RACOR REDUCTOR NEUMATICO DE 10MM A 8MM CONECTOR NIPLE REDUCTOR T08 A T10 (KQ2H08-10A)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(777, '990000071991816', 'SILENCI.PLASTICO 3/8IN AN30-03', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(778, '990000071991817', 'CONEC.CODO T06X1/4IN KQ2L06-02NS', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(779, '990000071991818', 'AR30-02E-B', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(780, '990000071991819', '3415M1-C1-A', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(781, '990000071991820', 'CONECTOR CODO INOX KQG2L10-04S', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(782, '990000071991821', 'SILENCIADOR CORTO BRONCE 3/8 EBKX-L7006-040', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(783, '990000071991822', 'REGULADOR DE PRESION AR30-02E-B', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(784, '990000071991823', 'VAL.3/2 VT317-5D7-02', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(785, '990000071991824', 'VALVULA 3/2 MANUAL 1/2', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(786, '990000071991825', 'VT317-5DZ-02', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(787, '990000071991826', 'FILTRO REGULADOR 3/4 AW40-06BDE-B', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(788, '990000071991827', 'VALVULA MANUAL 3/4 VHS30-02B', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(789, '990000071991828', 'SILEN.PLASTICO .COMPACTO 1/4 AN15-02', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(790, '990000071991829', 'VAL.5/3 S/S CERRADO 24VDC CJ VFS3300-5FZ-03', '', NULL, 2.00, 1.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2026-01-12 19:11:03', NULL),
(791, '990000071991830', 'REGULADOR DE FLUJO T/10MMX1/2 AS4201F-U04-10A', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(792, '990000071991831', 'SOPORTE AC30 TIPO T MODULAR Y300T-A', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(793, '990000071991832', 'VAL.5/3 S/S VFS2320-5DZ-02', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(794, '990000071991833', 'PERNO DISTANCIADOR D=20 H9 L1=163,5X5CRNI18-10', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(795, '990000071991834', 'JS31-ST20AN-3S', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(796, '990000071991835', 'AR40-04BE-B', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(797, '990000071991836', 'LUBRICADOR 1/4 CJ AL30-02-D', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(798, '990000071991837', 'RACOR DE 3/8 PARA MANGUERA DE 8MM / CONECTOR RECTO T08 X 3/8in (KQ2H08-03NS)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(799, '990000071991838', 'CONEC TUBO 06 KQ2T06-00A', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(800, '990000071991839', 'KQG2L10-04S', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(801, '990000071991840', 'VALVULA 3X2 MANUAL VHS30-02B', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(802, '990000071991841', 'KQ2LO08-01NS', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(803, '990000071991842', 'REG DE FLUJO T/10MM AS4201F-U04-10A', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(804, '990000071991843', 'CONEC RECTO T10X1/2IN INOX KGH10-04S', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(805, '990000071991844', 'CASQUILLO 3410', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(806, '990000071991845', 'CONECTOR CODO T06X3/8 KQ2L06-03NS', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(807, '990000071991846', 'CONEC.RECTO T04XT06MM KQ2H04-06A', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(808, '990000071991847', 'Y300T', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(809, '990000071991848', 'KQ2L08-01NS', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(810, '990000071991849', 'RACOR L NEUMATICO DE 1/4\" PARA MANGUERA DE 8MM CONECTOR CODO T08 1/4in (KQ2H08-02AS)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(811, '990000071991850', 'S.S FILTER SD2050', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(812, '990000071991851', 'SENSOR IME18-08BPSXCOS', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(813, '990000071991852', 'BOTONERAS', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(814, '990000071991853', 'PLIEGO DE LIJA 220', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(815, '990000071991854', 'SELLO MECANICO ESTILO 491/DIN', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(816, '990000071991855', 'CONECTOR CURVO 32MM', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(817, '990000071991856', 'RETEN 25-38-7', '', NULL, 0.00, 4.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2026-01-12 16:50:06', NULL),
(818, '990000071991857', 'TABLERO POLIESTER 400X300X260 SPLACA LEX54320', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(819, '990000071991858', 'CAJA GALVANIZADA 200X100', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(820, '990000071991859', 'RODAMIENTO 6011-2RS1/C3(SKF)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(821, '990000071991860', 'RODAMIENTO 30205J2/Q', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(822, '990000071991861', 'RODAMIENTO 32009X', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(823, '990000071991862', 'PILOTO LED VERDE XB4BVB3 TE47333', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(824, '990000071991863', 'PILOTO LED ROJO XB4BVB4', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(825, '990000071991865', 'MONOMANDO DUCHA(STRETTO)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(826, '990000071991866', 'MANILLA JUEGO 2815(DAP DUCASSE)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(827, '990000071991867', 'VALVULA PARA DESCRAGA DE URINARIO', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(828, '990000071991868', 'BOMBA DAB VA 65/180 (DAB)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(829, '990000071991869', 'BOMBA DAB CIRCULATORA ROTOR (DAB)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(830, '990000071991870', 'SOPLETE DE GAS M-878', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(831, '990000071991871', 'FLOAT FLOTADOR SENSOR DE AGUA SWITCH YC-M15-2', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(832, '990000071991872', 'FLOAT SMITCH 10M', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(833, '990000071991873', 'Controlador Electrico (Bestflow)', '', 2, 2.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2026-01-12 19:41:48', NULL),
(834, '990000071991874', 'GAS REGULATORS (KEBEN)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(835, '990000071991875', 'FECHADURA GIRO 323/55 9210505', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(836, '990000071991876', 'KIT MACANETA 6635/85', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(837, '990000071991877', 'VALVULA PEDAL PISO MURO SIMPLE QK40000-00', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(838, '990000071991878', 'SISTEMA DE CARRO PARA PORTAS D100 DUCASSE', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(839, '990000071991879', 'SISTEMA DE CARRO PARA PORTAS D300 HD', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(840, '990000071991880', 'VALVULA DE DESCARGA BASE 1 1/4((DOCOL)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(841, '990000071991881', 'ACABAMIENTO P/VALVULA DESCRAGA 1505006', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(842, '990000071991882', 'KIT INSTALACION WC(AQUAKIT)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(843, '990000071991883', 'MONOMANDO LAVATORIO COLOMBA', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(844, '990000071991884', 'PLNTA DE RIELES 2017B05524', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(845, '990000071991885', 'VALVULA PARA CHUVEIRO AP (DOCOL)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(846, '990000071991886', 'GRIFO TEMPORIZADOR PARA DUCHA EMPOTRADA(BRIGGS)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(847, '990000071991887', 'CONTROLADOR DSK-9.1 3HP', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(848, '990000071991888', 'I-TRAP30', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(849, '990000071991889', 'CAJA TJ-AG-1212', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(850, '990000071991890', 'CAJA ESTANCO 150X100', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(851, '990000071991891', 'CAJA ESTANCO 200X150', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(852, '990000071991892', 'BIZAGRA S/RET 40', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(853, '990000071991893', 'VENTILADOR INDUSTRIAL 230V 2205717010', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(854, '990000071991894', 'VENTILADOR INDUSTRIAL FJK6623.PB230', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(855, '990000071991895', 'FUENTE DE ALIMENTACION EXTRIOR FAX-75-12V', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(856, '990000071991896', 'CIERRE DE PUERTA HIDRAULICA 707CP-DT-63(SCANAVINI)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(857, '990000071991897', 'CIERRE DE PUERTA HIDRAULICA DLS112', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(858, '990000071991898', 'RF1007-BER', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(859, '990000071991899', 'C5009329', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(860, '990000071991900', '10287332', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(861, '990000071991901', 'REGULADOR DE VELOCIDAD ELECTRONICO REG 3A 960710030', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(862, '990000071991902', 'VISOR 3', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(863, '990000071991903', 'TUBO EXTRAFLEX.MET.C/PVC 1117683312', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(864, '990000071991904', 'FILTRO DE AIRE FK6625.300', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(865, '990000071991905', 'FILTRO DE AIRE 204X204MM JK6623', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(866, '990000071991906', 'RETEN FKM 40-56-7', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(867, '990000071991907', 'RETEN 30-48-7', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(868, '990000071991908', 'RETEN 55-70-10', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(869, '990000071991909', 'RETEN 25-43-7', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(870, '990000071991911', 'PERNO PARKER C/PLANA 5X20', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(871, '990000071991912', 'PERNO PARKER C/PLANA 6X20', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(872, '990000071991913', 'CHAVETA PARTIDA 3/16X2', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(873, '990000071991914', 'CHAVETA PARTIDA 1/4X2', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(874, '990000071991915', 'TUERCA MARIPOSA', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(875, '990000071991916', 'RUEDA ROJA', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(876, '990000071991917', 'AGUA DESTILADA 5 LITROS', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(877, '990000071991918', 'RODAMIENTO 52052RSCD3', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(878, '990000071991919', 'RODAMIENTO 32205J2/Q', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(879, '990000071991920', 'RODAMIENTO 6205-2RSH', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(880, '990000071991921', 'RETEN 30-40-10', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(881, '990000071991922', 'RELE 14P24VDC', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(882, '990000071991923', 'BASE RELE MINI MECLRXZ7G', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(883, '990000071991924', 'ESPIRAL PLASTICO 6MM', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(884, '990000071991925', 'TERMINAL HEMBRA ISLADO 1012AWG', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(885, '990000071991926', 'TERMINAL HORQUILLA 38MM', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(886, '990000071991927', 'SELECTOR MANETA CORTA 3POSIC METALICO NEGRO 22MM', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(887, '990000071991928', 'TERMINA HEMBRA AISLADO 1416AWG AZUL', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(888, '990000071991929', 'TERMINAL HEMBRA ISLADO 1822AWG ROJO', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(889, '990000071991930', 'TERMINAL MACHO AISLADO 14-16AWG AZUL 8061146425', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(890, '990000071991931', 'RELE IND ENCHUFABLE 8 PINES 1717060', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(891, '990000071991932', 'RAPTOR E4 015845', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(892, '990000071991933', 'RAPTOR E4 ELEMENTOS (OMEGA) 10287332', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(893, '990000071991934', 'R80 T90 7 2SS/GLASS REG 19013024', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(894, '990000071991935', 'VALVULA DE LLENADO WC INFERIOR 1/2 (CORSOVALU)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(895, '990000071991936', 'FLUXOMETRO PARA ENTRADA SUPERIOR GEM-2 120-1.6', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(896, '990000071991937', 'VALVULA SOLENOIDE 2 VIAS NC USO VAPOR DE AGUA CALIENTE 1PULGADA', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(897, '990000071991938', 'PT100 CABEZAL ALUMINIO 1/2', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(898, '990000071991939', 'TEMPOZO HI 1/4NPT 1/2', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(899, '990000071991940', 'TERMOMETRO BIMETALICO, VAINA INFERIOR 1/2 100x100', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(900, '990000071991941', 'VALVULA SOLENOIDE 2 VIAS HILO 3/4', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(901, '990000071991942', 'TRANSFORMADOR DE CONTROL 6.622-277.3', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(902, '990000071991943', 'CONTACTOR 3P 25A 1NA1NC 24VAC LC1D25B7 TE17115', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(903, '990000071991944', 'LUZ DE EMERGENCIA CAMER', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(904, '990000071991945', 'SELLO MECANICO PAC-SEAL 1 1/4\" VITON', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(905, '990000071991946', 'CARETA DE SOLDAR', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(906, '990000071991947', 'TORCHA TIG AMT WP26', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(907, '990000071991948', 'REMACHADORA POP DE MANO 17P', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(908, '990000071991949', 'INTERRUPTOR HORARIO DIGITAL SWITCH TIMER CCT15553 SCHNEIDER MG15553', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(909, '990000071991950', 'INTERRUPTOR AUTOMATICO 2x40A 30MA MODULA A9R71240 MGA71240', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(910, '990000071991951', 'LUCES DE EMERGENCIA', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL);
INSERT INTO `insumos` (`id`, `codigo_sku`, `nombre`, `descripcion`, `categoria_id`, `stock_actual`, `stock_minimo`, `stock_critico`, `precio_costo`, `moneda`, `unidad_medida`, `imagen_url`, `created_at`, `updated_at`, `deleted_at`) VALUES
(911, '990000071991952', 'BOMBA SUMERGIBLE BESTFLOW BKS-VIC-750/G', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(912, '990000071991953', '(PETRO CANADA) HYDREX TM/MC AW 68 20L', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(913, '990000071991954', '(PETRO CANADA) ENDURATEX EP 220', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:23', '2025-12-30 16:34:23', NULL),
(914, '990000071991955', 'Bomba Metabisulfito Pump Jabsco MU 01 1400 rpm 0,55kw 3/4', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:24', '2025-12-30 16:34:24', NULL),
(915, '990000071991956', 'ROSCALATA BINDING 6X1 1/4', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:24', '2025-12-30 16:34:24', NULL),
(916, '990000071991957', 'PERNO PARKER CABEZA PLANA M10X50', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:24', '2025-12-30 16:34:24', NULL),
(917, '990000071991958', 'PERNO DE ANCLAJE 3/4 X50', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:24', '2025-12-30 16:34:24', NULL),
(918, '990000071991959', 'INVER.MAR.S.P. 3X30A', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:24', '2025-12-30 16:34:24', NULL),
(919, '990000071991960', 'SELLO CHESTERTON 491/DIN 28M SA SSC/SSC S FKM 641883', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:24', '2025-12-30 16:34:24', NULL),
(920, '990000071991961', 'VALVULA SOLENOIDE 220V - 50 HZ 2\" 0.5-16KG', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:24', '2025-12-30 16:34:24', NULL),
(921, '990000071991962', 'CERRADURA DE MANILLA DORMITORIO OFICINA INOX KARSON', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:24', '2025-12-30 16:34:24', NULL),
(922, '990000071991964', 'MANOMETRO 0 a 10 BAR 1/2P C0173503', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:24', '2025-12-30 16:34:24', NULL),
(923, '990000071991965', 'LLAVE PUNTA CORONA 6MM', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:24', '2025-12-30 16:34:24', NULL),
(924, '990000071991966', 'REDUCCION BUSHING DE 3/4P A 1/2P', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:24', '2025-12-30 16:34:24', NULL),
(925, '990000071991967', 'RETEN 55-75-12', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:24', '2025-12-30 16:34:24', NULL),
(926, '990000071991968', 'FLANGE SII-ON 3\" A105 NEGRO ANSI 150 RF', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:24', '2025-12-30 16:34:24', NULL),
(927, '990000071991969', 'FLANGE SII-ON 2\" A105 NEGRO ANSI 150 RF', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:24', '2025-12-30 16:34:24', NULL),
(928, '990000071991970', 'ELECTROVALVULA SOLENOIDE DE 2\" DE 24 VDC BSP', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:24', '2025-12-30 16:34:24', NULL),
(929, '990000071991971', 'SEGURO SEGERS SEAGERS INTERIOR 47MM INOX', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:24', '2025-12-30 16:34:24', NULL),
(930, '990000071991972', 'SEGURO SEGERS SEAGERS EXTERIOR 16MM INOX', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:24', '2025-12-30 16:34:24', NULL),
(931, '990000071991973', 'SEGURO SEGERS SEAGERS EXTERIOR 20MM INOX', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:24', '2025-12-30 16:34:24', NULL),
(932, '990000071991974', 'SEGURO SEGERS SEAGERS EXTERIOR 22MM INOX', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:24', '2025-12-30 16:34:24', NULL),
(933, '990000071991975', 'SEGURO SEGERS SEAGERS EXTERIOR 25MM INOX', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:24', '2025-12-30 16:34:24', NULL),
(934, '990000071991976', 'SEGURO SEGERS SEAGERS EXTERIOR 32MM INOX', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:24', '2025-12-30 16:34:24', NULL),
(935, '990000071991977', 'JUNTA E-359 1/8P 1 1/4PX150 LBS RF', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:24', '2025-12-30 16:34:24', NULL),
(936, '990000071991978', 'GABINETE POLIESTER 400x300x200 ip65 iIK08 TIP-43 0700805102', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:24', '2025-12-30 16:34:24', NULL),
(937, '990000071991979', 'CABLE CA 1.0mm h05V-K 18AWG NGO -100M 500V 70C 29113 2606113', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:24', '2025-12-30 16:34:24', NULL),
(938, '990000071991980', 'CORDON CABLE H05VVF 3X075MM2 NEGRO 300500V TP803000', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Metros', NULL, '2025-12-30 16:34:24', '2025-12-30 16:34:24', NULL),
(939, '990000071991981', 'TRANSFORMADOR CONTROL 40VA 230/400V 12/24V RIEL DIN 044221 LG044221', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:24', '2025-12-30 16:34:24', NULL),
(940, '990000071991982', 'RELE 11P220V ACRUN31A21P7 TE89109', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:24', '2025-12-30 16:34:24', NULL),
(941, '990000071991983', 'CABLE FLEXTEL 220VVK 12X15MM2 061KV NEGRO 0112001M TP12001', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:24', '2025-12-30 16:34:24', NULL),
(942, '990000071991984', 'INTERRUPTOR AUTOMATICO 2x10A C 10KA A9F77210 MGA77210', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:24', '2025-12-30 16:34:24', NULL),
(943, '990000071991985', 'SELECTOR MANETA CORTA 2POSIC METAL NEGRO 22MM 1NA1NC XB4BD2 TE46255', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:24', '2025-12-30 16:34:24', NULL),
(944, '990000071991986', 'BASE RELE RUZC3M TE71044', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:24', '2025-12-30 16:34:24', NULL),
(945, '990000071991987', 'SELECTOR MANETA CORTA 3POSIC METALICO NEGRO 22MM 2NA XB4BD53 TE46153', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:24', '2025-12-30 16:34:24', NULL),
(946, '990000071991988', 'LUZ PILOTO LED VERDE 24VACVDC 22MM XA2EVB3LC TE44265', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:24', '2025-12-30 16:34:24', NULL),
(947, '990000071991989', 'PLACA MONTAJE 300x250MM TABLERO GW46001F GW46401', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:24', '2025-12-30 16:34:24', NULL),
(948, '990000071991990', 'TERMINAL MACHO AISLADO 1012AWG AMARILLO 8061146426 3M', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:24', '2025-12-30 16:34:24', NULL),
(949, '990000071991991', 'RELE 14P24VDC RXN41G11BD TE89113', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:24', '2025-12-30 16:34:24', NULL),
(950, '990000071991992', 'BASE RELE MINI MEZCL RX27G TE89114', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:24', '2025-12-30 16:34:24', NULL),
(951, '990000071991993', 'ESPIRAL PLASTICO 12MMx10MTS 1511K015 TS001519', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:24', '2025-12-30 16:34:24', NULL),
(952, '990000071991994', 'TERMINAL HEMBRA AISLADO 1012AWG AMARILLO 8061146576 3M49220', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:24', '2025-12-30 16:34:24', NULL),
(953, '990000071991995', 'TERMINAL HORQUILLA 38MM 1416AWG AZUL 3M49164', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:24', '2025-12-30 16:34:24', NULL),
(954, '990000071991996', 'VHS30-03-BS-M-D VAL 3/2 MANUAL 3/8in 300646', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:24', '2025-12-30 16:34:24', NULL),
(955, '990000071991997', 'AW30-03DE-D FILTRO REG 3/8IN 300188', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:24', '2025-12-30 16:34:24', NULL),
(956, '990000071991998', 'Y300T-D SOPORTE MODULAR T 294528', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:24', '2025-12-30 16:34:24', NULL),
(957, '990000071991999', 'VV5FS2-01T-031-02MANIF.VFS2000 1/4 020796', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:24', '2025-12-30 16:34:24', NULL),
(958, '990000071992000', 'VFS2100-5FZ VAL 5/2 S/R 24V DC 019008', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:24', '2025-12-30 16:34:24', NULL),
(959, '990000071992001', 'CONECTOR PASAMURO KQ2E08-00N T.08 NIQ 013858', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:24', '2025-12-30 16:34:24', NULL),
(960, '990000071992002', 'KQ2L10-02NS CONECTOR L 10x1/4IN 014143', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:24', '2025-12-30 16:34:24', NULL),
(961, '990000071992003', 'TU1065BU-20 TUBO POLIUTERANO 10MM AZUL 018515', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:24', '2025-12-30 16:34:24', NULL),
(962, '990000071992004', 'TU0805BU-20 TUBO POLIUR 8MM AZUL 018515', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:24', '2025-12-30 16:34:24', NULL),
(963, '990000071992005', '2505-003 SILENC METALICO 3/8IN 006198', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:24', '2025-12-30 16:34:24', NULL),
(964, '990000071992006', 'AFG30-03BD-D SEP DE AGUA 3/8PURG N.A 300337', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:24', '2025-12-30 16:34:24', NULL),
(965, '990000071992007', 'ASIENTO WC FUSCHER POLIPROPILENO TAUMM 21 000 10 10', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:24', '2025-12-30 16:34:24', NULL),
(966, '990000071992008', 'CILINDRO NEUMATICO 100x1200 C96SDB100-1200C-XC65 CIL 2E 100x1200 A/M VA/TI INOX 302905', '', NULL, 30.00, 8.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:24', '2026-01-12 19:11:19', NULL),
(967, '990000071992009', 'REGULADORES DE FLUJO AS4201F-04-10SA VAL REG FLUJO T/10mm x 1/2P 027669', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:24', '2025-12-30 16:34:24', NULL),
(968, '990000071992010', 'ENGOMADO DE RODILLO LISO 99x138x450MM ACRILO NITRILO RR566 70 N NGOMADO DE RODILLO TRIPER', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:24', '2025-12-30 16:34:24', NULL),
(969, '990000071992011', 'ENGOMADO DE RODILLO LISO 90x118x450MM ACRILO NITRILO RR566 70 N NGOMADO DE RODILLO TRIPER', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:24', '2025-12-30 16:34:24', NULL),
(970, '990000071992012', 'ENGOMADO DE RODILLO LISO 58x83x450MM ACRILO NITRILO RR566 70 N NGOMADO DE RODILLO TRIPER', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:24', '2025-12-30 16:34:24', NULL),
(971, '990000071992013', 'DETECTOR BW- MODELO CLIP2 PARA MEDICION DE H2S BWC2-H 10-01-448', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:24', '2025-12-30 16:34:24', NULL),
(972, '990000071992014', 'TUBO LED VIDRIO OPAL LUZ FRIA 6500K 18W L1200MM 320 220V', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:24', '2025-12-30 16:34:24', NULL),
(973, '990000071992015', '(DELFIN COATINGS) DILUYENTE POLIURETANO DTI005 GAL. SOLV. PU. IND.', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Galon', NULL, '2025-12-30 16:34:24', '2025-12-30 16:34:24', NULL),
(974, '990000071992016', '(DELFIN COATINGS) CHICA BLANCO - POLIURETANO INDUSTRIAL DCI-500 IU500T9100B35', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:24', '2025-12-30 16:34:24', NULL),
(975, '990000071992017', 'ESCOBILLA ACERO M/PLASTICO 10 TOLSEN 32060', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:24', '2025-12-30 16:34:24', NULL),
(976, '990000071992018', 'BROCHA HELA 3\" 75MM', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:24', '2025-12-30 16:34:24', NULL),
(977, '990000071992019', 'PORTAELECTRODO HICEN 300 AMP', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:24', '2025-12-30 16:34:24', NULL),
(978, '990000071992020', 'MANGUERA AIRE AGUA CALIENTE 3/4P 15 METROS', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:24', '2025-12-30 16:34:24', NULL),
(979, '990000071992021', 'CORREA OPTIBELT-VB A760 Ld / 13x730 Li A29', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:24', '2025-12-30 16:34:24', NULL),
(980, '990000071992022', 'CORREA OPTIBELT A28 (TIMKENBELTS)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:24', '2025-12-30 16:34:24', NULL),
(981, '990000071992023', 'EQUIPO ESTANCO LED PARA TUBO 124 CM', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:24', '2025-12-30 16:34:24', NULL),
(982, '990000071992024', 'CONECTOR PASAMURO T10x3/8in KQ2E10-03N', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:24', '2025-12-30 16:34:24', NULL),
(983, '990000071992025', 'TRATAMIENTO DEL AIRE ACONDICIONADO 156g (WYNNS)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:24', '2025-12-30 16:34:24', NULL),
(984, '990000071992026', 'CORREA OPTIBELT (DUNLOP) Ax42', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:24', '2025-12-30 16:34:24', NULL),
(985, '990000071992027', 'CORREA OPTIBELT (DUNLOP) Ax41', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:24', '2025-12-30 16:34:24', NULL),
(986, '990000071992028', 'CORREA OPTIBELT (DUNLOP) Ax40', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:24', '2025-12-30 16:34:24', NULL),
(987, '990000071992029', 'CORREA OPTIBELT (YUELONG) A-58', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:24', '2025-12-30 16:34:24', NULL),
(988, '990000071992030', 'CORREA V-BELT (MITSUBA) 9,5x965 / 15380', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:24', '2025-12-30 16:34:24', NULL),
(989, '990000071992031', 'CORREA 6PK1590 (DAYCO)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:24', '2025-12-30 16:34:24', NULL),
(990, '990000071992032', 'CORREA OPTIBELT-VB Z-38', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:24', '2025-12-30 16:34:24', NULL),
(991, '990000071992033', 'CORREA OPTIBELT-VB Z1022 Ld / 10x1000 Li Z39', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:24', '2025-12-30 16:34:24', NULL),
(992, '990000071992034', 'CORREA OPTIBELT-VB 10x950 Ld / Z37', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:24', '2025-12-30 16:34:24', NULL),
(993, '990000071992035', 'CORREA OPTIBELT-VB A1030 Ld /13x1000 Li A39', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:24', '2025-12-30 16:34:24', NULL),
(994, '990000071992036', 'CORREA OPTIBELT-VB A995 Ld / 13x965 Li A38', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:24', '2025-12-30 16:34:24', NULL),
(995, '990000071992037', 'VALVULA DE SEGURIDAD Y ALIVIO PARA VAPOR HD-5616.2506.1 608-001- REV 00', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:24', '2025-12-30 16:34:24', NULL),
(996, '990000071992038', 'CORREA OPTIBELT-FB 12,5x900 La', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:24', '2025-12-30 16:34:24', NULL),
(997, '990000071992039', 'CORREA OPTIBELT-VB Z502 Ld / 10x480 Li Z19', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:24', '2025-12-30 16:34:24', NULL),
(998, '990000071992040', 'CORREA OPTIBELT-VB A797 Ld / 13x767 Li A30', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:24', '2025-12-30 16:34:24', NULL),
(999, '990000071992041', 'RELE DE CONTROL DE NIVEL DE LIQUIDOS RM35LM33MW TE17430', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:24', '2025-12-30 16:34:24', NULL),
(1000, '990000071992042', 'CORREA OPTIBELT-VB Z787 Ld / 10x765 Li Z30', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:24', '2025-12-30 16:34:24', NULL),
(1001, '990000071992043', 'CORREA OPTIBELT-VB S-CPLUS B2072 Ld / 17x2032 Li B80', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:24', '2025-12-30 16:34:24', NULL),
(1002, '990000071992044', 'CORREA OPTIBELT-VB S-CPLUS A2390 Ld / 13x2360 Li A93', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:24', '2025-12-30 16:34:24', NULL),
(1003, '990000071992045', 'CORREA OPTIBELT (BAOPOWER) Z18', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:24', '2025-12-30 16:34:24', NULL),
(1004, '990000071992046', 'CORREA OPTIBELT (BAOPOWER) GRANDE B80', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:24', '2025-12-30 16:34:24', NULL),
(1005, '990000071992047', 'CORREA OPTIBELT (BAOPOWER) Z19', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:24', '2025-12-30 16:34:24', NULL),
(1006, '990000071992048', 'CORREA OPTIBELT (BAOPOWER) DA 210L - 2108', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:24', '2025-12-30 16:34:24', NULL),
(1007, '990000071992049', 'CORREA OPTIBELT (BAOPOWER) DA 210L - 2107', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:24', '2025-12-30 16:34:24', NULL),
(1008, '990000071992050', 'CORREA OPTIBELT (BAOPOWER) DA 210L', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:24', '2025-12-30 16:34:24', NULL),
(1009, '990000071992051', 'CORREA OPTIBELT (DONGIL SUPERSTAR REC) 10A380', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:24', '2025-12-30 16:34:24', NULL),
(1010, '990000071992052', 'CORREA OPTIBELT (DONGIL FAN BELT) A37 / 13370', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:24', '2025-12-30 16:34:24', NULL),
(1011, '990000071992053', 'CORREA LAU (GIRBAU) RMG 623', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:24', '2025-12-30 16:34:24', NULL),
(1012, '990000071992054', 'CORREA OPTIBELT (ACE) 12,5x1050', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:24', '2025-12-30 16:34:24', NULL),
(1013, '990000071992055', 'CORREA OPTIBELT (MITSUBA) M38', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:24', '2025-12-30 16:34:24', NULL),
(1014, '990000071992056', 'CORREA OPTIBELT (JASON UNIMATCH) B-82', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:24', '2025-12-30 16:34:24', NULL),
(1015, '990000071992057', 'SECADOR DE MANO 2300watts SMA-2300-2', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:24', '2025-12-30 16:34:24', NULL),
(1016, '990000071992058', 'CORREA OPTIBELT (CIKO) AV13x889', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:24', '2025-12-30 16:34:24', NULL),
(1017, '990000071992059', 'CORREA OPTIBELT (KAESER) 6.2511.0', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:24', '2025-12-30 16:34:24', NULL),
(1018, '990000071992060', 'FLEXIBLE PARA AGUA (FIL-NOX / MATEU DN8) 50CM', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:24', '2025-12-30 16:34:24', NULL),
(1019, '990000071992061', 'FLEXIBLE PARA AGUA (FIL-NOX / MATEU DN8) 40CM', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:24', '2025-12-30 16:34:24', NULL),
(1020, '990000071992062', 'FLEXIBLE PARA AGUA (STRETTO) 50CM', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:24', '2025-12-30 16:34:24', NULL),
(1021, '990000071992063', 'CANAL RANURADA LEGRAND', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:24', '2025-12-30 16:34:24', NULL),
(1022, '990000071992064', 'CAJA DE CONEXIONES (LEGRAND) 400411', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:24', '2025-12-30 16:34:24', NULL),
(1023, '990000071992065', 'CAJA DE CONEXIONES (LEGRAND) 400408', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:24', '2025-12-30 16:34:24', NULL),
(1024, '990000071992066', 'PULSADOR DOBLE ROJO/VERDE XB4BL73415 TE44845', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:24', '2025-12-30 16:34:24', NULL),
(1025, '990000071992067', 'Sensor Pump IME 18-08 BPSZCOS IDN P7 2010 ( Sensor Mucosa)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:24', '2025-12-30 16:34:24', NULL),
(1026, '990000071992068', '(BTICINO) MODULO TOMACORRIENTE 5180 MAGIC 0502016012', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:24', '2025-12-30 16:34:24', NULL),
(1027, '990000071992069', 'FLEXIBLE INOX. 40CM X 1/2 HI-HE CALEFON (FLUSTEM)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:24', '2025-12-30 16:34:24', NULL),
(1028, '990000071992070', 'DISCO DE TRASLAPE 115x22,23mm (WURTH)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:24', '2025-12-30 16:34:24', NULL),
(1029, '990000071992071', '(CAR SUPER-POWER) IRRADIATION LAMP 27WR', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:24', '2025-12-30 16:34:24', NULL),
(1030, '990000071992072', 'FLUORESCENTE COMPACTO 26W (SYLVANIA)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:24', '2025-12-30 16:34:24', NULL),
(1031, '990000071992073', 'AMPOLLETA LUZ BLANCA FRIA 18W 2PINES (WESTINGHOUSE)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:24', '2025-12-30 16:34:24', NULL),
(1032, '990000071992074', 'AMPOLLETA (PHILIPS) 18W MASTER PL-C2P', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:24', '2025-12-30 16:34:24', NULL),
(1033, '990000071992075', 'AMPOLLETA (PHILIPS) 28W MASTER PL-C4P', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:24', '2025-12-30 16:34:24', NULL),
(1034, '990000071992076', 'AMPOLLETA (OSRAM) DULUX D 18W 624d-2', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:24', '2025-12-30 16:34:24', NULL),
(1035, '990000071992077', 'VALVULA RETENCION INOX. 304 HI DIAMETRO 3/4 CHECK', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:24', '2025-12-30 16:34:24', NULL),
(1036, '990000071992078', 'VALVULA RETENCION NPT. 304 DIAMETRO 1/2 CHECK', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:24', '2025-12-30 16:34:24', NULL),
(1037, '990000071992079', 'BOMBA REGGIO TYPE SN40-160B 4.0 HP 380V BOM1017120', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:24', '2025-12-30 16:34:24', NULL),
(1038, '990000071992080', 'CINTA MASKING TAPE (REX)48MMx40Mts', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:24', '2025-12-30 16:34:24', NULL),
(1039, '990000071992081', '(CERESITA) BLANCO - ESMALTE SINTETICO CERELUXE INTERIOR/EXTERIOR', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:24', '2025-12-30 16:34:24', NULL),
(1040, '990000071992082', 'LOWARA DOMO 10VX/B ELP 220-240 NF 01376/02856 107670120 BBA', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:24', '2025-12-30 16:34:24', NULL),
(1041, '990000071992083', 'MONOMANDO LAVATORIO LLAVE GRIFO MODELO MÃDENA STRETTO COLOR CROMO', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:24', '2025-12-30 16:34:24', NULL),
(1042, '990000071992084', 'RELE INDUSTRIAL ENCHUFABLE LUMINOSO 230VAC 2NANC  SCHNEIDER ELECTRIC TE89087 RXM4AB2P7', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:24', '2025-12-30 16:34:24', NULL),
(1043, '990000071992085', 'CARTUCHO DE GAS DESECHABLE ISOBUTANO/PROPANO MIXTO 227G (OUTDOOR DOITE)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:24', '2025-12-30 16:34:24', NULL),
(1044, '990000071992086', 'LIMPIADOR DE CONTACTO 311G / PARA USO ELECTRICO Y ELECTRONICO (CRC)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:24', '2025-12-30 16:34:24', NULL),
(1045, '990000071992087', 'MONTAJE Y RELLENO / ESPUMA PU 750ML (SOUDAL)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:24', '2025-12-30 16:34:24', NULL),
(1046, '990000071992088', 'FLEETWERKS HEAVY DUTY 368G / KNOCKER LOOSE (CRC)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:24', '2025-12-30 16:34:24', NULL),
(1047, '990000071992089', 'RODAMIENTO 3207 A-2RS1TN9/MT33 (SKF)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:25', '2025-12-30 16:34:25', NULL),
(1048, '990000071992090', 'LOGIC MODULE PLC LOGO 12-24VDC 8DI/4D (SIEMENS)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:25', '2025-12-30 16:34:25', NULL),
(1049, '990000071992091', 'CABEZA PULSADOR DE SETA HONGO 40MM ROJO 22MM TE52844', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:25', '2025-12-30 16:34:25', NULL),
(1050, '990000071992092', 'REGULADOR DE ARGON', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:25', '2025-12-30 16:34:25', NULL),
(1051, '990000071992093', 'Valvula Seguridad DN 80 304/PB 0-6 Bar ANSI-B16 Pos', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:25', '2025-12-30 16:34:25', NULL),
(1052, '990000071992094', 'CABLE LIBRE DE HALOGENO RZ1-K MULTIPOLAR 3 X 4.0MM2 0002604412N', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Metros', NULL, '2025-12-30 16:34:25', '2025-12-30 16:34:25', NULL),
(1053, '990000071992095', '(HELA) RODILLO CORTAGOTA 23 CM/ 9\"', '', NULL, 8.00, 7.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:25', '2026-01-12 19:28:33', NULL),
(1054, '990000071992096', '(JK) BROCA COBALTO 4MM', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:25', '2025-12-30 16:34:25', NULL),
(1055, '990000071992097', 'CAJA PARA BORNERA PA66 (ROHS)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:25', '2025-12-30 16:34:25', NULL),
(1056, '990000071992098', 'NIPLE TUERCA CENTRAL INOX 304 NPT 1/2', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:25', '2025-12-30 16:34:25', NULL),
(1057, '990000071992099', 'PUNTA HILO NPT INOX 304 1/2', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:25', '2025-12-30 16:34:25', NULL),
(1058, '990000071992100', 'VALVULA BOLSA NPT 304 2 CUERPOS 1/2', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:25', '2025-12-30 16:34:25', NULL),
(1059, '990000071992101', 'CODO 90 HILO NPT 304 1/2', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:25', '2025-12-30 16:34:25', NULL),
(1060, '990000071992102', 'TEE INOX 304 NPT 1/2', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:25', '2025-12-30 16:34:25', NULL),
(1061, '990000071992103', 'INTERRUPTOR AUTOMATICO 3x25A C 10KA A9F77325 MGA77325', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:25', '2025-12-30 16:34:25', NULL),
(1062, '990000071992104', 'INTERRUPTOR AUTOMATICO 2x16A C 10KA A9F77216 MGA77216', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:25', '2025-12-30 16:34:25', NULL),
(1063, '990000071992105', 'PORTAFUSIBLE 20A 400V LEGRAND 05812', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:25', '2025-12-30 16:34:25', NULL),
(1064, '990000071992106', 'TABLERO POLIESTER 400x300x200MM IP65 IK08 S/C/PTA (TIP-43) 0700805102', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:25', '2025-12-30 16:34:25', NULL),
(1065, '990000071992107', 'RELOJ DIGITAL 45/60HZ DATALOG-1 1301532012', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:25', '2025-12-30 16:34:25', NULL),
(1066, '990000071992108', 'CAJA GALVANIZADA CALIENTE 100x100x65 UNIV A-11 S/KO 0700541031', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:25', '2025-12-30 16:34:25', NULL),
(1067, '990000071992109', 'CAJA GALVANIZADA CALIENTE 100x100x65 UNIV A-11 (A) 0700541032', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:25', '2025-12-30 16:34:25', NULL),
(1068, '990000071992110', 'CAJA GALVANIZADA CALIENTE 200x200x100 UNIV B-22 0700541034', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:25', '2025-12-30 16:34:25', NULL),
(1069, '990000071992111', 'CABLE REVIFLEX 3X2.5MM AENOR RV-K 0.6/1KV 0002604606', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Metros', NULL, '2025-12-30 16:34:25', '2025-12-30 16:34:25', NULL),
(1070, '990000071992112', 'CABLE REVIFLEX 4x2.5MM AENOR 0.6/1KV 0002604642', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Metros', NULL, '2025-12-30 16:34:25', '2025-12-30 16:34:25', NULL),
(1071, '990000071992113', 'VDF SIEMENS MOCROMASTER 420 0.25KW 200-240 2A', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:25', '2025-12-30 16:34:25', NULL),
(1072, '990000071992114', 'PANEL BOP PARA VDF SIEMENS 6SE6400-0BE00-0AA0', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:25', '2025-12-30 16:34:25', NULL),
(1073, '990000071992115', 'RODAMIENTO 685 2RS 5X11X5-KLAES.S', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:25', '2025-12-30 16:34:25', NULL),
(1074, '990000071992116', 'CINTA DE DEMARCACION', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:25', '2025-12-30 16:34:25', NULL),
(1075, '990000071992117', '(CERESITA) BASE MEDIA - ESMALTE SINTETICO CERELUXE INTERIOR/EXTERIOR', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:25', '2025-12-30 16:34:25', NULL),
(1076, '990000071992118', '(CHILCO PROFIN) NEGRO - TRIPLE PROTECCION ESMALTE SINTETICO/ ANTICORROSIVO/ ESTABILIZADOR INTERIOR-EXTERIOR', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Galon', NULL, '2025-12-30 16:34:25', '2025-12-30 16:34:25', NULL),
(1077, '990000071992119', '(CERESITA) NEGRO - OLEO OPACO HABITACIONAL INTERIOR/ CUBREMANCHAS', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Galon', NULL, '2025-12-30 16:34:25', '2025-12-30 16:34:25', NULL),
(1078, '990000071992120', '(BEKRON) ADHESIVO EN PASTA 25 KG A-C', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Galon', NULL, '2025-12-30 16:34:25', '2025-12-30 16:34:25', NULL),
(1079, '990000071992121', '(CERESITA) DEMARCACION VIAL 4 GALONES', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Galon', NULL, '2025-12-30 16:34:25', '2025-12-30 16:34:25', NULL),
(1080, '990000071992122', '(CERESITA) AZUL ELECTRICO - ESMALTE SINTETICO CERELUXE INTERIOR/EXTERIOR', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Galon', NULL, '2025-12-30 16:34:25', '2025-12-30 16:34:25', NULL),
(1081, '990000071992123', '(SIPA) BLANCO - ESMALTE AL AGUA SEMIBRILLO 1 GALON', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Galon', NULL, '2025-12-30 16:34:25', '2025-12-30 16:34:25', NULL),
(1082, '990000071992124', '(LANCO) SILICONA ROJA ALTA TEMPERATURA 300ML', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:25', '2025-12-30 16:34:25', NULL),
(1083, '990000071992125', '(SOQUINA) BLANCO - ESMALTE SINTETICO PAJARITO BRILLANTE', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:25', '2025-12-30 16:34:25', NULL),
(1084, '990000071992126', '(TRICOLOR) ROJO MANDARIN - ESMALTE SINTETICO', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Galon', NULL, '2025-12-30 16:34:25', '2025-12-30 16:34:25', NULL),
(1085, '990000071992127', '(CERESITA) ROJO - ANTICORROSIVO ESTRUCTURAL', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Galon', NULL, '2025-12-30 16:34:25', '2025-12-30 16:34:25', NULL),
(1086, '990000071992128', '(RENNER COATINGS) NEGRO - AGUARRAS MINERAL LCSA-0817BG', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:25', '2025-12-30 16:34:25', NULL),
(1087, '990000071992129', '(TAJAMAR) PASTA MURO F-15 INTERIOR', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:25', '2025-12-30 16:34:25', NULL),
(1088, '990000071992130', 'INTERRUPTOR AUTOMATICO 2X25A C 10KA A9F77225 MGA77225', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:25', '2025-12-30 16:34:25', NULL),
(1089, '990000071992131', 'INTERRUPTOR AUTOMATICO TERMOMAGN 3P 25A 440VAC CURVA MGA85325', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:25', '2025-12-30 16:34:25', NULL),
(1090, '990000071992132', 'INTERRUPTOR AUTOMATICO DIFERENCIAL 2P 16A 10MA A9R10216 MGA10216', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:25', '2025-12-30 16:34:25', NULL),
(1091, '990000071992133', 'TABLERO IND SOBREPUESTO ACERO GRIS 7032 300x200x150 K5399116', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:25', '2025-12-30 16:34:25', NULL),
(1092, '990000071992134', '(TAJAMAR) PASTA MURO EXTERIOR A-1', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:25', '2025-12-30 16:34:25', NULL),
(1093, '990000071992135', '(SHERWIN WILLIAMS) BLANCO - TRIPLE ACCION METAL ESMALTE ANTICORROSIVO', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:25', '2025-12-30 16:34:25', NULL),
(1094, '990000071992136', '(CERESITA) NEGRO - CALORKOTE 280', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:25', '2025-12-30 16:34:25', NULL),
(1095, '990000071992137', '(DYNAL) TAPAGOTERAS GRIS', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Galon', NULL, '2025-12-30 16:34:25', '2025-12-30 16:34:25', NULL),
(1096, '990000071992138', '(PINTURAS STERLING) BLANCO - TERMINACION BRILLANTE ESMALTE EPOXI/AGUA', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Galon', NULL, '2025-12-30 16:34:25', '2025-12-30 16:34:25', NULL),
(1097, '990000071992139', '(DELFIN COATINGS) POLIURETANO DCI - 324 GAL. COMP. B, CATALIZADOR 4:1', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:25', '2025-12-30 16:34:25', NULL),
(1098, '990000071992140', '(DELFIN COATINGS) POLIURETANO CATALIZADOR ESMALTE PU ALUMINIO DCI - 324', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:25', '2025-12-30 16:34:25', NULL),
(1099, '990000071992141', '(DELFIN COATINGS) ENDURECEDOR POLIURETANO - DCI - 500 GAL. COMP. B, NO FERROSO (DCI - 324)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:25', '2025-12-30 16:34:25', NULL),
(1100, '990000071992142', '(DELFIN COATINGS) ENDURECEDOR POLIURETANO DCI - 324 GAL. COMP. B, CATALIZADOR 4:1', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:25', '2025-12-30 16:34:25', NULL),
(1101, '990000071992143', '(KOLOR GLAM) CANCHAS VERDES - CANCHAS Y PISOS TERMINACION MATE', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:25', '2025-12-30 16:34:25', NULL),
(1102, '990000071992144', '(CERESITA) GRIS VERDOSO - ANTICORROSIVO ESTRUCTURAL', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Galon', NULL, '2025-12-30 16:34:25', '2025-12-30 16:34:25', NULL),
(1103, '990000071992145', '(CERESITA) GRIS MAQUINA - ESMALTE SINTETICO CERELUXE', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Galon', NULL, '2025-12-30 16:34:25', '2025-12-30 16:34:25', NULL),
(1104, '990000071992146', '(SOQUINA) GRIS MAQUINA - ESMALTE SINTETICO PAJARITO', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Galon', NULL, '2025-12-30 16:34:25', '2025-12-30 16:34:25', NULL),
(1105, '990000071992147', '(DELFIN COATINGS) BLANCO BTE - POLIURETANO ESMALTE PU ALUMINIO (20 L)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Galon', NULL, '2025-12-30 16:34:25', '2025-12-30 16:34:25', NULL),
(1106, '990000071992148', '(DELFIN COATINGS) BLANCO - POLIURETANO INDUSTRIAL DCI-500 IU500T9100B15', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Galon', NULL, '2025-12-30 16:34:25', '2025-12-30 16:34:25', NULL),
(1107, '990000071992149', '(GOBUSA) PEGATODO', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Galon', NULL, '2025-12-30 16:34:25', '2025-12-30 16:34:25', NULL),
(1108, '990000071992150', '(DIDEVAL) DIDEPREN 2000 ADHESIVO DE CONTACTO', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Galon', NULL, '2025-12-30 16:34:25', '2025-12-30 16:34:25', NULL),
(1109, '990000071992151', '(VALVOLINE) VAL-RED GREASE EP-2 (GRASA)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Galon', NULL, '2025-12-30 16:34:25', '2025-12-30 16:34:25', NULL),
(1110, '990000071992152', '(TRICOLOR) BLANCO PERFECTO - OLEO OPACO', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Galon', NULL, '2025-12-30 16:34:25', '2025-12-30 16:34:25', NULL),
(1111, '990000071992153', '(CERESITA) NEGRO - TARRO CHICO', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Galon', NULL, '2025-12-30 16:34:25', '2025-12-30 16:34:25', NULL),
(1112, '990000071992154', '(MARSON) MASILLA MAGICA', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Galon', NULL, '2025-12-30 16:34:25', '2025-12-30 16:34:25', NULL),
(1113, '990000071992155', '(TRICOLOR) VERDE - ALTO TRAFICO PINTURA PARA PISOS Y MULTICANCHAS', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Galon', NULL, '2025-12-30 16:34:25', '2025-12-30 16:34:25', NULL),
(1114, '990000071992156', '(SYN FX) PURITY FG COMPRESSOR FLUID 100 20L', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Galon', NULL, '2025-12-30 16:34:25', '2025-12-30 16:34:25', NULL),
(1115, '990000071992157', '(PETRO CANADA) TRAXON SAE 85W - 140 GL-5', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Galon', NULL, '2025-12-30 16:34:25', '2025-12-30 16:34:25', NULL),
(1116, '990000071992158', '(PETRO CANADA) TRAXON TM/MC 80W - 90 20L', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Galon', NULL, '2025-12-30 16:34:25', '2025-12-30 16:34:25', NULL),
(1117, '990000071992159', 'SPRAY GALVANIZADO EN FRIO', '', NULL, 19.00, 6.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:25', '2026-01-12 19:28:52', NULL),
(1118, '990000071992160', 'TORNILLO VOLCA 6-20x1 PUNTA BROCA', '', NULL, 0.00, 4.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:25', '2026-01-12 11:58:40', NULL),
(1119, '990000071992161', 'FUSIBLE 10x38 1A 500V (VITEL)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:25', '2025-12-30 16:34:25', NULL),
(1120, '990000071992162', 'RODAMIENTO 685 2RS A', '', NULL, 18.00, 12.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:25', '2026-01-21 15:50:28', NULL),
(1121, '990000071992163', '(SIPA) BLANCO - ESMALTE AL AGUA SEMIBRILLO 5 GALONES', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Galon', NULL, '2025-12-30 16:34:25', '2025-12-30 16:34:25', NULL),
(1122, '990000071992164', '(CERESITA) BLANCO 4 GALONES - ESMALTE AL AGUA PIEZA Y FACHADA INTERIOR / EXTERIOR', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Galon', NULL, '2025-12-30 16:34:25', '2025-12-30 16:34:25', NULL),
(1123, '990000071992165', 'TERMINAL ELECTRICO MACHO AISLADO 18-22AWG ROJO 8061146424', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:25', '2025-12-30 16:34:25', NULL),
(1124, '990000071992166', 'TERMINAL REDONDO 16-14 AWG AZUL 3MM RV2-3.2 (A)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:25', '2025-12-30 16:34:25', NULL),
(1125, '990000071992167', 'TERMINAL HEMBRA 16-14 AWG AZUL 4.7MM FDD 2-187 (A)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:25', '2025-12-30 16:34:25', NULL),
(1126, '990000071992168', 'TERMINAL MACHO 16-14 AWG AZUL 6.3MM MDD 2-250 (A)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:25', '2025-12-30 16:34:25', NULL),
(1127, '990000071992169', 'FERRULES CON AISLACION 2.5MM2 GRIS', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:25', '2025-12-30 16:34:25', NULL),
(1128, '990000071992170', 'FERRULES CON AISLACION 2.5MM2 E2512', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:25', '2025-12-30 16:34:25', NULL),
(1129, '990000071992171', 'FERRULES CON AISLACION 1.5MM2 NEGRO', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:25', '2025-12-30 16:34:25', NULL),
(1130, '990000071992172', 'TARUGO VOLCANITA PLASTICO', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:25', '2025-12-30 16:34:25', NULL),
(1131, '990000071992173', 'RACOR CONECTOR NEUMATICO PARA POR AMBOS EXTREMO DE 8MM CONECTOR NIPLE TUBO 08', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:25', '2025-12-30 16:34:25', NULL),
(1132, '990000071992174', 'TUBO LED T8 - 18W 124 X 20 16 CM', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:25', '2025-12-30 16:34:25', NULL),
(1133, '990000071992175', 'MANGUERA NEUMATICA DE 8MM DE TUBO POLIUTERANO 8MMAZUL', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:25', '2025-12-30 16:34:25', NULL),
(1134, '990000071992176', 'DIAFRAGMA D1=120 11181283060', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:25', '2025-12-30 16:34:25', NULL),
(1135, '990000071992177', '(FLEX) ESPATULA 60MM', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:25', '2025-12-30 16:34:25', NULL),
(1136, '990000071992178', 'VARIADOR DE FRECUENCIA MICROMASTER 420 200v/240v (NF2214)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:25', '2025-12-30 16:34:25', NULL),
(1137, '990000071992179', 'MACHO DE ROSCAR INOXIDABLE 5MM', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:25', '2025-12-30 16:34:25', NULL),
(1138, '990000071992180', 'MACHO DE ROSCAR INOXIDABLE 8MM', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:25', '2025-12-30 16:34:25', NULL),
(1139, '990000071992181', 'PERNO PARKER INOXIDABLE M4X20', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:25', '2025-12-30 16:34:25', NULL),
(1140, '990000071992182', 'PERNO PARKER INOXIDABLE M5X20', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:25', '2025-12-30 16:34:25', NULL),
(1141, '990000071992183', 'PERNO PARKER INOXIDABLE M6X20', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:26', '2025-12-30 16:34:26', NULL),
(1142, '990000071992184', 'PERNO PARKER INOXIDABLE M8X20', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:26', '2025-12-30 16:34:26', NULL),
(1143, '990000071992185', 'GOLILLA INOXIDABLE PLANA 4MM', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:26', '2025-12-30 16:34:26', NULL),
(1144, '990000071992186', 'GOLILLA INOXIDABLE PLANA 5MM', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:26', '2025-12-30 16:34:26', NULL),
(1145, '990000071992187', 'GOLILLA INOXIDABLE PLANA 6MM', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:26', '2025-12-30 16:34:26', NULL),
(1146, '990000071992188', 'GOLILLA INOXIDABLE PLANA 8MM', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:26', '2025-12-30 16:34:26', NULL),
(1147, '990000071992189', 'REMACHE M5X35', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:26', '2025-12-30 16:34:26', NULL),
(1148, '990000071992190', '(COBALTO) BROCA CONCRETO 3MM', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:26', '2025-12-30 16:34:26', NULL),
(1149, '990000071992191', 'VALVULA DE 3/2 10.699.5663', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:26', '2025-12-30 16:34:26', NULL),
(1150, '990000071992192', 'TUERCA INOXIDABLE M4X20', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:26', '2025-12-30 16:34:26', NULL),
(1151, '990000071992193', 'SENSOR IME18-08BPSZC0S1040966 (SICK)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:26', '2025-12-30 16:34:26', NULL),
(1152, '990000071992194', 'CABLE 4 PINES SENSOR M12 FEMALE 125V AC/DC 4A (MURR ELEKTRONIK)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:26', '2025-12-30 16:34:26', NULL),
(1153, '990000071992195', '(JK) BROCA COBALTO 2.80MM', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:26', '2025-12-30 16:34:26', NULL),
(1154, '990000071992196', 'EFENTO BLE HS6 TEMPERATURA Y HUMEDAD -35°C a +70°C', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:26', '2025-12-30 16:34:26', NULL),
(1155, '990000071992197', 'BOP PARA VDF SIEMENS (NF2215)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:26', '2025-12-30 16:34:26', NULL),
(1156, '990000071992198', 'SS TIG 1/16\" ER308L', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'kilo', NULL, '2025-12-30 16:34:26', '2025-12-30 16:34:26', NULL),
(1157, '990000071992199', 'BROCA DE 4 PUNTAS 12X160MM (HEMIC)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:26', '2025-12-30 16:34:26', NULL),
(1158, '990000071992200', 'SS TIG 2.40MM ER2209', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:26', '2025-12-30 16:34:26', NULL),
(1159, '990000071992201', 'PUNTA DOBLE PH2 SL6 TOMA HEX 1/4 (HEMIC)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:26', '2025-12-30 16:34:26', NULL),
(1160, '990000071992202', 'CUCHILLA TRAPEZOIDAL', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:26', '2025-12-30 16:34:26', NULL),
(1161, '990000071992203', 'if5317 ifm electronic 45128 essen', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:26', '2025-12-30 16:34:26', NULL),
(1162, '990000071992204', 'SENSOR FRENO METRADORA KEB 22.22 0102100-0081 008V DC P=6W', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:26', '2025-12-30 16:34:26', NULL),
(1163, '990000071992205', 'TUERCA INOXIDABLE M5X20MM', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:26', '2025-12-30 16:34:26', NULL),
(1164, '990000071992206', 'TUERCA INOXIDABLE M6X20MM', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:26', '2025-12-30 16:34:26', NULL),
(1165, '990000071992207', 'TUERCA INOXIDABLE M8X20MM', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:26', '2025-12-30 16:34:26', NULL),
(1166, '990000071992208', 'JUEGO DE LLAVES ALLEN LARGAS', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:26', '2025-12-30 16:34:26', NULL),
(1167, '990000071992209', 'CINTA DE MEDIR STANLEY METALICA 8M', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:26', '2025-12-30 16:34:26', NULL),
(1168, '990000071992210', 'PINTURA SPRAY NEGRA', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:26', '2025-12-30 16:34:26', NULL),
(1169, '990000071992211', 'MANGUERA DE 1/2\" AGUA POTABLE', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:26', '2025-12-30 16:34:26', NULL),
(1170, '990000071992212', 'MANGUERA DE 3/4\" AGUA POTABLE', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:26', '2025-12-30 16:34:26', NULL),
(1171, '990000071992213', 'CAJA IDROBOX SOBRE PUESTAS 1 MODULO', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:26', '2025-12-30 16:34:26', NULL),
(1172, '990000071992214', 'PINTURA SPRAY H FULL ROJO', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:26', '2025-12-30 16:34:26', NULL),
(1173, '990000071992215', 'PANTALLA HMI EATON XV-102-B6-35TQR-10-PLC 3.5\"', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:26', '2025-12-30 16:34:26', NULL),
(1174, '990000071992216', 'EATON XNE-4AO-U/I PLC', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:26', '2025-12-30 16:34:26', NULL),
(1175, '990000071992217', 'HILO POR METRO DIN 976', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:26', '2025-12-30 16:34:26', NULL),
(1176, '990000071992218', 'SENSOR FRENO METRADORA KEB 08.21 0102100-0241 024V DC P=6W', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:26', '2025-12-30 16:34:26', NULL),
(1177, '990000071992219', 'CORTINA LAMA 200*2MM', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Metros', NULL, '2025-12-30 16:34:26', '2025-12-30 16:34:26', NULL),
(1178, '990000071992220', 'ANILLO DE APOYO CODIGO 5.114-511.0', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:26', '2025-12-30 16:34:26', NULL),
(1179, '990000071992221', 'ANILLO DE GUARNICION CODIGO 6.362-526.0', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:26', '2025-12-30 16:34:26', NULL),
(1180, '990000071992222', 'ANILLO DE GUARNICION 114x3 CODIGO 6.363-228.0', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:26', '2025-12-30 16:34:26', NULL),
(1181, '990000071992223', 'ANILLO DE GUARNICION 28x3 CODIGO 6.362-722.0', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:26', '2025-12-30 16:34:26', NULL),
(1182, '990000071992224', 'ANILLO OBTURADOR RADIAL A35x52x7-NBR CODIGO 7.367-009.0', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:26', '2025-12-30 16:34:26', NULL),
(1183, '990000071992225', 'ANILLO DE GUARNICION 12.42x1.78 CODIGO 6.363-244.0', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:26', '2025-12-30 16:34:26', NULL),
(1184, '990000071992226', 'CHAVETA PARALELA CODIGO 7.318-035.0', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:26', '2025-12-30 16:34:26', NULL),
(1185, '990000071992227', 'CONTENEDOR CODIGO 5.070-.604.0', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:26', '2025-12-30 16:34:26', NULL);
INSERT INTO `insumos` (`id`, `codigo_sku`, `nombre`, `descripcion`, `categoria_id`, `stock_actual`, `stock_minimo`, `stock_critico`, `precio_costo`, `moneda`, `unidad_medida`, `imagen_url`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1186, '990000071992228', 'ESTRIBO CODIGO 5.034-494.0', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:26', '2025-12-30 16:34:26', NULL),
(1187, '990000071992229', 'INTERRUPTOR CODIGO 4.744-239.0', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:26', '2025-12-30 16:34:26', NULL),
(1188, '990000071992230', 'TAPA CODIGO 5.063-195.0', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:26', '2025-12-30 16:34:26', NULL),
(1189, '990000071992231', 'ANILLO DE APOYO 20x30x4.2 CODIGO 6.365-378.0', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:26', '2025-12-30 16:34:26', NULL),
(1190, '990000071992232', 'ANILLO DE GUARNICION 36x2-NBR 70 CODIGO 6.362-092.0', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:26', '2025-12-30 16:34:26', NULL),
(1191, '990000071992233', 'DISCOS CODIGO 5.115-537.0', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:26', '2025-12-30 16:34:26', NULL),
(1192, '990000071992234', 'DISCOS CODIGO 5.115-538.0', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:26', '2025-12-30 16:34:26', NULL),
(1193, '990000071992434', 'Juego de juntas baja presión 6.365-380.0', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:26', '2025-12-30 16:34:27', NULL),
(1194, '990000071992236', 'RETEN LABIAL CODIGO 6.365-052.0', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:26', '2025-12-30 16:34:26', NULL),
(1195, '990000071992237', 'RETENES CODIGO 6.365-377.0', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:26', '2025-12-30 16:34:26', NULL),
(1196, '990000071992238', 'INTERRUPTOR AUTOMATICO 6A 380/415V 15 KA SCHNEIDER A9F87206 MGA87206', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:26', '2025-12-30 16:34:26', NULL),
(1197, '990000071992239', '(HELA) BROCHA CERDA 5/8X4', '', NULL, 9.00, 10.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:26', '2026-01-12 19:29:41', NULL),
(1198, '990000071992240', '(HELA) BROCHA CERDA 5/8X2', '', NULL, 17.00, 10.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:26', '2026-01-12 19:29:23', NULL),
(1199, '990000071992241', 'ROSCALATA BINDING 12X1 1/2', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:26', '2025-12-30 16:34:26', NULL),
(1200, '990000071992242', 'ROSCALATA BINDING 10X1 1/4', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:26', '2025-12-30 16:34:26', NULL),
(1201, '990000071992243', 'TARUGO 6 MM C/TOPE 100 PCS', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:26', '2025-12-30 16:34:26', NULL),
(1202, '990000071992244', 'TARUGO 8 MM C/TOPE 100 PCS', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:26', '2025-12-30 16:34:26', NULL),
(1203, '990000071992245', 'TARUGO ESPIGA M10X50', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:26', '2025-12-30 16:34:26', NULL),
(1204, '990000071992246', '(AUTONICS) CONTADOR CT6S-2P4 100-240VAC (50/60HZ)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:26', '2025-12-30 16:34:26', NULL),
(1205, '990000071992247', '(AUTONICS) ROTARY ENCODE E50S8-360-3-T-24 062202', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:26', '2025-12-30 16:34:26', NULL),
(1206, '990000071992248', '(NORTON) LIJA FIERRO METAL K246 80 ALOX', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:26', '2025-12-30 16:34:26', NULL),
(1207, '990000071992249', 'KLIPEN GRIFERIAS FLUXOR WC MEMBRANA PUBLIC C-TUBO RECTO EXP', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:26', '2025-12-30 16:34:26', NULL),
(1208, '990000071992250', 'CABLE ECO-REVI L/H. 3x1.5MM (2604410N) RZ1-K NEGRO 0.6/1KV. 90Â°C(A)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:26', '2025-12-30 16:34:26', NULL),
(1209, '990000071992251', 'CONECTOR RECTO P/F C/PVC IEC 25MM (1118683502)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:26', '2025-12-30 16:34:26', NULL),
(1210, '990000071992252', 'CANAL RANURADA 40X60MM 2 MTS (WXH) GRIS HVDR4060', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:26', '2025-12-30 16:34:26', NULL),
(1211, '990000071992253', 'CABLE ECO-REVI L/H 2.5MM H07Z1-K AZUL (2604126) R-100 750V 70Â°C', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:26', '2025-12-30 16:34:26', NULL),
(1212, '990000071992254', 'CABLE ECO-REVI L/H 2.5MM H07Z1-K NEGRO (2604129) R-100', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:26', '2025-12-30 16:34:26', NULL),
(1213, '990000071992255', 'CABLE ECO-REVI L/H 2.5MM H07Z1-K ROJO (2604123) R-100', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:26', '2025-12-30 16:34:26', NULL),
(1214, '990000071992256', 'CABLE ECO-REVI L/H 2.5MM H07Z1-K BLANCO (2604120) R-100', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:26', '2025-12-30 16:34:26', NULL),
(1215, '990000071992257', 'CANAL RANURADA 25X25 2MTS (WXH) GRIS 5R2525', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:26', '2025-12-30 16:34:26', NULL),
(1216, '990000071992258', 'RODAMIENTO 6005-2RSR-CO7-C3 (FAG)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:26', '2025-12-30 16:34:26', NULL),
(1217, '990000071992259', 'RUEDA NYLON PUR HORQ. MOVIL INOX 080MM', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:26', '2025-12-30 16:34:26', NULL),
(1218, '990000071992260', 'RUEDA NYLON PUR HORQ. FIJA INOX 080MM', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:26', '2025-12-30 16:34:26', NULL),
(1219, '990000071992261', 'SENSOR FRENO METRADORA KEB 41.18 0102100-0081 008V DC P=6W', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:26', '2025-12-30 16:34:26', NULL),
(1220, '990000071992262', 'SPEEDLUB SPEEDSOLV HF-80 (20L)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:26', '2025-12-30 16:34:26', NULL),
(1221, '990000071992263', 'Motorreductor De Velocidad Marca Keb 1,5Kw (2Hp)-1400Rpm-B5-380V Eje Pasante De 35Mm', '', 34, 0.00, 1.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:26', '2026-01-12 16:45:42', NULL),
(1222, '990000071992264', 'TABLERO POLIESTER 300X250X140 S/PLACA S/PUERTA INT. IK08 IP6', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:26', '2025-12-30 16:34:26', NULL),
(1223, '990000071992265', 'TERMINAL ELECTRICO MACHO ROJO TOTALMENTE AISLADO NYLON 18-22AWG 8061146424', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:26', '2025-12-30 16:34:26', NULL),
(1224, '990000071992266', 'CINTA AISLANTE ELECTRICA ROJA 3M', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:26', '2025-12-30 16:34:26', NULL),
(1225, '990000071992267', 'CINTA AISLANTE ELECTRICA VERDE 3M', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:26', '2025-12-30 16:34:26', NULL),
(1226, '990000071992268', 'CINTA AISLANTE ELECTRICA AMARILLA 3M', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:26', '2026-01-07 04:49:12', NULL),
(1227, '990000071992269', 'CINTA AISLANTE ELECTRICA BLANCA 3M', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:26', '2025-12-30 16:34:26', NULL),
(1228, '990000071992270', 'DIAFRAGMA H1=1,1 B1=102 L1=102 11181798090', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:26', '2025-12-30 16:34:26', NULL),
(1229, '990000071992271', 'PLIEGO LIJA METAL NORTON 60', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:26', '2025-12-30 16:34:26', NULL),
(1230, '990000071992272', 'REPUESTO CARTONERO STANLEY 5un', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:26', '2025-12-30 16:34:26', NULL),
(1231, '990000071992273', 'CINTA CALENTADORA 11121198230', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:26', '2025-12-30 16:34:26', NULL),
(1232, '990000071992274', 'LIMAS GIRATORIAS (FRESA CILINDRICA)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:26', '2025-12-30 16:34:26', NULL),
(1233, '990000071992275', 'LIJA AL AGUA 1000', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:26', '2025-12-30 16:34:26', NULL),
(1234, '990000071992276', 'LIJA AL AGUA 1200', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:26', '2025-12-30 16:34:26', NULL),
(1235, '990000071992277', 'MACHO NPT 1/8', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:26', '2025-12-30 16:34:26', NULL),
(1236, '990000071992278', 'RETEN 30-45-7', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:26', '2025-12-30 16:34:26', NULL),
(1237, '990000071992279', 'GAS BUTANO', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:26', '2025-12-30 16:34:26', NULL),
(1238, '990000071992280', 'CORDON PERFILADO 81863151040', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:26', '2025-12-30 16:34:26', NULL),
(1239, '990000071992281', 'RETEN 44-72-10', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:26', '2025-12-30 16:34:26', NULL),
(1240, '990000071992282', 'RETEN 30-47-8', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:26', '2025-12-30 16:34:26', NULL),
(1241, '990000071992283', 'RETEN 35-50-7', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:26', '2025-12-30 16:34:26', NULL),
(1242, '990000071992284', 'RETEN 44-62-10', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:26', '2025-12-30 16:34:26', NULL),
(1243, '990000071992285', 'RETEN 40-62-11', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:26', '2025-12-30 16:34:26', NULL),
(1244, '990000071992286', 'PERNO ANCLAJE INOX 1/4 X 3 1/4', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:26', '2025-12-30 16:34:26', NULL),
(1245, '990000071992287', 'PERNO ANCLAJE INOXIDABLE 3/8 X 3.3/4', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:26', '2025-12-30 16:34:26', NULL),
(1246, '990000071992288', 'PERNO ANCLAJE INOXIDABLE 304 1/2 X 4 1/2', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:26', '2025-12-30 16:34:26', NULL),
(1247, '990000071992289', 'PERNO ANCLAJE INOXIDABLE 304 5/8 X 5 1/2', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:26', '2025-12-30 16:34:26', NULL),
(1248, '990000071992290', 'RETEN 32-45-7-TC', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:26', '2025-12-30 16:34:26', NULL),
(1249, '990000071992291', 'RETEN 45-60-10', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:26', '2025-12-30 16:34:26', NULL),
(1250, '990000071992292', 'HUINCHA MEDIR 5 MT. TRUPER 14578', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:26', '2025-12-30 16:34:26', NULL),
(1251, '990000071992293', 'CAJA GALV. EN CALIENTE 300x200x100 UNIV. B-23(A)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:26', '2025-12-30 16:34:26', NULL),
(1252, '990000071992294', 'AMERICANA SMS 76MM', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:26', '2025-12-30 16:34:26', NULL),
(1253, '990000071992295', 'FERRUL CON CLAM Y ABRAZADERA 76MM', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:26', '2025-12-30 16:34:26', NULL),
(1254, '990000071992296', 'HILO TUERCA INOXIDABLE 1/2P', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:26', '2025-12-30 16:34:26', NULL),
(1255, '990000071992297', 'HILO TUERCA INOXIDABLE 3/4P', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:26', '2025-12-30 16:34:26', NULL),
(1256, '990000071992298', 'TUBERIAS FLEXIBLE 6.391-351.0', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:26', '2025-12-30 16:34:26', NULL),
(1257, '990000071992299', 'CURVADORA EMT 32MM MANGO FIERRO IECB32MM SCB-32H PS30732', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:26', '2025-12-30 16:34:26', NULL),
(1258, '990000071992300', 'TUBO CONDUIT EMT 1.20MM 32MM X 3MTS IEC EMT-32H PS50032', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:26', '2025-12-30 16:34:26', NULL),
(1259, '990000071992301', 'TUBO EMT IEC 25MM X 3MTS IEC25 PI50025', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:26', '2025-12-30 16:34:26', NULL),
(1260, '990000071992302', 'CURVA EMT 25MM CONDUIT 90Â° 2429620 TA53025', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:26', '2025-12-30 16:34:26', NULL),
(1261, '990000071992303', 'CURVA CONDUIT 90Â° PREGALVANIZADO EMT IEC 32MM 8103 PS53032', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:26', '2025-12-30 16:34:26', NULL),
(1262, '990000071992304', 'ABRAZADERA CADDY EMT 32MM IEC CH-32P PS54032', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:26', '2025-12-30 16:34:26', NULL),
(1263, '990000071992305', 'ABRAZADERA CADDY 25MM', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:26', '2025-12-30 16:34:26', NULL),
(1264, '990000071992306', 'CONECTOR RECTO METALICO EMT A FLEXIBLE C/PVC 25MM DKJD-32-PS PS69025', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:26', '2025-12-30 16:34:26', NULL),
(1265, '990000071992307', 'CONECTOR RECTO 25MM P/FLEX C/PVC DWJD-25 PS41358', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:26', '2025-12-30 16:34:26', NULL),
(1266, '990000071992308', 'CONECTOR CURVO 90Â° 25MM P/FLEX C/PVC DWJD-25 PS41358', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:26', '2025-12-30 16:34:26', NULL),
(1267, '990000071992309', 'TERMINAL EMT 32MM LC0N32 SSCN-32 PS51032', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:26', '2025-12-30 16:34:26', NULL),
(1268, '990000071992310', 'CONECTOR RECTO METALICO EMT A SFLEXIBLE C/PVC 32MM DKJD-32-PS PS69032', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:26', '2025-12-30 16:34:26', NULL),
(1269, '990000071992311', 'CONECTOR RECTO CONDUIT 32MM P/FLEX C/PVC DPJD-32 PS41260', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:26', '2025-12-30 16:34:26', NULL),
(1270, '990000071992312', 'CONECTOR CURVO 90Â° 32MM P/FLEX C/PVC DWJP-32 PS41360', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:26', '2025-12-30 16:34:26', NULL),
(1271, '990000071992313', 'INTERRUPTOR AUTOM. 6A 230V 6KA MAGNETO TERMICO EZ9F56106 MGA56106', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:26', '2025-12-30 16:34:26', NULL),
(1272, '990000071992314', 'INTERRUPTOR TERMOMAGNETICO IC600H 2P 10A CURVA C A9F87210 MGA87210', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:26', '2025-12-30 16:34:26', NULL),
(1273, '990000071992315', 'INTERRUPTOR AUTOM. RIEL 1P 10A 230VAC CURVA C 6KA EZ9F56110 MG56110', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:26', '2025-12-30 16:34:26', NULL),
(1274, '990000071992316', 'DISCO TRASLAPADO / LAMINADO 4 1/2 GRANO 40', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:26', '2025-12-30 16:34:26', NULL),
(1275, '990000071992317', 'DISCO TRASLAPADO / LAMINADO 4 1/2 GRANO 60', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:26', '2025-12-30 16:34:26', NULL),
(1276, '990000071992318', 'DISCO TRASLAPADO / LAMINADO 4 1/2 GRANO 120', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:26', '2025-12-30 16:34:26', NULL),
(1277, '990000071992319', 'CALEFONT RINNAI ECO 30/36 GL', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:26', '2025-12-30 16:34:26', NULL),
(1278, '990000071992320', 'RUEDAS PARA PUERTA DUCHA BANOS', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:26', '2025-12-30 16:34:26', NULL),
(1279, '990000071992321', 'BROCA DE 4 PUNTAS 6X160MM(HEMIC)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:26', '2025-12-30 16:34:26', NULL),
(1280, '990000071992322', 'EXTRACTOR AX CASALS HJBM PLUS 56 T4 0.75KW', '', NULL, 2.00, 2.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:26', '2026-01-12 19:29:32', NULL),
(1281, '990000071992323', 'SFC 400 III 2.2A (PARA HJBMPLUS 56 T4)', '', NULL, 2.00, 2.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:26', '2026-01-12 19:30:06', NULL),
(1282, '990000071992324', 'RODAMIENTO 6004-2RSH (SKF)', '', NULL, 0.00, 0.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:26', '2026-01-12 00:26:32', NULL),
(1283, '990000071992325', 'ELECTROVALVULA SOLENOIDE DE 1/2\" 220v/50hz', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:26', '2025-12-30 16:34:26', NULL),
(1284, '990000071992326', 'Arandela D1=42,5 D2=6 L1=6 codigo 105892254', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:26', '2025-12-30 16:34:26', NULL),
(1285, '990000071992327', '(WURTH) CORONA HSS ROMPERITUTAS COMPL D=38', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:26', '2025-12-30 16:34:26', NULL),
(1286, '990000071992328', 'TERMINAL PTV 1.25-10', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:26', '2025-12-30 16:34:26', NULL),
(1287, '990000071992329', 'VALVULA SOLENOIDE NORMAL CERRADA 2 VIAS, 1 ENTRADA / 1 SALIDA, HILO 1/2, ORIFICIO 14MM (S0040206)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:26', '2025-12-30 16:34:26', NULL),
(1288, '990000071992330', '(SCHNEIDER) CONECTOR POTENCIA TRIPOLAR 6A 24VDC 1NA (LP1K0610BD)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:26', '2025-12-30 16:34:26', NULL),
(1289, '990000071992331', 'MINI BOBINA ENCAPSULADA (S6832805)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:26', '2025-12-30 16:34:26', NULL),
(1290, '990000071992332', 'CABLE ECO-REVI L/H 4x2.5MM RZ1-K NEGRO 0.6/1KV 90C', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:26', '2025-12-30 16:34:26', NULL),
(1291, '990000071992333', 'RESORTES ACERO INOXIDABLE 2.5', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:26', '2025-12-30 16:34:26', NULL),
(1292, '990000071992334', 'ELECTROVALVULA SOLENOIDE DE 1/2\" DE 24 VDC BSP', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:26', '2025-12-30 16:34:26', NULL),
(1293, '990000071992335', 'LLAVE DE TABLERO CRUZ', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:26', '2025-12-30 16:34:26', NULL),
(1294, '990000071992336', 'Buje De Agitador (Fabricado)', 'BUJE DE AGITADOR - Fabricación buje con cabeza en POLIETILENO de ultra alta densidad (UHMW). Este material es sanitario y tiene mayor estabilidad dimensional) Diámetro exterior cabeza 60 mm. Diámetro del cuerpo 43.5 mm. Interior 30 mm por un largo de 55 mm.', 1, 0.00, 1.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:26', '2026-01-12 16:40:07', NULL),
(1295, '990000071992337', 'Motor Trifasico Volt 380 5.5 Kw Rpm 960 Frecuencia 50Hz\"', '\"MOTOR TRIFASICO\r\nvolt 380\r\n5,5 kw \r\nrpm 960\r\nfrecuencia 50HZ\"', 34, 0.00, 1.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:26', '2026-01-12 16:41:25', NULL),
(1296, '990000071992338', 'FOTOSENSOR, NPN, DISTANCIA 10 CM DC10-30V, FRECUENCIA 80 HZ', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:26', '2025-12-30 16:34:26', NULL),
(1297, '990000071992339', 'INTERRUPTOR AUTOMATICO IC60H 4P 40A C A9F87440 MGA87440', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:26', '2025-12-30 16:34:26', NULL),
(1298, '990000071992340', 'INTERRUPTOR AUT 3P 25A 6KA EASY9 EZ9F56325', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:26', '2025-12-30 16:34:26', NULL),
(1299, '990000071992341', 'INTERRUPTOR TERMOMAGNETICO EASY9 2P 10A EZ9F56210 MG56210', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:26', '2025-12-30 16:34:26', NULL),
(1300, '990000071992342', 'INT AUT 1X10A C 15KA A9F87110 MGA87110', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:26', '2025-12-30 16:34:26', NULL),
(1301, '990000071992343', 'BRIDA INOXIDABLE ANSI B16T', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:26', '2025-12-30 16:34:26', NULL),
(1302, '990000071992344', 'EXTRACTOR AIRE AIROLITE MK 150 TURBO', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:26', '2025-12-30 16:34:26', NULL),
(1303, '990000071992345', 'PERNO ANCLAJE EXPANSIÓN 1/2 12MM', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:26', '2025-12-30 16:34:26', NULL),
(1304, '990000071992346', 'GAS PROPANO MAPP 400GR', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1305, '990000071992347', 'CAJA GALV. EN CALIENTE 400x300x150 UNIV. C-34(A)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1306, '990000071992348', 'CABLE ECO-REVI L/H 3x4MM RZ1-K NEGRO 0.6/1KV 90C', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1307, '990000071992349', 'Iman de valvula 3/2 codigo 80260223001', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1308, '990000071992350', '11.1311.8800.01 chapa de proteccion', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1309, '990000071992351', 'Equipos Led 18W redondo diametro 22cm', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1310, '990000071992352', 'SELLO CHESTERTON 491/DIN 28 M SA SSC/SSC S FKM', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1311, '990000071992353', 'CUCHILLA OLLARI 6/A 034 LM.326-0017', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1312, '990000071992354', 'AISLADOR DE PASO 3/16', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1313, '990000071992355', 'ROSCALATA BINDING 8X1 1/4', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1314, '990000071992356', 'PERFIL ANGULO INOXIDABLE 40*40MM', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Tiras', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1315, '990000071992357', 'PERFIL CUADRADO INOXIDABLE 40*40MM', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Tiras', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1316, '990000071992358', 'CODO INOXIDABLE 90° 1HI ', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1317, '990000071992359', 'TEE INOXIDABLE 1HI', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1318, '990000071992360', 'NIPLE INOX 1X5', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1319, '990000071992361', 'NIPLE INOX 1X4', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1320, '990000071992362', 'NIPLE TUERCA INOX 1X2', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1321, '990000071992363', 'REDUCCION BUSHING INOX 1 A 3/4', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1322, '990000071992364', 'REDCUCCION BUSHING INOX 3/4 A 1/2', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1323, '990000071992365', 'REDUCCION BUSHING 1X3/4', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1324, '990000071992366', 'VALVULA DE BOLSA INOX 1', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1325, '990000071992367', 'VALVULA DE BOLA INOXIDABLE 1/2', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1326, '990000071992368', 'NIPLE TUERCA INOX 3/4 X 2', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1327, '990000071992369', 'POLO ADICIONAL N CODIGO LEGRAND 022213', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1328, '990000071992370', 'MACHO NPT 1/4', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1329, '990000071992371', 'ESCALERA FIBRA VIDRIO TIJERA 1.53M', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1330, '990000071992372', 'MOTOR ELECTRICO MARCA CEMER 1,5Kw (2HP)-900RPM-B3-220V TRIFASICO FRAME100 PASANTE DE 28MM', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1331, '990000071992373', 'VALVULA SOLENOIDE 2 VIAS 1 1/2 BOBINA 24VDC S0070121', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1332, '990000071992374', 'VALVULA SOLENOIDE 2 VIAS 1P BOBINA 24VDC S0060126', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1333, '990000071992375', 'TUBERIA CONDUIT EMT 32MMX1.4MMX3MTS IEC 61386-21 4422', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1334, '990000071992376', 'CURVA GALV P/CONDUIT EMT IEC 32MM', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1335, '990000071992377', 'COPLA GALV P-COND EMT IEC 32MM', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1336, '990000071992378', 'ABRAZ TIPO CD ZINC E/PERNO IEC 32MM', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1337, '990000071992379', 'RIEL U 29 X 6 MTS ACERO AL CARBONO', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1338, '990000071992380', 'RETEN 40-58-8', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1339, '990000071992381', 'ROMPEVIRUTAS COMPLETA 22MM', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1340, '990000071992382', 'ANGULO LAMINADO 40*40*3mm', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1341, '990000071992383', 'GOLILLA PLANA 1/2', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1342, '990000071992384', 'PLATO PARA ESMERIL BAUKER 4 1/2', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1343, '990000071992385', 'ACEITE 15W 40', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1344, '990000071992386', 'SPRAY BARNIZ DIELECTRICO', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1345, '990000071992387', 'PORTA ETIQUETA 56MM', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1346, '990000071992388', 'CONECTOR RECTO 25 MM P/FLEX C/PVC 2441075 2230175', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1347, '990000071992389', 'INTERRUPTOR DIFERENCIAL BIPOLAR 25A 30MA 220/240VAC MARCA: SCHNEIDER Código Sonepar REF: A9R71225', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1348, '990000071992390', 'SEGURO SEGERS SEAGERS EXTERIOR 12MM INOX', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1349, '990000071992391', 'SEGURO SEGERS SEAGERS EXTERIOR 10MM INOX', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1350, '990000071992392', 'PORTA ETIQUETA 56X22 MM', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1351, '990000071992393', 'PERNO HEXAGONAL AC. INOX 8-1.25X16', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1352, '990000071992394', '(LEGRAND) BORNERA RIEL DIN TIERRA 20-8 AWG 600V', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1353, '990000071992395', 'REMACHE 4.8X30', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1354, '990000071992396', 'REMACHE 4.8X12', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1355, '990000071992397', 'REMACHE 4X12', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1356, '990000071992398', 'RODAMIENTO 6306-2RSR-C07-C3', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1357, '990000071992399', 'Terminales neumaticos de 3/8 x 10 (conector recto nique)', '', NULL, 16.00, 8.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2026-01-12 19:30:43', NULL),
(1358, '990000071992400', 'Electro-valvulas SMC modelo VT 317-5DZ-02 (valvula solenoide) de 3/8” normalmente cerrada bobina 24 VDC', '', NULL, 2.00, 1.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2026-01-12 19:30:51', NULL),
(1359, '990000071992401', 'CALEFACTOR HORNO ELECTRICO VHC-1A/4A', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1360, '990000071992402', 'CAM LOCK TYPE A INOX 3/4', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1361, '990000071992403', 'CAM LOCK TYPE C INOX 3/4', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1362, '990000071992404', 'PARADA DE EMERGENCIA SCHNEIDER TE45050 FAB XB4BS8442', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1363, '990000071992405', 'PRENSA TIG 1/8\"', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1364, '990000071992406', 'TUNGSTENO 2& THORIO 1/8 3.2mm', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1365, '990000071992407', 'varilla de aporte de 1/8\"', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1366, '990000071992408', 'CERAMICA GAS LENS 1/2\", WP26/17', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1367, '990000071992409', 'PRENSA TIG 3/32 WP17/18/26', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1368, '990000071992410', 'PERNO PRISIONERO inoxidable 10X16mm', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1369, '990000071992411', 'PERNO PRISIONERO inoxidable 4X10mm', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1370, '990000071992412', 'PERNO PRISIONERO inoxidable 8X16mm', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1371, '990000071992413', 'RODAMIENTO 6204-2RSH', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1372, '990000071992414', 'FERRUL CON AISLACION AMARILLO PARA CABLESDE 1.0MM', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1373, '990000071992415', 'FERRUL CON AISLACION AMARILLO PARA CABLES DE 1.5MM', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1374, '990000071992416', 'FERRUL CON AISLACION AZUL PARA CABLES DE 2.5MM', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1375, '990000071992417', 'TERMINAL COBRE ESTAÃADO CORTO PARA CABLE 4MM PERFORACION 8MM', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1376, '990000071992418', 'TERMINAL COBRE ESTAÃADO CORTO PARA CABLE 6MM PERFORACION 8MM', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1377, '990000071992419', 'Racores reguladores de flujo de 1/8” y manguera para manguera de 6', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1378, '990000071992420', 'Racores reguladores de 1/8” y manguera para manguera de 8', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1379, '990000071992421', 'Racores reguladores de flujo de 1/4” y manguera para manguera de 6', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1380, '990000071992422', 'Racores reguladores de flujo de 1/4” y manguera para manguera de 8', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1381, '990000071992423', 'Reducciones de manguera 8 a manguera 6', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1382, '990000071992424', 'Tapon obturador comando redondo negro 22mm TE53061', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1383, '990000071992425', 'Juego de piezas de repuesto émbolo d 2.883-988.0', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1384, '990000071992426', 'Asiento de valvula 5.581-270.0', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1385, '990000071992427', 'Valvula de derivacion solo para recam 2.885-129.0', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1386, '990000071992428', 'Bola de 3/8 G80-1..4034 7.401-910.0', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1387, '990000071992429', 'Anillo de guarnicion 10x2 NBR 70 6.362-151.0', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1388, '990000071992430', 'Anillo de guarnicion 9x1.5 NBR 70 6.362-384.0', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1389, '990000071992431', 'Embolo completo solo para recambio 4.553-282.0', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1390, '990000071992432', 'Disco 5.115-991.0', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1391, '990000071992433', 'Resorte helicoidal 5.332-187.0', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1392, '990000071992435', 'Anillo de guarnicion 36x2 NBR 70 6.362-092.0', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1393, '990000071992436', 'Anillo de apoyo 20x30x4.2 6.365-378.0', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1394, '990000071992437', 'Valvula 3 stueck 2.884-512', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1395, '990000071992438', 'Válvula completo 4.580-594', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1396, '990000071992439', 'Pistola easy press DN 6/8 int 11mm 4.775-463.0', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1397, '990000071992440', 'Lanza dosificadora embalado 4.760-660', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1398, '990000071992441', 'Contactor LC1-D18 B7 6.632-356.0', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1399, '990000071992442', 'Transformador de control 6.622-278', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1400, '990000071992443', 'TAPA WC OVALADA', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1401, '990000071992444', 'MONOMANDO LAVATORIO TAUMM', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1402, '990000071992445', 'CERRADURA BAÑO DORMITORIO', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1403, '990000071992446', 'CONECTOR EXTENSIBLE WC', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1404, '990000071992447', 'BOTON DESCARGA WC DUAL', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1405, '990000071992448', 'PUNTA PHILLIPS DOBLE PH2', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1406, '990000071992449', 'PUNTA MAGNETICA HEXAGONAL 1/4', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1407, '990000071992450', 'PUNTA MAGNETICA HEXAGONAL 5/16', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1408, '990000071992451', 'PUNTA MAGNETICA HEXAGONAL 3/8', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1409, '990000071992452', 'BOMBA ESPA PRISMA 25 5M 1.5HP 220V', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1410, '990000071992453', 'ESTANDO EQUIPO FLUORESCENTE 2x18w 220v  IP65 IK08 220V', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1411, '990000071992454', 'EQUIPO LINEAL LED ACRO V CCT-SWITCH 48W 40/50/6000K IP66 #80192 WEST', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1412, '990000071992455', 'TUBO LED VIDRIO OPAL LUZ FRIA 6500K 18W L:1200M 220V', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1413, '990000071992456', 'VALVULA JSB31-ST20AN-3S', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1414, '990000071992457', 'BULLETIN 440N', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1415, '990000071992458', 'Cable Libre De Halógeno RZ1-K Multipolar 5 x 1.5mm² Código vitel  SKU 0002604440N', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Metros', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1416, '990000071992459', 'Redondo Azul 16-14 Awg(1.5mm²-2.5mm²) Diámetro 4 Mm Código vitel SKU 0730542024', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1417, '990000071992460', 'Cable Libre De Halógeno RZ1-K Multipolar 5 x 2.5mm²', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Metros', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1418, '990000071992461', 'HUINCHA DE MEDIR 8 MT TRUPER 14579', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1419, '990000071992462', '(HELA) RODILLO CORTAGOTA 18/7\"', '', NULL, 5.00, 7.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2026-01-12 19:30:59', NULL),
(1420, '990000071992463', 'CINTA MASKING TAPE 36 MM X 40 MTS TESA', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1421, '990000071992464', 'ESMALTE SPRAY BLANCO OPACO WALTEK', '', NULL, 40.00, 12.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2026-01-14 19:59:11', NULL),
(1422, '990000071992465', 'ESPATULA HELA 100 MM', '', NULL, 3.00, 1.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2026-01-12 19:31:07', NULL),
(1423, '990000071992466', 'TELEMETRO LASER GLM 40 TELCU / BOSCH', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1424, '990000071992467', 'MT. MANGUERA NIVEL M10 INDUSTRIAL', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1425, '990000071992468', 'Reten doble labio de biton 40x55x8mm', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1426, '990000071992469', 'reten doble labio de biton  40x62x11mm', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1427, '990000071992470', 'reten doble labio de biton  30x640x10mm', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1428, '990000071992471', 'PIÑON 16 DIENTES 06 B', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1429, '990000071992472', 'PIÑON 15 DIENTES 06 B', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1430, '990000071992473', 'MONOMANDO LAVAPLATO CUELLO FLEXIBLE BLACK 6NV2000-00 NIBSA', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1431, '990000071992474', 'Motor Electrico Abb 1,5 Kw (2 Hp) - 2800 Rpm - B3 - 380 V Frame 90 Eje De 24 Mm', '', 34, 0.00, 1.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2026-01-20 14:41:28', NULL),
(1432, '990000071992475', 'PULSADOR HONGO ROJO 22MM 1NC XB4BT842 TE45048', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1433, '990000071992476', 'SELECTOR MANETA LARGA 3 POSICIONES METAL NEGRO 22MM 2NA XB4BJ33 TE46233', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1434, '990000071992477', '020601 VSH4310A-03 VAL.5/3 MAN.3/8in. PAL/AIRE', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1435, '990000071992478', '014005 KQ2H10-03AS CONEC.RECTO T/10 3/8in.TEFL', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1436, '990000071992479', '007210 AN30-03 SILENC.PLASTICO 3/8in 8', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1437, '990000071992480', '014761 KQG2H10-04S CONECTOR RAPIDO RECTO 1/2 INOXIDABLE A T 10MM', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1438, '990000071992481', '300619 AC40-N04DE-D FRL 1/2\"NPT PURGA N.A MANO', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1439, '990000071992482', '013939 KQ2H04-02AS CONEC.RECTO T/04 1/4in.TEFL', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1440, '990000071992483', 'TAPA TORNILLO PVC 1/2 HE', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1441, '990000071992484', 'TAPA TORNILLO PVC 3/4 HE', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1442, '990000071992485', 'TEE PVC HID 20 x 1/2 HI-HI-HI', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1443, '990000071992486', 'NIPPLE TUERCA DE PVC 1/2 HE HE', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1444, '990000071992487', 'NIPLE TUERCA PVC 3/4 HE HE', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1445, '990000071992488', 'HILO X METRO INOX 3/8', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1446, '990000071992489', 'HILO X METRO INOX 8-1.25MM', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1447, '990000071992490', 'HILO X METRO INOX 10-1.5MM', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1448, '990000071992491', 'HILO X METRO INOX 12-1.75MM', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1449, '990000071992492', 'HILO X METRO INOX 16-2MM', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1450, '990000071992493', 'TUERCA HEXAGONAL INOXIDABLE 3/8', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1451, '990000071992494', 'DCI-500 GAL. (3.785 L) COMP. B, CATALIZADOR EXTERIOR (DCI-300 / DPI-500) IU500N0000N35', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1452, '990000071992495', '805-67/67A CORREA RUEDA ESTIRADERA TOPOS (cerdo/vaca/cordero)', '', NULL, 4.00, 4.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2026-01-12 19:31:45', NULL),
(1453, '990000071992496', '805-82 EJE CLUSTER', '', NULL, 6.00, 4.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2026-01-12 19:31:55', NULL),
(1454, '990000071992497', '805-82-1 ARANDELA PARA EJE CLUSTER', '', NULL, 6.00, 4.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2026-01-12 19:32:05', NULL),
(1455, '990000071992498', '805-93 MUELLE FLOJO', '', NULL, 5.00, 4.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2026-01-14 18:25:21', NULL),
(1456, '990000071992499', '805-60 RUEDA-NAVE, COMPLETA', '', NULL, 3.00, 4.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2026-01-12 19:32:21', NULL),
(1457, '990000071992500', '805-110 FRENO MAGNETICO 24V', '', NULL, 6.00, 4.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2026-01-12 19:33:33', NULL),
(1458, '990000071992501', '805-94 TRANSMISSOR IMPULSOS ROJO', '', NULL, 6.00, 4.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2026-01-12 19:33:42', NULL),
(1459, '990000071992502', '805-95 TRANSMISSOR IMPULSOS VERDE', '', NULL, 5.00, 4.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2026-01-21 15:29:01', NULL),
(1460, '990000071992503', '805-90A GOMA PALANCA', '', NULL, 1.00, 4.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2026-01-21 15:29:01', NULL),
(1461, '990000071992504', '805-111 FRENO MECANICO PARA DIME 804-805', '', NULL, 6.00, 4.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2026-01-12 19:34:10', NULL),
(1462, '990000071992505', '805-29 SEPARADOR CON RETEN', '', NULL, 3.00, 4.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2026-01-12 19:34:25', NULL),
(1463, '990000071992506', '805-62 TAPA RUEDA', '', NULL, 2.00, 4.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2026-01-12 19:34:38', NULL),
(1464, '990000071992507', '805-160 PLC', '', NULL, 0.00, 4.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2026-01-21 15:28:50', NULL),
(1465, '990000071992508', '805-162N UNIDAD DE ENTRADA/SALIDA', '', NULL, 1.00, 4.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2026-01-12 19:34:54', NULL),
(1466, '990000071992509', '805-163 FUENTE DE ALIMENTACION', '', NULL, 1.00, 4.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2026-01-12 19:35:00', NULL),
(1467, '990000071992510', '805-164 MAGNETOTERMICO', '', NULL, 1.00, 4.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2026-01-12 19:35:12', NULL);
INSERT INTO `insumos` (`id`, `codigo_sku`, `nombre`, `descripcion`, `categoria_id`, `stock_actual`, `stock_minimo`, `stock_critico`, `precio_costo`, `moneda`, `unidad_medida`, `imagen_url`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1468, '990000071992511', '805-165 VENTILADOR', '', NULL, 1.00, 4.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2026-01-12 19:35:23', NULL),
(1469, '990000071992512', '805-166 PULSADOR', '', NULL, 3.00, 4.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2026-01-12 19:35:38', NULL),
(1470, '990000071992513', '805-81 MECANISMO DE MEDICION', '', NULL, 2.00, 4.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2026-01-12 19:35:48', NULL),
(1471, '990000071992514', '805-93A MUELLE DURO', '', NULL, 3.00, 4.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2026-01-12 19:35:59', NULL),
(1472, '990000071992515', '805-148 MOTOR ELECTRICO 0.18KW', '', NULL, 2.00, 4.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2026-01-13 13:29:55', NULL),
(1473, '990000071992516', 'Tubo conduit métalico flexible c/pvc 32mm 2490125', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1474, '990000071992517', 'Conector tubo flexible curvo 90° 25mm LLTN25', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1475, '990000071992518', 'Cinta de teflon 81.848121005', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1476, '990000071992519', 'EXTRACTOR AIRE AIROLITE MK 125 TURBO', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1477, '990000071992520', 'OZONO BIKE (MANGO DE BICICLETA PARA MÃÂQUINA)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1478, '990000071992521', 'PEGAMENTO DIDEPREN GALON', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1479, '990000071992522', 'GRATA COPA ACERO 3 UYUSTOOLS', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1480, '990000071992523', 'Proyector LED Neptuno-66 150W 6000K 15000 Lúmenes 240V IP66 IK08 Código Vitel SKU 0114935345', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1481, '990000071992524', 'MALLA MOSQUETERA', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1482, '990000071992525', 'SELLO MEC PR/FN 28 XPGF', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1483, '990000071992526', 'SELLO MEC DIN BT PLF 028 BP', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1484, '990000071992527', 'GUIA VENTANA', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1485, '990000071992528', 'MODULO INTERRUPTOR 9/12 16A 250V 5001', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1486, '990000071992529', 'TUERCA HEXAGONAL G2 UNC ZN 3/16\" (#10-24)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1487, '990000071992530', 'Grata copa acero 4 pulgadas 100mm', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1488, '990000071992531', 'RETEN 30-44-7', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1489, '990000071992532', 'ACEITE H68', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1490, '990000071992533', 'ACEITE TRAXON 220', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1491, '990000071992534', 'Cable Control 7G1.5mm² JZ-500 HMH Gris código vitel SKU 0016606672', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Metros', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1492, '990000071992535', 'Cable Control 3G1.0mm² JZ-500 HMH Gris código vitel SKU 0016606608', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1493, '990000071992536', 'Cable Control 3G1.5mm² JZ-500 HMH Gris SKU 0016606655', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Metros', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1494, '990000071992537', 'Sello clamp ferrule 32mm DN 32', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1495, '990000071992538', 'Sello clamp ferrule 38mm DN 38', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1496, '990000071992539', 'Sello clamp ferrule 50mm DN 50', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1497, '990000071992540', 'Caja de derivación lisa 4\"x4\" 110x110x60mm', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1498, '990000071992541', 'Ferrul con aislación naranjo E0508', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1499, '990000071992542', 'TERMINAL NIQUELADO COMPRESION 98031 4/2 - 1/2', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1500, '990000071992543', 'LLAVE METALICA MULTIUSOS / LLAVE DE TABLERO ELECTRICO', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1501, '990000071992544', 'DIN RAIL TEMPERATURE TRANSMITTER MODEL: TT-311 1 INPUT 1 OUTPUT', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1502, '990000071992545', 'TERMOMETRO BIMETALICO, VAINA INFERIOR 1/2 100X200X6,35', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1503, '990000071992546', 'TERMOMETRO BIMETALICO, VAINA POSTERIOR 1/2 100X200X6,35', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1504, '990000071992547', 'VAINA PROTECTORA A520100K', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1505, '990000071992548', 'FERRULES CON AISLACION 2.5MM2 NEGRO', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1506, '990000071992549', 'TERMINAL ELÉCTRICO OJO 6,7MM 10-12AWG AMARILLO MV10-14R/SX (3M49171)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1507, '990000071992550', 'TERMINAL ELÉCTRICO OJO 5,1MM 10-12AWG AMARILLO', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1508, '990000071992551', 'Terminal Horquilla Amarrillo 12-10 Awg(4mm²-6mm²) Diametro 5 Mm', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1509, '990000071992552', 'Terminal Redondo Amarrillo 12-10 Awg(4mm²-6mm²) Diámetro 5 Mm', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1510, '990000071992553', 'Terminal Horquilla Amarrillo 12-10 Awg(4mm²-6mm²) Diámetro 6 Mm', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1511, '990000071992554', 'Terminal Horquilla Amarrillo 12-10 Awg(4mm²-6mm²) Diámetro 4 Mm', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1512, '990000071992555', 'Terminal Redondo Amarrillo 12-10 Awg(4mm²-6mm²) Diámetro 4 Mm', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1513, '990000071992556', 'FERRULES CON AISLACION 0.75MM2 BLANCO', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1514, '990000071992557', 'BLOCK CONTACTO AUXILIAR GUARDAMOTOR FRONTAL 1NA+1NC TESYS', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1515, '990000071992558', 'Terminal Macho Azul 16-14 Awg(1.5mm²-2.5mm²) Diámetro 6.3 Mm', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1516, '990000071992559', 'Terminal Redondo Azul 16-14 Awg(1.5mm²-2.5mm²) Diámetro 4 Mm', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1517, '990000071992560', 'Terminal Redondo Azul 16-14 Awg(1.5mm²-2.5mm²) Diámetro 6 Mm', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1518, '990000071992561', 'Terminal Redondo Azul 16-14 Awg(1.5mm²-2.5mm²) Diámetro 3 Mm', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1519, '990000071992562', 'Terminal Redondo Rojo 22-16 Awg(0.5mm²-1.5mm²) Diámetro 6 Mm', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1520, '990000071992563', 'Terminal Redondo Rojo 22-16 Awg(0.5mm²-1.5mm²) Diámetro 3 Mm', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1521, '990000071992564', 'Terminal Redondo Amarrillo 12-10 Awg(4mm²-6mm²) Diámetro 6 Mm', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1522, '990000071992565', 'Terminal Redondo Amarrillo 12-10 Awg(4mm²-6mm²) Diámetro 10 Mm', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1523, '990000071992566', 'Terminal Pino Amarrillo 12-10 Awg(4mm²-6mm²) Diámetro 10 Mm', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1524, '990000071992567', 'Regleta Conexión Riel DIN 12 Contactos 20A Cable hasta 6mm2 Verde', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1525, '990000071992568', 'Botonera vacia Osmoz con 3 perforaciones, color gris, IP 66 - IK 07', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1526, '990000071992569', 'Boton de corte de emergencia no luminoso Osmoz - pulsar/girar - rojo - Ø40 mm', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1527, '990000071992570', 'Cabeza para boton pulsador no luminoso con anillos de sujeción Osmoz, color rojo, plano Ø 22 mm, IP 69', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1528, '990000071992571', 'Interruptor seccionador rotativo de seguridad, empotrable con portacandado, tripolar de 80 A', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1529, '990000071992572', 'Bloque tripolar 32 A para interruptores seccionadores rotativos componibles', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1530, '990000071992573', 'Cabeza para boton pulsador no luminoso con anillos de sujeción Osmoz, color verde, plano Ø 22 mm, IP 69', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1531, '990000071992574', 'INTERRUPTOR AUTOM. CURVA C 16A 6KA EZ9F56216', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1532, '990000071992575', 'TERMOCONTRAIBLE NEGRO 18/9 MM', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1533, '990000071992576', 'Visagra de puerta Vaiven', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:27', '2025-12-30 16:34:27', NULL),
(1534, '990000071992577', 'Selector mando llave 2 posiciones 90 grados 22mm 1NA Harmony XB4 TE46361 CB4BG61', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:28', '2025-12-30 16:34:28', NULL),
(1535, '990000071992578', 'Sellotec Silicona Acetica con Fungicida SC1000S GRIS', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:28', '2025-12-30 16:34:28', NULL),
(1536, '990000071992579', 'Silicona Ultra BLANCO (LANCO) 305 ml', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:28', '2025-12-30 16:34:28', NULL),
(1537, '990000071992580', 'REFRIGERATION TUBO DEHYDRATED JT TUBE 3/16 O.D X 0.6MM X50FT COIL', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:28', '2025-12-30 16:34:28', NULL),
(1538, '990000071992581', 'RASMI ELECTRONICS SINGLE PHASE RFI FILTER TYPE RF 1007-BER', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:28', '2025-12-30 16:34:28', NULL),
(1539, '990000071992582', 'MEDIDOR DE AGUA SJ-SDC- DN20, L 130 Q3 =4 (COSMOPLAS)', '', NULL, 1.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:28', '2026-01-12 19:42:06', NULL),
(1540, '990000071992583', 'VALVULA DE DESCARGA ANTIVANDALISMO - CHROME (DOCOL)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:28', '2025-12-30 16:34:28', NULL),
(1541, '990000071992584', 'VALVULA PARA CHUVEIRO AP - PRESSMATIC ANTIVANDALISMO CHROME', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:28', '2025-12-30 16:34:28', NULL),
(1542, '990000071992585', 'Tamiz 80.121.4082.84 (Multivac)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:28', '2025-12-30 16:34:28', NULL),
(1543, '990000071992586', 'Temporizador 24-240VAC/DC (8201)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:28', '2025-12-30 16:34:28', NULL),
(1544, '990000071992587', 'Casquillo D1=38 D2=10,2 L1=26 (10.735.7334) Multivac', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:28', '2025-12-30 16:34:28', NULL),
(1545, '990000071992588', 'Valvula reguladora de flujo T/10mm x 1/2in (AS4201F-U04-10SA)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:28', '2025-12-30 16:34:28', NULL),
(1546, '990000071992589', 'Bracket tipo T FRL 40 (Y400T-A) SMC', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:28', '2025-12-30 16:34:28', NULL),
(1547, '990000071992590', 'Conector codo T/08 1/8in A/I (KQG2L08-01S) SMC', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:28', '2025-12-30 16:34:28', NULL),
(1548, '990000071992591', 'Conector recto T10x1/4in NIQ (KQ2H10-02NS) SMC', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:28', '2025-12-30 16:34:28', NULL),
(1549, '990000071992592', '11.111.8561.01 Perno (Multivac)', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:28', '2025-12-30 16:34:28', NULL),
(1550, '990000071992593', 'Silenciador plastico compacto 1/8in (AN10-01) SMC', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:28', '2025-12-30 16:34:28', NULL),
(1551, '990000071992594', 'Spare part kit screw set for flow sensor 8012', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:28', '2025-12-30 16:34:28', NULL),
(1552, '990000071992595', 'MANGUERA INDUSTRIAL 6MM 124022 DURA PVC CLEAR HOSE 6MM X 8.4MM X 50M', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:28', '2025-12-30 16:34:28', NULL),
(1553, '990000071992596', 'RODAMIENTO 608 2RSR2', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:28', '2025-12-30 16:34:28', NULL),
(1554, '990000071992597', 'RODAMIENTO 51110', '', NULL, 0.00, 5.00, 2.00, 0.00, 'CLP', 'Unidad', NULL, '2025-12-30 16:34:28', '2025-12-30 16:34:28', NULL),
(1555, '990000071992670', 'Bomba Centrifuga - Sello  Para Bomba Centrifuga Reggio  Sn 40 1608', '', 30, 0.00, 2.00, 2.00, 0.00, 'CLP', 'UN', NULL, '2026-01-12 17:05:19', '2026-01-12 17:07:36', NULL),
(1556, '990000071992671', 'Safety Relay Pnoz Pilz S4 Numero Pnoz S.4', '', 2, 0.00, 2.00, 2.00, 0.00, 'CLP', 'UN', NULL, '2026-01-12 17:05:35', '2026-01-12 17:07:45', NULL),
(1557, '990000071992672', 'Relay Sockert 40.52 Marca Finder Numero 95.55', '', 2, 0.00, 2.00, 2.00, 0.00, 'CLP', 'UN', NULL, '2026-01-12 17:05:48', '2026-01-12 17:07:53', NULL),
(1558, '990000071992673', 'Linkrelay 2X Change-Over Contact  Marca Finder Numero 42.52', '', 2, 0.00, 2.00, 2.00, 0.00, 'CLP', 'UN', NULL, '2026-01-12 17:06:04', '2026-01-12 17:08:00', NULL),
(1559, '990000071992674', 'Safety Switch Plastic Numero Bns3302Zst-2187 Marca Schmersal', '', 2, 0.00, 1.00, 2.00, 0.00, 'CLP', 'UN', NULL, '2026-01-12 17:06:19', '2026-01-12 17:08:09', NULL),
(1560, '990000071992675', 'Electro-Valvula 3/4 De Cetrifuga Con Bobina De  24 Voltios/ Ip 65 Para Agua', '', 2, 0.00, 2.00, 2.00, 0.00, 'CLP', 'UN', NULL, '2026-01-12 17:06:30', '2026-01-12 17:08:15', NULL),
(1561, '990000071992676', 'Logo 12/24Rce Logic Module, Disp Ps/I/= 12/24Vd', '', 2, 0.00, 1.00, 2.00, 0.00, 'CLP', 'UN', NULL, '2026-01-12 17:06:43', '2026-01-12 17:08:22', NULL),
(1562, '990000071992677', 'Modulo 4Di 12-24Vdc/4Do Rele', '', 2, 0.00, 1.00, 2.00, 0.00, 'CLP', 'UN', NULL, '2026-01-12 17:06:55', '2026-01-12 17:08:25', NULL),
(1565, '990000071992600', 'Termometro Bimetalico 0 120 C, 60X 70 X 6,35Mm  Bulbo Inox, Hilo 1/4 Npt', '', 2, 2.00, 5.00, 2.00, 0.00, 'CLP', 'UN', NULL, '2026-01-12 19:44:27', '2026-01-12 19:44:42', NULL),
(1569, '990000071992601', 'Termpozo Vaina Hilo Hi-1/4Npt Hembra 1/2 Npt Macho, Largo:  60Mm, Inoxidable', '', 10, 2.00, 5.00, 2.00, 0.00, 'CLP', 'UN', NULL, '2026-01-12 19:48:10', '2026-01-12 19:50:33', NULL),
(1570, '990000071992602', 'Cable Para Sensores Pt100 3 X 0,35Mm2 Funda Fibra  Vidrio Y Malla Metalica Temp.max. -50 + 260 C', '', 2, 30.00, 5.00, 2.00, 0.00, 'CLP', 'MTS', NULL, '2026-01-12 19:48:32', '2026-01-12 19:51:25', NULL),
(1574, '990000071992678', 'Insumo Prueba', 'eawfawfafdaffadf', 7, 100.00, 5.00, 2.00, 10000.00, 'CLP', 'UN', NULL, '2026-01-19 18:45:48', '2026-01-19 18:45:48', NULL),
(1575, 'SERV-01', 'Aaaaaaaaaa', '', 6, 1.00, 0.00, 2.00, 15990.00, 'CLP', 'UN', NULL, '2026-01-20 13:19:21', '2026-01-20 13:19:21', NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `insumo_stock_ubicacion`
--

CREATE TABLE `insumo_stock_ubicacion` (
  `id` int(11) NOT NULL,
  `insumo_id` int(11) NOT NULL,
  `ubicacion_id` int(11) NOT NULL,
  `cantidad` decimal(10,2) NOT NULL DEFAULT 0.00,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `insumo_stock_ubicacion`
--

INSERT INTO `insumo_stock_ubicacion` (`id`, `insumo_id`, `ubicacion_id`, `cantidad`, `updated_at`) VALUES
(13, 71, 1, 10.00, '2026-01-14 18:36:30'),
(14, 89, 1, 20.00, '2026-01-14 18:25:21'),
(15, 202, 1, 0.00, '2026-01-13 13:29:45'),
(16, 225, 1, 6.00, '2026-01-12 19:03:51'),
(17, 228, 1, 4.00, '2026-01-12 19:04:10'),
(18, 380, 1, 12.00, '2026-01-20 12:35:45'),
(19, 767, 1, 4.00, '2026-01-12 19:04:47'),
(20, 790, 1, 2.00, '2026-01-12 19:11:03'),
(21, 966, 1, 30.00, '2026-01-12 19:11:19'),
(22, 1053, 1, 8.00, '2026-01-12 19:28:33'),
(23, 1117, 1, 19.00, '2026-01-12 19:28:52'),
(25, 1120, 1, 18.00, '2026-01-21 15:50:28'),
(26, 1197, 1, 9.00, '2026-01-12 19:29:41'),
(27, 1198, 1, 17.00, '2026-01-12 19:29:23'),
(28, 1280, 1, 2.00, '2026-01-12 19:29:32'),
(30, 1281, 1, 2.00, '2026-01-12 19:30:06'),
(31, 1357, 1, 16.00, '2026-01-12 19:30:43'),
(32, 1358, 1, 2.00, '2026-01-12 19:30:51'),
(33, 1419, 1, 5.00, '2026-01-12 19:30:59'),
(34, 1422, 1, 3.00, '2026-01-12 19:31:07'),
(35, 1421, 1, 40.00, '2026-01-14 19:59:11'),
(36, 1431, 1, 0.00, '2026-01-20 14:41:28'),
(37, 1452, 1, 4.00, '2026-01-12 19:31:45'),
(38, 1453, 1, 6.00, '2026-01-12 19:31:55'),
(39, 1454, 1, 6.00, '2026-01-12 19:32:05'),
(40, 1455, 1, 5.00, '2026-01-14 18:25:21'),
(41, 1456, 1, 3.00, '2026-01-12 19:32:21'),
(42, 1457, 1, 6.00, '2026-01-12 19:33:33'),
(43, 1458, 1, 6.00, '2026-01-12 19:33:42'),
(44, 1459, 1, 5.00, '2026-01-21 15:29:01'),
(45, 1460, 1, 1.00, '2026-01-21 15:29:01'),
(46, 1461, 1, 6.00, '2026-01-12 19:34:10'),
(47, 1462, 1, 3.00, '2026-01-12 19:34:25'),
(48, 1463, 1, 2.00, '2026-01-12 19:34:38'),
(49, 1464, 1, 0.00, '2026-01-21 15:28:50'),
(50, 1465, 1, 1.00, '2026-01-12 19:34:54'),
(51, 1466, 1, 1.00, '2026-01-12 19:35:00'),
(52, 1467, 1, 1.00, '2026-01-12 19:35:12'),
(53, 1468, 1, 1.00, '2026-01-12 19:35:23'),
(54, 1469, 1, 3.00, '2026-01-12 19:35:38'),
(55, 1470, 1, 2.00, '2026-01-12 19:35:48'),
(56, 1471, 1, 3.00, '2026-01-12 19:35:59'),
(57, 1472, 1, 0.00, '2026-01-13 13:29:55'),
(58, 833, 1, 2.00, '2026-01-12 19:41:48'),
(59, 1539, 1, 1.00, '2026-01-12 19:42:06'),
(60, 467, 1, 2.00, '2026-01-12 19:42:29'),
(61, 1565, 1, 2.00, '2026-01-12 19:44:42'),
(62, 1569, 1, 2.00, '2026-01-12 19:50:33'),
(63, 1570, 1, 30.00, '2026-01-12 19:51:25'),
(65, 228, 51, 8.00, '2026-01-13 12:29:16'),
(67, 71, 11, 22.00, '2026-01-13 12:33:04'),
(69, 202, 13, 40.00, '2026-01-14 19:59:24'),
(70, 71, 13, 14.00, '2026-01-14 19:49:16'),
(71, 1472, 41, 2.00, '2026-01-13 13:29:55'),
(73, 552, 19, 0.00, '2026-01-13 13:42:37'),
(75, 552, 1, 0.00, '2026-01-21 18:30:49'),
(76, 1574, 88, 100.00, '2026-01-19 18:45:48'),
(77, 384, 1, 3.00, '2026-01-20 12:11:07'),
(78, 545, 1, 10.00, '2026-01-20 12:11:07'),
(80, 1575, 64, 1.00, '2026-01-20 13:19:21');

--
-- Disparadores `insumo_stock_ubicacion`
--
DELIMITER $$
CREATE TRIGGER `after_stock_insert` AFTER INSERT ON `insumo_stock_ubicacion` FOR EACH ROW BEGIN
    UPDATE insumos 
    SET stock_actual = (
        SELECT IFNULL(SUM(cantidad), 0) 
        FROM insumo_stock_ubicacion 
        WHERE insumo_id = NEW.insumo_id
    ) 
    WHERE id = NEW.insumo_id;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `after_stock_update` AFTER UPDATE ON `insumo_stock_ubicacion` FOR EACH ROW BEGIN
    UPDATE insumos 
    SET stock_actual = (
        SELECT IFNULL(SUM(cantidad), 0) 
        FROM insumo_stock_ubicacion 
        WHERE insumo_id = NEW.insumo_id
    ) 
    WHERE id = NEW.insumo_id;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `movimientos_inventario`
--

CREATE TABLE `movimientos_inventario` (
  `id` int(11) NOT NULL,
  `insumo_id` int(11) NOT NULL,
  `tipo_movimiento_id` int(11) NOT NULL,
  `cantidad` decimal(10,2) NOT NULL,
  `ubicacion_id` int(11) DEFAULT NULL,
  `usuario_id` int(11) NOT NULL,
  `empleado_id` int(11) DEFAULT NULL,
  `ubicacion_envio_id` int(11) DEFAULT NULL,
  `referencia_id` int(11) DEFAULT NULL,
  `observacion` text DEFAULT NULL,
  `fecha` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `movimientos_inventario`
--

INSERT INTO `movimientos_inventario` (`id`, `insumo_id`, `tipo_movimiento_id`, `cantidad`, `ubicacion_id`, `usuario_id`, `empleado_id`, `ubicacion_envio_id`, `referencia_id`, `observacion`, `fecha`) VALUES
(37, 71, 3, 22.00, 1, 3, NULL, NULL, NULL, 'TRASPASO INVENTORIA', '2026-01-12 16:02:47'),
(38, 89, 3, 24.00, 1, 3, NULL, NULL, NULL, 'TRASPASO INVENTORIA', '2026-01-12 16:03:10'),
(39, 202, 3, 48.00, 1, 3, NULL, NULL, NULL, 'TRASPASO INVENTORIA', '2026-01-12 16:03:35'),
(40, 225, 3, 6.00, 1, 3, NULL, NULL, NULL, 'TRASPASO INVENTORIA', '2026-01-12 16:03:51'),
(41, 228, 3, 4.00, 1, 3, NULL, NULL, NULL, 'TRASPASO INVENTORIA', '2026-01-12 16:04:10'),
(42, 380, 3, 4.00, 1, 3, NULL, NULL, NULL, 'TRASPASO INVENTORIA', '2026-01-12 16:04:30'),
(43, 767, 3, 4.00, 1, 3, NULL, NULL, NULL, 'TRASPASO INVENTORIA', '2026-01-12 16:04:47'),
(44, 790, 3, 2.00, 1, 3, NULL, NULL, NULL, 'TRASPASO INVENTORIA', '2026-01-12 16:11:02'),
(45, 966, 3, 30.00, 1, 3, NULL, NULL, NULL, 'TRASPASO INVENTORIA', '2026-01-12 16:11:19'),
(46, 1053, 3, 8.00, 1, 3, NULL, NULL, NULL, 'TRASPASO INVENTORIA', '2026-01-12 16:28:33'),
(47, 1117, 3, 6.00, 1, 3, NULL, NULL, NULL, 'TRASPASO INVENTORIA', '2026-01-12 16:28:44'),
(48, 1117, 3, 13.00, 1, 3, NULL, NULL, NULL, 'TRASPASO INVENTORIA', '2026-01-12 16:28:52'),
(49, 1120, 3, 22.00, 1, 3, NULL, NULL, NULL, 'TRASPASO INVENTORIA', '2026-01-12 16:29:02'),
(50, 1197, 3, 6.00, 1, 3, NULL, NULL, NULL, 'TRASPASO INVENTORIA', '2026-01-12 16:29:12'),
(51, 1198, 3, 17.00, 1, 3, NULL, NULL, NULL, 'TRASPASO INVENTORIA', '2026-01-12 16:29:23'),
(52, 1280, 3, 2.00, 1, 3, NULL, NULL, NULL, 'TRASPASO INVENTORIA', '2026-01-12 16:29:32'),
(53, 1197, 3, 3.00, 1, 3, NULL, NULL, NULL, 'TRASPASO INVENTORIA', '2026-01-12 16:29:41'),
(54, 1281, 3, 2.00, 1, 3, NULL, NULL, NULL, 'TRASPASO INVENTORIA', '2026-01-12 16:30:06'),
(55, 1357, 3, 16.00, 1, 3, NULL, NULL, NULL, 'TRASPASO INVENTORIA', '2026-01-12 16:30:43'),
(56, 1358, 3, 2.00, 1, 3, NULL, NULL, NULL, 'TRASPASO INVENTORIA', '2026-01-12 16:30:51'),
(57, 1419, 3, 5.00, 1, 3, NULL, NULL, NULL, 'TRASPASO INVENTORIA', '2026-01-12 16:30:59'),
(58, 1422, 3, 3.00, 1, 3, NULL, NULL, NULL, 'TRASPASO INVENTORIA', '2026-01-12 16:31:07'),
(59, 1421, 3, 53.00, 1, 3, NULL, NULL, NULL, 'TRASPASO INVENTORIA', '2026-01-12 16:31:17'),
(60, 1431, 3, 1.00, 1, 3, NULL, NULL, NULL, 'Ajuste positivo manual', '2026-01-12 16:31:26'),
(61, 1452, 3, 4.00, 1, 3, NULL, NULL, NULL, 'TRASPASO INVENTORIA', '2026-01-12 16:31:45'),
(62, 1453, 3, 6.00, 1, 3, NULL, NULL, NULL, 'Ajuste positivo manual', '2026-01-12 16:31:55'),
(63, 1454, 3, 6.00, 1, 3, NULL, NULL, NULL, 'TRASPASO INVENTORIA', '2026-01-12 16:32:05'),
(64, 1455, 3, 6.00, 1, 3, NULL, NULL, NULL, 'TRASPASO INVENTORIA', '2026-01-12 16:32:13'),
(65, 1456, 3, 3.00, 1, 3, NULL, NULL, NULL, 'TRASPASO INVENTORIA', '2026-01-12 16:32:21'),
(66, 1457, 3, 6.00, 1, 3, NULL, NULL, NULL, 'TRASPASO INVENTORIA', '2026-01-12 16:33:33'),
(67, 1458, 3, 6.00, 1, 3, NULL, NULL, NULL, 'TRASPASO INVENTORIA', '2026-01-12 16:33:42'),
(68, 1459, 3, 6.00, 1, 3, NULL, NULL, NULL, 'TRASPASO INVENTORIA', '2026-01-12 16:33:51'),
(69, 1460, 3, 2.00, 1, 3, NULL, NULL, NULL, 'TRASPASO INVENTORIA', '2026-01-12 16:34:01'),
(70, 1461, 3, 6.00, 1, 3, NULL, NULL, NULL, 'TRASPASO INVENTORIA', '2026-01-12 16:34:10'),
(71, 1462, 3, 3.00, 1, 3, NULL, NULL, NULL, 'TRASPASO INVENTORIA', '2026-01-12 16:34:25'),
(72, 1463, 3, 2.00, 1, 3, NULL, NULL, NULL, 'TRASPASO INVENTORIA', '2026-01-12 16:34:38'),
(73, 1464, 3, 1.00, 1, 3, NULL, NULL, NULL, 'TRASPASO INVENTORIA', '2026-01-12 16:34:45'),
(74, 1465, 3, 1.00, 1, 3, NULL, NULL, NULL, 'TRASPASO INVENTORIA', '2026-01-12 16:34:54'),
(75, 1466, 3, 1.00, 1, 3, NULL, NULL, NULL, 'TRASPASO INVENTORIA', '2026-01-12 16:35:00'),
(76, 1467, 3, 1.00, 1, 3, NULL, NULL, NULL, 'TRASPASO INVENTORIA', '2026-01-12 16:35:12'),
(77, 1468, 3, 1.00, 1, 3, NULL, NULL, NULL, 'TRASPASO INVENTORIA', '2026-01-12 16:35:23'),
(78, 1469, 3, 3.00, 1, 3, NULL, NULL, NULL, 'TRASPASO INVENTORIA', '2026-01-12 16:35:38'),
(79, 1470, 3, 2.00, 1, 3, NULL, NULL, NULL, 'TRASPASO INVENTORIA', '2026-01-12 16:35:48'),
(80, 1471, 3, 3.00, 1, 3, NULL, NULL, NULL, 'TRASPASO INVENTORIA', '2026-01-12 16:35:59'),
(81, 1472, 3, 2.00, 1, 3, NULL, NULL, NULL, 'TRASPASO INVENTORIA', '2026-01-12 16:36:07'),
(82, 833, 3, 2.00, 1, 5, NULL, NULL, NULL, 'Ajuste', '2026-01-12 16:41:48'),
(83, 1539, 3, 1.00, 1, 5, NULL, NULL, NULL, 'Ajuste', '2026-01-12 16:42:06'),
(84, 467, 3, 2.00, 1, 5, NULL, NULL, NULL, 'Ajuste', '2026-01-12 16:42:29'),
(85, 1565, 3, 2.00, 1, 5, NULL, NULL, NULL, 'Ajuste', '2026-01-12 16:44:42'),
(86, 1569, 3, 2.00, 1, 5, NULL, NULL, NULL, 'Ajuste', '2026-01-12 16:50:33'),
(87, 1570, 3, 30.00, 1, 5, NULL, NULL, NULL, 'Ajuste', '2026-01-12 16:51:25'),
(89, 71, 2, 10.00, 13, 1, NULL, NULL, NULL, 'Entrega a: Nicolas Salas (App). Obs: Entrega operario. Detalle: Ubi #13 (-10)', '2026-01-13 10:30:27'),
(90, 552, 3, 100.00, 19, 1, NULL, NULL, NULL, 'Reubicación (Edición)', '2026-01-13 10:42:26'),
(91, 552, 2, 100.00, 19, 1, NULL, NULL, NULL, 'Entrega a: Nicolas Salas (App). Obs: Entrega operario. Detalle: Ubi #19 (-100)', '2026-01-13 10:42:37'),
(95, 71, 2, 10.00, 13, 1, NULL, NULL, NULL, 'Entrega a: Carla Tapia (Físico). Obs: Entrega operario', '2026-01-14 14:12:08'),
(96, 89, 2, 4.00, 1, 1, 1, NULL, 68, 'Entrega OT', '2026-01-14 15:25:21'),
(97, 1455, 2, 1.00, 1, 1, 1, NULL, 73, 'Entrega OT', '2026-01-14 15:25:21'),
(98, 71, 1, 10.00, 1, 1, NULL, NULL, NULL, 'Devuelto por Rechazo', '2026-01-14 15:36:30'),
(99, 552, 1, 100.00, 1, 1, NULL, NULL, NULL, 'Devuelto por Rechazo', '2026-01-14 15:36:59'),
(100, 552, 2, 10.00, 1, 1, 1, NULL, NULL, 'Entrega a: Nicolas Salas (App). Obs: Entrega operario', '2026-01-14 16:32:34'),
(101, 552, 2, 50.00, 1, 1, 5, NULL, NULL, 'Entrega a: Carla Tapia (Físico). Obs: Entrega operario', '2026-01-14 16:37:39'),
(102, 552, 2, 10.00, 1, 1, 2, NULL, NULL, 'Entrega a: Froilan Urdaneta (App). Obs: Entrega operario', '2026-01-14 16:41:28'),
(103, 552, 2, 29.00, 1, 1, 5, NULL, NULL, 'Entrega a: Carla Tapia (Físico). Obs: Entrega operario', '2026-01-14 16:47:02'),
(104, 552, 2, 1.00, 1, 1, 2, NULL, NULL, 'Entrega a: Froilan Urdaneta (App). Obs: Entrega operario', '2026-01-14 16:47:08'),
(105, 71, 2, 10.00, 13, 1, 3, NULL, NULL, 'Entrega a: Carlos Ruiz (App). Obs: Entrega operario', '2026-01-14 16:49:16'),
(106, 1421, 2, 3.00, 1, 1, 2, NULL, NULL, 'Entrega a: Froilan Urdaneta (App). Obs: Entrega operario', '2026-01-14 16:50:49'),
(107, 1421, 2, 10.00, 1, 1, 2, 6, NULL, 'Entrega a: Froilan Urdaneta (App). Obs: Entrega operario', '2026-01-14 16:59:11'),
(108, 202, 2, 8.00, 13, 1, 5, 5, NULL, 'Entrega a: Carla Tapia (Físico). Obs: Entrega operario', '2026-01-14 16:59:24'),
(109, 384, 1, 3.00, 1, 1, NULL, NULL, 11, 'Recepción OC', '2026-01-20 09:11:07'),
(110, 545, 1, 10.00, 1, 1, NULL, NULL, 11, 'Recepción OC', '2026-01-20 09:11:08'),
(111, 380, 1, 8.00, 1, 1, NULL, NULL, 240000, 'Recepción OC', '2026-01-20 09:35:45'),
(112, 1431, 2, 1.00, 1, 1, 1, NULL, 176, 'Entrega OT', '2026-01-20 11:41:28'),
(113, 1464, 2, 1.00, 1, 1, 1, NULL, 82, 'Entrega OT', '2026-01-21 12:28:50'),
(114, 1460, 2, 1.00, 1, 1, 1, NULL, 78, 'Entrega OT', '2026-01-21 12:29:01'),
(115, 1459, 2, 1.00, 1, 1, 1, NULL, 77, 'Entrega OT', '2026-01-21 12:29:01'),
(116, 1120, 2, 4.00, 1, 1, 1, NULL, 91, 'Entrega OT', '2026-01-21 12:50:28'),
(117, 552, 1, 10.00, 1, 1, NULL, NULL, NULL, 'Devolución voluntaria de operario', '2026-01-21 13:22:16'),
(118, 552, 2, 10.00, 1, 1, 1, 6, NULL, 'Entrega a: Nicolas Salas (App). Obs: Entrega operario', '2026-01-21 14:05:55'),
(119, 552, 1, 10.00, 1, 1, NULL, NULL, NULL, 'Devuelto por Rechazo', '2026-01-21 14:07:05'),
(120, 552, 2, 10.00, 1, 1, 1, 6, NULL, 'Entrega a: Nicolas Salas (App). Obs: LT7 - 1232\n', '2026-01-21 15:30:49');

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
  `url_archivo` varchar(255) DEFAULT NULL,
  `observaciones` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `ordenes_compra`
--

INSERT INTO `ordenes_compra` (`id`, `proveedor_id`, `usuario_creador_id`, `fecha_creacion`, `estado_id`, `moneda`, `tipo_cambio`, `numero_cotizacion`, `monto_neto`, `impuesto_porcentaje`, `impuesto`, `monto_total`, `url_archivo`, `observaciones`, `created_at`, `updated_at`, `deleted_at`) VALUES
(11, 9, 3, '2026-01-13 09:03:55', 3, 'CLP', 1.00, '', 126891.00, 19.00, 24109.29, 151000.29, NULL, NULL, '2026-01-13 12:03:55', '2026-01-20 12:11:08', NULL),
(240000, 220, 1, '2026-01-20 09:22:06', 3, 'CLP', 1.00, '', 195400.00, 19.00, 37126.00, 232526.00, NULL, NULL, '2026-01-20 12:22:06', '2026-01-20 12:35:45', NULL),
(240001, 220, 1, '2026-01-20 09:36:45', 2, 'CLP', 1.00, '', 60000.00, 19.00, 11400.00, 71400.00, 'uploads/ordenes/OC_240001_1768914142.pdf', NULL, '2026-01-20 12:36:45', '2026-01-20 13:02:22', NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `ot_checklist_respuestas`
--

CREATE TABLE `ot_checklist_respuestas` (
  `id` int(11) NOT NULL,
  `solicitud_ot_id` int(11) NOT NULL,
  `seccion_key` varchar(50) DEFAULT NULL,
  `item_key` varchar(50) DEFAULT NULL,
  `valor` varchar(255) DEFAULT NULL,
  `observacion` text DEFAULT NULL,
  `fecha_respuesta` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `ot_checklist_respuestas`
--

INSERT INTO `ot_checklist_respuestas` (`id`, `solicitud_ot_id`, `seccion_key`, `item_key`, `valor`, `observacion`, `fecha_respuesta`) VALUES
(20, 31, 'revision_tecnica', 'banda_motriz', 'bueno', NULL, '2026-01-20 14:17:20');

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
-- Estructura de tabla para la tabla `permisos`
--

CREATE TABLE `permisos` (
  `id` int(11) NOT NULL,
  `codigo` varchar(50) NOT NULL,
  `modulo` varchar(50) DEFAULT 'General',
  `descripcion` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `permisos`
--

INSERT INTO `permisos` (`id`, `codigo`, `modulo`, `descripcion`) VALUES
(13, 'ver_config', 'Admin', 'Ver Configuración'),
(14, 'ver_usuarios', 'Admin', 'Ver Usuarios'),
(16, 'inv_ver', 'Inventario', 'Ver Pantalla Inventario'),
(17, 'inv_crear', 'Inventario', 'Crear Nuevos Productos'),
(18, 'inv_editar', 'Inventario', 'Editar Productos'),
(19, 'inv_eliminar', 'Inventario', 'Eliminar Productos'),
(20, 'inv_exportar', 'Inventario', 'Exportar a Excel'),
(21, 'inv_importar', 'Inventario', 'Importar Masivamente'),
(22, 'ajustar_stock', 'Inventario', 'Ajustar Stock Manualmente (+/-)'),
(23, 'mant_crear', 'Mantencion', 'Crear Orden de Trabajo (OT)'),
(24, 'mant_editar', 'Mantencion', 'Editar OT Existente'),
(25, 'mant_pdf', 'Mantencion', 'Ver/Descargar PDF de OT'),
(26, 'mant_excel', 'Mantencion', 'Exportar OT a Excel'),
(27, 'mant_finalizar', 'Mantencion', 'Finalizar OT (Cerrar)'),
(28, 'mant_anular', 'Mantencion', 'Anular o Eliminar OT'),
(29, 'mant_ver', 'Mantencion', 'Ver Módulo Mantención'),
(30, 'dash_resumen', 'Dashboard', 'Dashboard - Ver resumen general superior (Admin)'),
(31, 'dash_compras', 'Dashboard', 'Dashboard - Ver métricas de gestión de compras'),
(32, 'dash_mantencion', 'Dashboard', 'Dashboard - Ver métricas de gestión de mantención'),
(33, 'dash_bodega', 'Dashboard', 'Dashboard - Ver métricas de gestión de bodega'),
(34, 'cron_ver', 'Cronograma', 'Ver Módulo Cronograma'),
(35, 'cron_mant_ver', 'Cronograma', 'Ver Cronograma de Mantenciones'),
(36, 'cron_insumos_ver', 'Cronograma', 'Ver Cronograma de Insumos/Compras'),
(37, 'cron_mant_crear', 'Cronograma', 'Crear Mantención Programada'),
(38, 'cron_compra_crear', 'Cronograma', 'Crear Compra Programada'),
(39, 'cron_mant_editar', 'Cronograma', 'Editar Mantención Programada'),
(40, 'cron_compra_editar', 'Cronograma', 'Editar Compra Programada'),
(41, 'cron_mant_eliminar', 'Cronograma', 'Eliminar Mantención Programada'),
(42, 'cron_compra_eliminar', 'Cronograma', 'Eliminar Compra Programada'),
(43, 'ope_ver', 'Operario', 'Ver Mis Insumos y Entregas'),
(44, 'ope_aceptar', 'Operario', 'Aceptar/Rechazar Recepción'),
(45, 'ope_usar', 'Operario', 'Declarar Uso/Consumo'),
(46, 'dash_personal', 'Dashboard', 'Ver Estado Entregas Personal'),
(47, 'activos_ver', 'Activos', 'Ver el listado de Activos'),
(48, 'activos_crear', 'Activos', 'Crear nuevos Activos'),
(49, 'activos_editar', 'Activos', 'Editar y Configurar Activos'),
(50, 'activos_exportar', 'Activos', 'Exportar Activos a Excel'),
(51, 'bodega_ver', 'Bodega', 'Acceso al módulo de Bodega'),
(52, 'bodega_despachar', 'Bodega', 'Registrar entregas y salidas de material'),
(53, 'bodega_organizar', 'Bodega', 'Gestionar ubicación y entradas de material'),
(54, 'cot_ver', 'Cotizaciones', 'Ver historial de cotizaciones'),
(55, 'cot_crear', 'Cotizaciones', 'Crear nuevas cotizaciones'),
(56, 'cot_aprobar', 'Cotizaciones', 'Cambiar estado a Aprobada'),
(57, 'cot_anular', 'Cotizaciones', 'Rechazar cotizaciones'),
(58, 'compras_ver', 'Compras', 'Ver listado de órdenes de compra'),
(59, 'compras_crear', 'Compras', 'Crear nuevas órdenes de compra'),
(60, 'compras_detalle', 'Compras', 'Ver detalle de una orden'),
(61, 'compras_recepcionar', 'Compras', 'Recepcionar insumos (Cambiar estado)'),
(62, 'compras_anular', 'Compras', 'Anular órdenes de compra'),
(63, 'compras_exportar', 'Compras', 'Exportar listado general a Excel'),
(64, 'compras_pdf', 'Compras', 'Descargar PDF de la orden'),
(65, 'compras_regenerar_pdf', 'Compras', 'Regenerar PDF manualmente'),
(66, 'compras_adjuntar', 'Compras', 'Adjuntar/Ver archivos adjuntos'),
(67, 'compras_exportar_detalle', 'Compras', 'Exportar detalle de una orden a Excel'),
(68, 'compras_crear_insumos', 'Compras', 'Crear insumos desde solicitudes pendientes'),
(69, 'prov_ver', 'Proveedores', 'Ver listado y detalle de proveedores'),
(70, 'prov_crear', 'Proveedores', 'Crear nuevos proveedores'),
(71, 'prov_editar', 'Proveedores', 'Editar datos de proveedores'),
(72, 'prov_eliminar', 'Proveedores', 'Eliminar proveedores del sistema'),
(73, 'prov_exportar', 'Proveedores', 'Exportar listado de proveedores a Excel'),
(74, 'prov_importar', 'Proveedores', 'Carga masiva de proveedores');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `proveedores`
--

CREATE TABLE `proveedores` (
  `id` int(11) NOT NULL,
  `rut` varchar(20) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `direccion` varchar(150) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `contacto_vendedor` varchar(100) DEFAULT NULL,
  `tipo_venta_id` int(11) DEFAULT NULL,
  `comuna_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `proveedores`
--

INSERT INTO `proveedores` (`id`, `rut`, `nombre`, `direccion`, `email`, `telefono`, `contacto_vendedor`, `tipo_venta_id`, `comuna_id`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, '77.704.270-k', 'Bioplastic SPA', 'Camino Santa Sofia S/N Parcela 1', 'jrojas@bioplastic.cl', NULL, 'Johana Rojas', 1, 59, '2025-12-30 14:40:19', '2025-12-30 14:40:19', NULL),
(2, '77.099.530-2', 'SOC PLASTICOS TECNICOS SPA', 'CAMINO SANTA INES', NULL, NULL, 'Manuel Espinola', 1, 59, '2025-12-30 14:40:19', '2025-12-30 14:40:19', NULL),
(3, '83.297.700-4', 'IMPRESOS Y CARTONAJES SA', 'LAS ENCINAS 441', 'mpinero@imicar.cl', NULL, 'Manuel Piñero', 1, 60, '2025-12-30 14:40:19', '2025-12-30 14:40:19', NULL),
(4, '76150343-k', 'INDURA S.A', 'Av.  Las Americas 585, cerrillos-santiago', 'acorrea@indura.net', '6006003039', 'Alberto Luis correa quiro', 1, 60, '2025-12-30 14:40:19', '2025-12-30 14:40:19', NULL),
(5, '76.463.059-9', 'Gramlit SPA', 'Las Hortensias 972', 'ventas@gramlit.com', '225381002', 'Maria Emilia', 1, 60, '2025-12-30 14:40:19', '2025-12-30 14:40:19', NULL),
(6, '79.833.190-6', 'Carrocerias El Camino Ltda.', 'Las Encinas 520', 'ventas@carroceriaselcamino.cl', '939581749', 'Juan Ormazabal', 1, 60, '2025-12-30 14:40:19', '2025-12-30 14:40:19', NULL),
(7, '76.082.923-4', 'DYNTEC CHILE SPA', 'CAMINO ISLA NORTE S/N', 'ronald.jurgens@eco-dyntec.com', NULL, 'Ronald Jurgens', 1, 57, '2025-12-30 14:40:19', '2025-12-30 14:40:19', NULL),
(8, '96.900.610-3', 'Importadora y Arrendadora de Maquinaria Limitada', 'Barron Vieyra 10A', 'rluffi@imerchile.cl', '228715600', 'Richard Luffi', 1, 61, '2025-12-30 14:40:19', '2025-12-30 14:40:19', NULL),
(9, '78.983.170-k', 'Cimtec SA', 'Av. Las Montañana 39 Los Libertadores', 'ventas@cimtec.cl', '2 25447900', 'Alejandra Gonzalez', 1, 61, '2025-12-30 14:40:19', '2025-12-30 14:40:19', NULL),
(10, '76.215.357-2', 'Karcher Chile SPA', 'Los lIbertadores 16500', NULL, '2 23806100', 'Ariel Martinez', 1, 61, '2025-12-30 14:40:19', '2025-12-30 14:40:19', NULL),
(11, '96.567.010-6', 'Politec SA', 'Camino Coquimbo 16064', 'Jdaniel.Lozada@femoglas.com', '2 23947100', 'Daniel Lozada', 1, 61, '2025-12-30 14:40:19', '2025-12-30 14:40:19', NULL),
(12, '76.214.282-1', 'SOCIEDAD MULLER SA', 'CAMINO LA MONTAÑA SITIO 56 LOTEO', 'marlene.muller@interpanel.cl', NULL, 'Marlene Muller', 1, 61, '2025-12-30 14:40:19', '2025-12-30 14:40:19', NULL),
(13, '76.127.937-8', 'Román y De Col y Cía. Ltda.', 'CIRCUNVALACION AMERICO VESPUCIO 1940', 'aroman@autorodec.com', NULL, 'Alvaro Roman', 1, 62, '2025-12-30 14:40:19', '2025-12-30 14:40:19', NULL),
(14, '78.726.490-5', 'Maquinaria Industrial Ltda', 'Carlos Herrera 4699', 'mgalindo@mqi.cl', '227321091', 'Miguel Galindo', 1, 62, '2025-12-30 14:40:19', '2025-12-30 14:40:19', NULL),
(15, '76.854.670-3', 'MetalromE.I.R.L', 'Camino EL Colera s7n Cerrillos', 'jr.metalrom@gmail.com', '72463447', 'Jonathan Roman A', 1, 53, '2025-12-30 14:40:19', '2025-12-30 14:40:19', NULL),
(16, '76.516.761-2', 'Obinu y Cia Ltda', 'Sargento Aldea 194', 'info@obinu.cl', '225273443', 'Yaret Arancibia', 1, 63, '2025-12-30 14:40:19', '2025-12-30 14:40:19', NULL),
(17, '76.346.956-5', 'Judith Rodriguez y Cia Ltda', 'Los Ranunculos 13164', 'psi.fabrica@psi-ltda.cl', '225151516', 'Jorge Inostroza', 1, 63, '2025-12-30 14:40:19', '2025-12-30 14:40:19', NULL),
(18, '6.682.543-4', 'Orlando Arcadio Diaz Diaz', 'Recreo 539', 'mecanizadosdiaz@yahoo.es', '2 27763392', 'Orlando Diaz Diaz', 1, 65, '2025-12-30 14:40:19', '2025-12-30 14:40:19', NULL),
(19, '76.432.903-1', 'Sociedad Pastor Frigo Llimitada', 'Francisco Zelada 86', 'hugo.llanos@hotmail.es', NULL, 'Hugo Llamos', 1, 65, '2025-12-30 14:40:19', '2025-12-30 14:40:19', NULL),
(20, '76.144.408-5', 'Ecoservicios de higiene Ambiental Palmont Limitada', 'Libertador Bernardo O Higgins 4050 of 819', 'cosorio@urbanpest.cl', '232450309', NULL, 1, 65, '2025-12-30 14:40:19', '2025-12-30 14:40:19', NULL),
(21, '80.960.800-K', 'CARMELO TALA Y CIA LTDA', 'AV. PADRE ALBERTO HURTADO 0101', NULL, '227791407', 'ventas@carmelotala.cl', 1, 65, '2025-12-30 14:40:19', '2025-12-30 14:40:19', NULL),
(22, '78.730.890-2', 'Induacril SPA', 'Camino El Guanaco 6813', 'Ventas@induacril.cl', '944047029', 'Linda Sanchez', 1, 66, '2025-12-30 14:40:19', '2025-12-30 14:40:19', NULL),
(23, '76.122.343-7', 'Importadora Cromtek SpA', 'Av. DEL Valle sur 576, OF 703', 'contacto@cromtek.cl', '227333480', 'Sandra Caceres', 1, 66, '2025-12-30 14:40:19', '2025-12-30 14:40:19', NULL),
(24, '76.094.150-6', 'Sociedad de Representaciones y Servicios de Ingenieria C.S.T SPA', 'Av. del Valle Norte 750 oficina 52', 'sebastian.flores@cstgroup.cl', NULL, 'Sebastian Flores', 1, 66, '2025-12-30 14:40:19', '2025-12-30 14:40:19', NULL),
(25, '78.757.550-1', 'Intertrade Chile SA', 'Palacio Riesco 4441', 'gmarin@intertrade.cl', NULL, 'Gaston Marin', 1, 66, '2025-12-30 14:40:19', '2025-12-30 14:40:19', NULL),
(26, '76452427-6', 'INNOVAPRINT CHILE SpA', 'Av.del Parque 5339 of. 105 Ciudad Empresarial', 'ventas2@innovaprint.cl', '226047127', 'Maria Eugenia Idrogo', 1, 66, '2025-12-30 14:40:19', '2025-12-30 14:40:19', NULL),
(27, '76.229.937-2', 'MASMAUCO LTDA', 'AVDA. EL SALTO 4001 OF. 91', '\'pedido@rentokil-initial.com\'', NULL, NULL, 1, 66, '2025-12-30 14:40:19', '2025-12-30 14:40:19', NULL),
(28, '96.980.910-9', 'Precision SA', 'Avenida El Salto 4291', 'oc_cliente@precision.cl', NULL, 'Maria Eugenia Aguilera', 1, 66, '2025-12-30 14:40:19', '2025-12-30 14:40:19', NULL),
(29, '76826870-3', 'PRONTO COMUNICACIONES', 'Av. Del Valle Sur 577', 'mrodriguez@prontoip.com', '228580678', 'Marcelo Rodriguez', 1, 66, '2025-12-30 14:40:19', '2025-12-30 14:40:19', NULL),
(30, '92.147.000-2', 'WENCO SA', 'AV. AMERICO VESPUCIO 1125', 'silvana.leiva@wenco.cl', NULL, 'Silvana Leiva', 1, 66, '2025-12-30 14:40:19', '2025-12-30 14:40:19', NULL),
(31, '77.419.950-0', 'Sodiper Vivaceta Limitda', 'Fermin Vivaceta 660', 'jorge.jove@sodiper.cl', '227959283', 'Jorge Jove', 1, 67, '2025-12-30 14:40:19', '2025-12-30 14:40:19', NULL),
(32, '92.307.000-1', 'Rhona SA', 'Av. Pdte Frei Montalva 2193', 'yarenya.carrasco@rhona.cl', '222377126', 'Yarenya Carrasco', 1, 67, '2025-12-30 14:40:19', '2025-12-30 14:40:19', NULL),
(33, '76.,166.794-7', 'Trichem Ltda', 'Alcalde Barrera 9165', 'trichem@trichemci.com', '225272844', 'Gabriela Ojeda', 1, 69, '2025-12-30 14:40:19', '2025-12-30 14:40:19', NULL),
(34, '77.773.400-8', 'Tac Ltda', 'San Luis 6401', 'carlossirota@tac-cartim.cl', '56991781879', 'Carlos Sirota', 1, 69, '2025-12-30 14:40:19', '2025-12-30 14:40:19', NULL),
(35, '76.504.127-9', 'HERMETIGAS SPA', 'Vicuña Mackenna 6843 Oficina 1112', 'info@hermetigas.cl', '222466785', 'Francisco Chales', 1, 70, '2025-12-30 14:40:19', '2025-12-30 14:40:19', NULL),
(36, '76.433.951-7', 'Aura Oyarzun seguridad y proteccion EIRL', 'Vicxuña Mackenna 8219', 'gerencia@cercoalarm', '9 82890839', 'Aura Oyarzun', 1, 70, '2025-12-30 14:40:19', '2025-12-30 14:40:19', NULL),
(37, '76644817-8', 'Comercial Pro-Technology Ltda.', 'Vicuña Mackenna 7255 Of.707', 'andrea.villalobos@protechnology.cl', '222978401', 'Andrea Villalobos', 1, 70, '2025-12-30 14:40:19', '2025-12-30 14:40:19', NULL),
(38, '76.085.401-8', 'Eduardo Jose Fierro Plasticos EIRL', 'Quinahue 7116', 'msanz@angelplast.cl', NULL, 'Maria Jose Sanz', 1, 70, '2025-12-30 14:40:19', '2025-12-30 14:40:19', NULL),
(39, '76.029.295-8', 'Servisanit Limitada', 'Manco Capac 0734', 'agendaservisanit@gmail.com', '22911891', 'Juan Carlos Chacano', 1, 71, '2025-12-30 14:40:19', '2025-12-30 14:40:19', NULL),
(40, '77.192.154-k', 'Alectrol SPA', 'Las Parcelas 10202 Los Pensamientos', 'alectrol.cl@gmail.com', '995067988', 'Freddy Bilbao', 1, 71, '2025-12-30 14:40:19', '2025-12-30 14:40:19', NULL),
(41, '76.453.174-4', 'Ingenieria en plasticos y Metales SPA', 'Av. Lo Blanco 2189', 'savaria@inplamet.cl', '997417999', 'Sebastian Avaria', 1, 72, '2025-12-30 14:40:19', '2025-12-30 14:40:19', NULL),
(42, '78.887.880-k', 'Ecokorp Ltda.', 'Los Alamos 2394', 'ventas@ecokorp.cl', '2 27845431', 'Tamara Salinas', 1, 72, '2025-12-30 14:40:19', '2025-12-30 14:40:19', NULL),
(43, '79.728.570-6', 'Farmalatina Ltda', 'Las Encinas 1495, Valle Grande', 'analitica@farmalatina.cl', '228385019', 'Flor Saldaña', 1, 74, '2025-12-30 14:40:19', '2025-12-30 14:40:19', NULL),
(44, '76.163.793-2', 'Plasticentro SA', 'CAMINO LA MONTAÑA 355', 'sandro.becerra@plasticentro.cl', '223864700', 'Sandro Becerra', 1, 74, '2025-12-30 14:40:19', '2025-12-30 14:40:19', NULL),
(45, '77.137.860-9', 'Comercial K Limitada', 'Crucero Peralillo S/N', 'g.molina@mk.cl', '2 26788141', 'Gisella Molina', 1, 74, '2025-12-30 14:40:19', '2025-12-30 14:40:19', NULL),
(46, '89.06.900-5', 'SMC Pneumatics Chile SA', 'Av La Montaña 1115', 'neris.acosta@smcchile.cl', '2 22708600', 'Neris Acosta', 1, 74, '2025-12-30 14:40:19', '2025-12-30 14:40:19', NULL),
(47, '79.722.860-5', 'Winkler Limitada', 'El Quillay #466 Parque Industrial', 'pflores@winklerltda.com', '56224826500', 'Priscila Flores', 1, 74, '2025-12-30 14:40:19', '2025-12-30 14:40:19', NULL),
(48, '77.508.307-7', 'Nico Cruzat', 'La Capitania 80- Oficina 108', 'nico@nicocruzat.cl', '56979007536', NULL, 1, 75, '2025-12-30 14:40:19', '2025-12-30 14:40:19', NULL),
(49, '76.206.859-4', 'Metabali Consultores Ltda', 'Av. Apoquindo 6410 Of 210', 'melisa@metabali.cl', '56998871878', 'Maria Elsa Tabali', 1, 75, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(50, '85.417.200-K', 'Nalco Industrial Services Chile Ltda', 'Avenida Isidora Goyenechea 2800 Of 1102', 'serviciocliente@nalco.com', '56940136123', 'Barbara Payera', 1, 75, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(51, '76732331-K', 'Inofliss', 'Avenida Apoquindo 6410 Of. 605', 'venta@inofliss.cl', '228147038', 'Carlos Bravo', 1, 75, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(52, '76.968.072-0', 'DSE INGENIERIA SPA', 'Clotario Blest 7926', 'contacto@semaforoaleatorio.cl', '996413414', 'Constanza', 1, 77, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(53, '86.778.100-5', 'plasticos Haddad SA', 'Jose Ananias Lama 444', 'ventas@haddad.cl', '56224627200', 'Camila Campos', 1, 79, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(54, '77.096.487-3', 'Anticaidas SPA', 'Premio Nobel 3508', 'info@anticaidas.cl', '222267461', 'Fernanda Diaz', 1, 79, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(55, '76.282.132-k', 'Global Help Ltda', 'Av. Dr. Amador Neghme Rodriguez 3626', 'driquelme@globalhelp.cl', '222930501', 'Daniel Riquelme', 1, 79, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(56, '81.185.000-4', 'Cesmec SA', 'Avda Marathon 2595', 'victor.lastra@bureauveritas.com', '2 23502100', 'Victor Lastra', 1, 79, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(57, '79.913.160-9', 'Estec Ltda', 'Av. Pedro de Valdivia 6154', 'ktorres@estec.cl', '244114000', 'Karelis Torres', 1, 79, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(58, '76.730.517-6', 'Servicios Integrales y Proyectos Marcelo Perez EIRL', 'Nemesio Antunez 353', 'mperezm@mymproyectos.cl', '944083275', 'Marcelo Perez', 1, 80, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(59, '10.671.738-9', 'Alejandra Salinas Acevedo', 'Puerto Velero 266', 'asalinasacevedo@gmail.com', '93337362', 'Alejandra Salinas', 1, 80, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(60, '76589179-5', 'Soluciones RG Reyes Limitada', 'Cayupil 0337', 'ventas@solucionesrg.cl', '229871830', 'Ricardo Garcia', 1, 80, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(61, '96.833.680-0', 'Productos Industriales SA', 'Santa Marta 900', 'cgajardo@texpro.cl', '56965886356', 'Cecilia Gajardo', 1, 80, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(62, '93.320.000-0', 'Marienberg y Cia', 'Santa Marta 1600', 'jgs@marienberg.cl', '2 29474000', 'Jaqueline Gonzalez', 1, 80, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(63, '76.589.179-5', 'SolucionesRG Reyes Limitada', 'Cayupil 0337', 'solucionesrgchile@gmail.com', '9 98132416', 'Ricardo Garcia', 1, 80, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(64, '77.501.530-6', 'Alba Ambiente SA', 'Av. Grecia 1460', 'mail@detectoresysensores.cl', '225829111', 'Mario Rivas', 1, 82, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(65, '77.620.300-9', 'FBK CHILE SISTEMAS DE HIGIENE Y LIMPIEZA LTDA', 'Avda. Ricardo Lyon 3382', 'cobranzas@fbkchile.cl', '223431151', 'Nancy Vivencio', 1, 82, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(66, '76.218.782-5', 'Genesys Analitica SpA', 'Jose domingo cañar 574', 'mgonzalez@genesysanalitica.cl', '942192561', 'Mariela Gonzalez', 1, 82, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(67, '78.123.830-9', 'Termoequipos SPA', 'Republica de Israel 1035', 'ventas@termoequipos.cl', '222694970', 'Pablo Campos', 1, 82, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(68, '77.251.280-5', 'Newchem technologies ltda', 'campo de deportes 421', NULL, NULL, 'Claudina Plaza', 1, 82, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(69, '76.567.567-7', 'Sociedad Comercializadora Unifilm Ltda.', 'Marchant Pereira #3282', 'ventas@unifilm.cl', '2 22096350', 'Marcela Velasquez', 1, 82, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(70, '82.525.800-0', 'Veto y Compañía Limitada', 'San Eugenio 567', 'ventas412@veto.cl', '2 23554400', 'Hernan Flores', 1, 82, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(71, '76.804.728-6', 'D&V Aceros SPA', 'Rodolfo Jaramillo906', 'vhgonzalez14@gmail.com', NULL, 'Victor Hugo Gonzalez', 1, 83, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(72, '76.006.708-3', 'Luis Matta Armijo Servcio Refrigeracion EIRL', 'Segunda Avenida 376', 'friomatt@hotmail.com', '2 28111269', 'Luis Matta', 1, 83, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(73, '78.701.740-1', 'Wurth Chile Ltda', 'Coronel Santiago Buena 1345', 'lcodina@wurth.cl', NULL, 'Laura Codina', 1, 83, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(74, '52.002.072-1', 'Technoplus SpA', 'Los Corteses 5714', 'ventas01@technoplus.cl', '56944184433', 'Gildmary Avila', 1, 87, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(75, '77.654.540-6', 'Soluciones tecnológicas avanzadas Ltda', 'Roman Diaz 462', 'info@stalab.cl', '56222359928', 'Patricia Sanchez', 1, 88, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(76, '77.870.460-9', 'BCN Consultores', 'Matilde Salamanca 736 of 301', 'contacto@bcnconsultores.cl', '222442219', 'Francisco Lanas', 1, 88, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(77, '77.794.258-1', 'Corvel Comercial SpA', 'Providencia 1208 Of, 207', 'ventas@tubotiquin.cl', '56923999135', 'Christian Cordova', 1, 88, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(78, '76.574.030-4', 'Dinamo Consultores Ltda', 'Av Ricardo Lyon 222 oficina 203', 'diego@dinamo.cl', '222328926', 'Diego Fernandez', 1, 88, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(79, '80.326.500-3', 'Oxiquim SA', 'Av. Sta Maria 2050', 'ricardo.lara@oxiquim.com', '224788000', 'Ricardo Lara', 1, 88, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(80, '77.111.640-K', 'Projet SPA', 'Miguel Claro 1492', 'ventas@projet.cl', '222046093', 'Claudia Echiburu', 1, 88, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(81, '76.013.877-0', 'Amezaga Ingenieria y Suministros SA', 'Providencia 2594 oficina 621', 'contacto@tech-oh.cl', '2 23357779', 'Ruben Ramirez', 1, 88, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(82, '78377470-4', 'GMP', 'Cirujano Guzmán 131', 'ebocaz@gmp.cl', '223468182', 'Erika Bocaz C', 1, 88, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(83, '76753396-9', 'Importadora Best Store SPA', 'Guardia Vieja 490 oficina D', NULL, '223331673', NULL, 1, 88, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(84, '83.083.700-0', 'Importadora Dilaco SA', 'Perez Valenzuela 1138', 'azambrando@dilaco.com', '224029700', 'Alesandra Zambrano', 1, 88, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(85, '96582680-7', 'INTERMEC CHILE S.A.', 'Coronel 2330 of 11', 'elias.moraga@intermec.cl', '222341419', 'Elias Moraga', 1, 88, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(86, '76172535-1', 'NEBULAN', 'Av. Suecia 0155, oficina 304', NULL, NULL, 'Gonzalo Campbell', 1, 88, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(87, '92.556.000-6', 'Refrigeracion y Repuestos S.A.C', 'Av. Condel 1064', 'ventas@ryrsac.cl', '2 29047724', 'Cristian Seguel', 1, 88, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(88, '76799430-3', 'SP DIGITAL', 'Padre Mariano 356', NULL, '226567043', 'Elisa Santos', 1, 88, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(89, '76.057.953-K', 'GreenClean Chile Ltda', 'Av. Condell 1470', 'contacto@greencleanchile.cl', '2 26656194', 'Bernardita Lira', 1, 88, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(90, '76.279.430-6', 'Sociedad Comercial Orellana y Vidal', 'Cordillera 551', 'servicio@oyvrental.cl', '940269651', 'Rodrigo Carrasco G', 1, 89, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(91, '77.222.312-9', 'Robert Tamayo Matriceria Torneria y Metalmecancia EIRL', 'Av Traiguen 1432', NULL, '999465649', 'Robert Tamayo', 1, 89, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(92, '78.382.590-2', 'Valck', 'Camino San Pedro 9600', 'josefina@valck.cl', '225523860', 'Josefina Valck', 1, 89, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(93, '78.131.420-k', 'Ingenieria Desimat Limitada', 'Puerto Vespucio 9670', 'facturacion@desimat.cl', '225851200', 'Ingenieria Desimat', 1, 89, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(94, '76.117.967-5', 'TAAG TECHNOLOGIES SA', 'Rio Refugio 9641', 'njofre@taag-genetics.com', '229353200', 'Felipe Hinojosa', 1, 89, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(95, '79.629.010-2', 'Chesterton International Chile Ltda', 'Av. Los Vientos 20090 bodega B', 'alfonso.jaramillo@chesterton.com', '229444631', 'ALfonso Jaramillo', 1, 89, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(96, '80.914.400-3', 'SGS Chile Ltda', 'Puerto Madero 130', 'cl.cbe.comercial@sgs.com', '28989500', 'Karen Fernandez', 1, 89, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(97, '99.591.920-6', 'Legno SpA', 'Av. Americo Vespucio 1254', 'ventas@legno.cl', '979056196', 'Cinthya zuniga', 1, 89, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(98, '78.124.043-5', 'High detection', 'Volcan Lanin 451 Lo Boza', 'info@vallaschile.cl', '56986516858', 'victoria Lemus', 1, 89, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(99, '76.096.776-9', 'Comercializadora Ambiente Ltda', 'La Martina 455 Bodega x9', 'ventas@cambiente.cl', '9 76670966', 'Carlos Mendez', 1, 89, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(100, '5.817.368-1', 'Laura Rosa Quevedo Alvarez', 'Simon Bolivar casa 2 parcela d-1', '\'farepa.gac@gmail.com\'', NULL, 'Hans Quevedo', 1, 89, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(101, '99.549.30-6', 'Multivac Chile SA', 'Calle Rio Refugioi 9665', 'maximiliano.paninao@cl.multivac.com', '2 7996000', 'Maximiliano Paninao', 1, 89, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(102, '96.501.500-', 'Plastigen SPA', 'Av Lo Boza 370', 'sbecerra@plastigen.cl', '2 23323900', 'Sandro Becerra', 1, 89, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(103, '92.357.000-4', 'Tecnica Thomas C Sargent SA', 'Las Esteras Sur 2800', 'jcgomeza@sargentchile.cl', '225832741', 'Juan Carlos Gomez', 1, 90, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(104, '76.097.502-8', 'Quality Rubber SA', 'Av. Americo Vespucio 1151', 'maraneda@qrubber.cl', '968344053', 'Marcela Aranda', 1, 90, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(105, '26.452.499-7', 'Omar Bandres Servicios de Ingenieria y Seguridad', 'Valle Lo Campino', 'bctronicsl@gmail.com', '976026030', 'Omar Brandes', 1, 90, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(106, '76.339.652-5', 'Of Quimica SpA', 'Parinacota #239', 'ventas@ofquimica.cl', '224791204', 'Karina Saavedra', 1, 90, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(107, '77,058,237-7', 'Idema SPA', 'Calle Cerro San Cristobal 9681', 'idema.spa@gmail.co', '967049200', 'Walter', 1, 90, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(108, '89.563.800-5', 'Molychile SA', 'Los Coigues 701 Bodega 12', 'info@molychile.cl', NULL, NULL, 1, 90, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(109, '79.790.600-K', 'SIHI CHILE SA', 'Avda. Colorado 841', 'andresgm@sihi.cl', NULL, 'Andres Gonzalez', 1, 90, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(110, '79.839.490-8', 'TECVAL SA', 'Cordillera 221', 'dsepulveda@tecval.cl', '224116100', 'Daniela Sepulveda', 1, 90, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(111, '80.120.500-3', 'Bolognesi SPA', 'Cerro Los Condores 9660', 'adiaz@bolognesi.cl', '224460855', 'Antonio Diaz', 1, 90, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(112, '76.586.560-3', 'Importadora y Comercializadora Safed SA', 'Lautaro 170 Bodega J, Quilicura', 'Carlos <carlos@safed.cl>', NULL, 'Carlos Safed', 1, 90, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(113, '76.496.798-K', 'ANSA SPA', 'Ojos del Salado 840', 'naguad@imaqingenieria.cl', '2 27390054', 'Nagib Aguad', 1, 90, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(114, '78.972.190-4', 'HANNA INSTRUMENTS EQUIPOS LTDA', 'LO ECHEVERS 311', 'eduim@hannachile.com', '56950021734', 'eduim barros', 1, 90, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(115, '77.459.130-3', 'Ahorromat', 'Av. Gral San Martin 590', 'oyarcecontreras@gmail.com', '2 22449523', 'Marcelo Oyarce', 1, 90, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(116, '92.681.000-6', 'Airolite SA', 'Camino Lo Echevers 550 bodega 30', 'cgatica@airolite.cl', '2 3455200', 'Carolina Gatica', 1, 90, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(117, '96.919.040-0', 'Bomba Espa S.A.', 'Calle Dos 9447, Parque Industrial Buenaventura', 'rhofmann@espachile.cl', '227266900', 'Raimund Hofmann', 1, 90, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(118, '96.598.550-6', 'Bombas Imchisa SA', 'Calle Dos 9447, Parque Industrial Buenaventura', 'cspate@espa.cl', '2 27266900', 'Claudia Spate', 1, 90, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(119, '76.774.170-7', 'Busch Chile S.A', 'Av Presidente Frei Montalva 7070 Bod 9', 'jromero@busch.cl', '2 23765136', 'Julio Romero', 1, 90, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(120, '96974100-8', 'CODEPACK', 'PARINACOTA 381 MODULO 9', 'osandoval@codepack.cl', '228166700', 'Oscar Sandoval', 1, 90, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(121, '96.863.240-k', 'FIBRO CHILE SA', 'EL JUNCAL 900 - BUENAVENTURA', NULL, NULL, 'vpoblete@freevac.cl', 1, 90, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(122, '78.421.810-4', 'Rodacenter', 'Av. Americo Vespucio 1391', 'murdaneta@rodacenter.cl', '2 26272727', 'Marcos Urdaneta', 1, 90, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(123, '77.990.830-5', 'SOCIEDAD COMERCIAL DE MARKETING M&V SPA', 'AMERICO VESPUCIO NORTE 1385 DEPTO 34-35', 'ventas@exoset.cl', NULL, 'Diego Mellado', 1, 90, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(124, '76.333.980-7', 'SPARTAN DE CHILE LTDA', 'CERRO SANTA LUCIA 9873', NULL, NULL, 'ivan.marquez@spartan.cl', 1, 90, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(125, '76.764.877-4', 'Tecmetal Chile SPA', 'Calle cerro San Cristobal', 'tecmetal@gmail.com', '967049200', 'Walter Aguirre', 1, 90, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(126, '79.961.910-5', 'XYLEM Water Solutions Chile SA', 'Alcalde Guzman 1480', 'mario.reyes@xyleminc.com', '2 25628600', 'Mario Reyes', 1, 90, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(127, '80.565.900-9', 'Yolito Balart Hnos ltda', 'Antillanca', 'rsolis@yolito.cl', '2 24820800', 'Richard Solis', 1, 90, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(128, '96605640-1', 'Comercial Vimaroni SpA', 'DEL ALHELI 2332', 'ventas@vimaroni.cl', '2827061', 'Paola Olmos', 1, 111, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(129, '77.021.940-K', 'Comercial Industrial Market Ltda', 'Constantino 539', 'ventas6@refrimarket.com', '226833268', 'Joan Vivas', 1, 91, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(130, '87.717.600-2', 'Aceros y Metales SpA', NULL, 'tmoreno@acermet.cl', '225845200', 'Tania Moreno', 1, 91, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(131, '76.161.678-1', 'Excomar Representaciones y Servicios Limitada', 'Mapocho 4388', 'contacto@excomar.cl', '225386084', 'Emilio Vargas', 1, 91, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(132, '78.116.970-6', 'Importadora Soviquim Ltda', 'Miguel de Atero 2546', 'soviquim@soviquim.cl', '56227738684', 'Katherine Barrios', 1, 91, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(133, '77.727.458-9', 'Importadora Nanmao Chile Ltda', 'San Pablo 4333', 'claudio.ortiz@homenewen.cl', '933495165', 'Claudio Ortiz', 1, 91, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(134, '79.993.310-1', 'Comercial Versluys', 'El Quilo 5535', 'carolinaversluys@gmail.com', '2 2228231', 'Carolina', 1, 91, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(135, '76.867.361-6', 'Extintores Malaga SPA', 'Radal 643', NULL, '2 2864254', 'Maria Chico', 1, 91, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(136, '76720742-5', 'Mantencion y reparacion Fricsotek SPA', 'Progreso 1309', 'r.salinas@fricsotek.cl', '56 9 63685421', 'Ricardo Salinas', 1, 91, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(137, '76.709.668-2', 'Servicios de SaludArboroa SpA', 'Almarza #110', 'coordinadora@beatself.cl', '2 2 3591721', 'Maria Moreno Gaete', 1, 54, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(138, '16.711.057-6', 'Carolina Diaz Paillalef', 'Los Pamperos 238', 'hielos.gradocero@gmail.com', '56975685662', 'Carolina Diaz', 1, 118, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(139, '76.010.896-0', 'Safe Energy SPA', 'Mexico 1199', NULL, '226216006', 'Erika Muñoz', 1, 118, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(140, '76.124.702-6', 'HAKANSSON SAWBLADES CHILE LTDA', 'AVDA. EINSTEIN 760', 'Fsalinas@hakanssonchile.cl', NULL, 'Francisco Salinas', 1, 118, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(141, '76.490.300-5', 'MATERIAS PRIMAS CLAUDIA ESCOBAR SA', 'COLOMBIA 0390', NULL, NULL, 'VERONICA TORO', 1, 118, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(142, '82.321.000-0', 'Bañados y Cia SPA', 'Av. Dorsal 3225', 'ventas@bañados.cl', '222413400', 'Cinthia Iturriaga', 1, 117, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(143, '77.218.776-9', 'Taglermaq SpA', 'Presidente German Riesco 8736-1', 'mponce@taglermaq.cl', NULL, 'Marco Ponce', 1, 117, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(144, '79.748.470-9', 'Electricidad Guzman', 'Avda. Fresia 2196', 'r.gonzalez@guzman.cl', '2 23871111', 'Rebeca Gonzalez', 1, 117, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(145, '10.935.449-K', 'Servicarl SPA', NULL, 'crivas@procesadoracrl.cl', '92401098', 'Cesar Rivas Liberona', 1, 112, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(146, '78.239.560-2', 'Supermercado del Neumatico Ltda', 'General Velasquez 10901', 'jarias@sdn.cl', '24870000', 'Joel Arias', 1, 92, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(147, '76.312-131-3', 'Ingenieria en Sistema de Detencion de Caidas Alti-Tec Limitada', 'Av. Presidente Alessandri Rodriguez 11500 G11', 'gestion@altitecchile.cl', '228870113', 'Francisco Avila', 1, 92, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(148, '79.820.020-8', 'Fibra SPA', 'Santa Margarita 0750', 'mauricio.perez2@nova.com', '224112500', 'Mauricio Perez', 1, 92, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(149, '78.859.783-9', 'Importadora Rentalvial SPA', 'Esmeralda 351', 'ventas@rentalvial.cl', '977485175', 'Jose', 1, 92, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(150, '93.020.000-K', 'Tecnigen SA.', 'Av. Carlos Valdovinos 450', 'info@tecnigen.cl', '223960600', 'Rolando Elgueta', 1, 115, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(151, '86.806.000-k', 'Industria Rodal SPA', 'Av. Santa Rosa 4350', 'info@rodal.cl', '224338700', 'Claudia Bozo', 1, 115, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(152, '10.051.017-0', 'Lester Navea Lucar', 'Pontevedra 5277', 'Inavea21@yahoo.es', '982490019', 'Lester Navea', 1, 115, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(153, '83.017.600-4', 'NIBSA SA', 'Carlos Valdovinos 200 Local K10', 'trinidad.garcia@nibsa.com', '2 24898100', 'Trinidad Garcia', 1, 115, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(154, '96.542.490-3', 'Treck SA', 'Santa Rosa 5220', 'paulina.cerda@treck.cl', '2 4909 986', 'Paulina Cerda', 1, 115, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(155, '76.242.249-2', 'Induslab SPA', 'Enrique Matte 1462', 'ventas@induslab.cl', '225677363', 'David Brill', 1, 113, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(156, '99.535.580-9', 'asesorias industriales ENOTEC SA', 'carlos edwards 1135', 'servicio@enotec.cl', '56225213450', 'Carolina Morales', 1, 113, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(157, '10.036.033-0', 'Marithza Castillo Lobos', 'Carlos Valdovinos 770', 'hojalateria770@gmail.com', '225515107', 'Marithza Castillo', 1, 113, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(158, '76.366.682-4', 'Gilltam SPA', 'Escultor Rodin 5839', 'gavalos@grupogillibrand.com', '323741676', 'Gino Avalos', 1, 113, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(159, '89.679.600-3', 'Tecnologia y Lubricacion Ltda', 'Alcalde Pedro Alarcon 726', 'contacto@tecnilub.cl', '227951300', 'Arturo Quevedo', 1, 113, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(160, '76.064.239-8', 'Servimant Ltda', 'Ramon Barros Luco 4010 of 301B', NULL, '227616763', 'Giss Aravena', 1, 113, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(161, '76.000.405-7', 'MM Impresores Ltda', 'Pasaje Cunaco 3931', 'ventas@mmimpresores.cl', '223129376', 'Marco Muñoz', 1, 113, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(162, '76.871.522-k', 'Supplytech Ingenieria e Insumos SPA', 'Avenida Rivadavia 6528', 'componentestecnicos@gmail.com', NULL, NULL, 1, 114, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(163, '76.711.569-5', 'Importadora RC SPA', 'AV. Americo Vespucio 2022', 'ventas@importadorarc.cl', NULL, 'Victor', 1, 114, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(164, '77.880.275-9', 'Australair SPA', NULL, 'rladevig@australair.com', NULL, 'Rodrigo Ladevig', 1, 94, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(165, '76.046.809-6', 'Dap Ducasse Diseño Ltda', 'Av. Libertador Bernardo Ohiggins 1460, piso 5', 'nuvia.hormazabal@dapducasse.cl', '56232937000', 'Nuvia Hormazabal', 1, 94, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(167, '89.435.600-6', 'Cordero SA', 'Antofagasta 3065', 'ventas@cordero.cl', '226833739', 'ventas@cordero.cl', 1, 94, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(168, '77142419-8', 'Servicios Eberall', 'Huerfanos 1055', 'ventas@eberall.cl', '56962975169', 'Elennys Garcia', 1, 94, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(169, '77.537.533-7', 'Cleaning SpA', 'Ahumada 312 Of 715', 'ventas@insumoscleaning.cl', '56930984761', 'Marcia Maira', 1, 94, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(170, '76.051.243-5', 'Comercial Hidraulica Restock Ltda', 'Brasil 81', 'ccuadros@hidraulicarestock.cl', '226964812', NULL, 1, 94, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(171, '83,336,400-6', 'Comercial Gomilandia Ltda', 'Portugal', 'ventas@gomilandia.cl', '961433294', 'Carlos Lillo', 1, 94, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(172, '79.721.290-3', 'Distribuidora Transeg Ltda', 'Av Viel 1302', 'ventas@transeg.cl', '228386000', 'Miguel Morales Romero', 1, 94, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(173, '76.755.318-8', 'Instrumatica FC SPA', 'Av. Independencia 740', 'venta@instrumatica.cl', '977578642', 'Rodrigo Ñuñez R', 1, 94, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(174, '76.563.320-6', 'Bioquimica.cl S.A.', 'Macul Bodega S02', 'elsa.martinez@bioquimica.cl', '222252583', 'Elsa Martinez', 1, 94, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(175, '76.427.949-2', 'Patricio Sutto Isasi SPA \" La Herramienta\"', NULL, 'ventas@laherramienta.cl', NULL, 'Patricio Sutto I', 1, 94, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(176, '78.912.510-4', 'RS Group Ltda', 'Carretera General San Martin 8250 bodega 29DA', 'ventas@rschile.cl', '950121474', 'Cesar Crisostomo', 1, 94, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(177, '84.726.100-5', 'Fitalia Repuestos SPA', 'Avenida Brasil 30', 'ventas@fitalia.cl', '232074619', 'Carolina Aguilera', 1, 94, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(178, '77617830-6', 'Pailamilla e Hijos Limitada', 'San Diego 1001', 'ventas03.s@comercialph.cl', '227992080', 'Guillermo Alfaro', 1, 94, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(179, '90.844.000-5', 'Kupfer Hermanos SA', 'Libertad 58', 'marcela.veliz@kupfer.cl', '928222316', 'Marcela Veliz', 1, 94, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(180, '77.660.232-9', 'May Energia', 'Club Hipico 2776', 'ventas@mayenergia.cl', '939242945', NULL, 1, 94, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(181, '81.448.200-6', 'Raul Tagle e Hijos Ltda', 'Dieciocho 263', 'federico.miquel@tecnicor.cl', '223296000', 'Federico Miquel', 1, 94, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(182, '93.322.000-1', 'Inema SA', NULL, 'jurra@inema.cl', NULL, 'Jorge Urra', 1, 94, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(183, '76.156.974-0', 'Euromob Importacion, distribucion y comercializacion SPA', 'Pedro Leon Ugalde 1309', 'ventas2@euromob.cl', '225441677', 'Claudia Villalobos', 1, 94, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(184, '77.178.564-6', 'Sermantec SPA', 'Ahumada 312 Of 715', 'finanzas@sermantec.cl', '932271568', 'Cristian', 1, 94, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(185, '77.736.990-3', 'Villegas y Perez Ltda', 'San Ignacio 1460', 'contacto@vilyper.cl', '5550450', 'Javier Puschel', 1, 94, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(186, '78.240.410-5', 'Aginox Comercial Ltda', 'Conferencia 956', 'j.ventas@aginox.cl', '228625600', 'Jorge Alderete', 1, 94, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(187, '77.384.014-8', 'Torino Chile SpA', 'fabricacion importacion distribucion ropa de trabajo', 'fmoles@workingappael.com', '56958518136', 'Franco Moles', 1, 94, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(188, '5.248.764-1', 'Ramon Meneses Valenzuela', 'Av. Ricardo Cumming 552', 'armaflex@armaflex.cl', '227708700', 'Ramon Meneses Valenzuela', 1, 94, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(189, '83030600-5', 'CASA ROYAL', 'Avenida Libertador Bernardo O’Higgins 845', 'contacto@casaroyal.cl', NULL, NULL, 1, 94, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(190, '76.554.904-3', 'CLAPPS CHILE SPA', 'MONJITAS 550 OF. 19', 'pamela@clappschile.cl', '226891576', 'Pamela Suarez', 1, 94, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(191, '78.769.930-8', 'Comercial Allen Ltda', 'Eduardo Matte 1830', 'emonsalve@allen.cl', '2 25553918', 'Eduardo Monsalve', 1, 94, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(192, '89.396.900-4', 'Distribuidora Electrica Vitel SA', 'Chiloe 1189', 'jcalderon@vitel.cl', '2 25562646', 'Jennifer Calderon Villalobos', 1, 94, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(193, '85541900-9', 'EDAPI S.A.', 'Chile España 414 Ñuñoa', 'aalarcon@edapi.cl', '223752600', 'Alicia Alarcon H.', 1, 94, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(194, '25270730-1', 'EDWART PEREZ', NULL, 'edwartperez@gmail.com', NULL, 'Edwart Perez', 1, 94, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(195, '96.896.480-1', 'Sonepar Chile SA', 'Av. Vicuña Mackenna 2301', 'ELISEO.SALAZAR@SONEPAR.CL', '991624487', 'Eliseo Salazar', 1, 94, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(196, '80409800-3', 'ELECTRICIDAD GOBANTES S.A.', 'AV. MATTA 1195', 'contactenos@gobantes.cl', '226900000', NULL, 1, 94, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(197, '76371984-7', 'ELECTRONLINE', 'San Antonio 378, Of. 211', 'ventas@electronline.cl', '223023149', NULL, 1, 94, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(198, '83.045.600-7', 'Galvez e Hijos Ltda', 'General Mackennna 1579', 'ventas@galvezehijos.cl', '2 2699339', 'Ximena Millar Soriano', 1, 94, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(199, '76842605-8', 'Sociedad Comercial Rodastock Ltda', 'Vergara 38-40', 'ventas@rodastock.cl', '22  7841560', 'Monica Salas', 1, 94, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(200, '78627210-6', 'HIPERMERCADOS TOTTUS S.A.', NULL, NULL, NULL, NULL, 1, 94, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(201, '76.129.541-1', 'Importadora y exportadora Jorge Bravo EIRL', 'Huerfanos 2204', 'jalyon.cia@tie.cl', '2 26994979', 'Miriam Colimil', 1, 94, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(202, '80478200-1', 'LAPIZ LOPEZ', NULL, NULL, NULL, NULL, 1, 94, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(203, '76134946-5', 'LIDER', NULL, NULL, NULL, NULL, 1, 94, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(204, '76875136-6', 'MAXINNOVATION', NULL, NULL, NULL, 'David Hidalgo', 1, 94, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(205, '78885550-8', 'PC Factory S.A', NULL, NULL, NULL, NULL, 1, 94, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(206, '96556940-5', 'PROVEEDORES INTEGRALES PRISA S.A.', 'LAS ROSAS 5757', 'ytoberp@prisa.cl', '8206000', 'Yolanda Tobar', 1, 94, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(207, '77.949.040-8', 'Punto Hidraulico Ltda', 'San Isidro 1466', 'nestor@puntohidraulico.cl', '2 25541878', 'Nestor Castillo', 1, 94, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(208, '99.510.910-7', 'Segurycel Industrial Celume y Gonzalez', 'Avenida Ejercito Libertador 740', 'j.figueroa@segurycel.cl', '227075774', 'Jessica Figueroa', 1, 94, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(209, '96792430-K', 'SODIMAC S.A.', NULL, 'contactosodimac@sodimac.cl', NULL, NULL, 1, 94, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(210, '9896306-5', 'T & C COMPUTER', 'SAN DIEGO 965 LOCAL 12', 'ventas@tyccomputer.cl', '226628859', NULL, 1, 94, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(211, '89.769.600-3', 'Tecnilñub Limitada', 'Alcalde Pedro Alarcon 726', 'aquevedo@tecnilub.cl', '2 27951300', 'Arturo Quevedo', 1, 94, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(212, '76741064-6', 'VP SERVICIOS GENERALES SpA', 'Mac Iver 142 Oficina 411 - Santiago', 'ventas3@vpservicios.cl', '232305776', 'Melva Portales', 1, 94, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(213, '76.524.695-4', 'Manufacturas de Telas SpA', 'Avda Portugal 1357', 'erika.gatica.ca@gmail.com', NULL, 'Erika Gatica', 1, 94, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(214, '78.765.450-9', 'Inversiones Assadi Ltda', NULL, 'bambiexpress101@gmail.com', NULL, NULL, 1, 94, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(215, '76.789.428-7', 'Juan Antonio Carrasco Garrido', '13 Oriente C y 22 Norte 3244', 'jsoller@gmail.com', '963854639', 'Juan Antonio Carrasco', 1, 45, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(216, '76.019.839-0', 'PATRICIO SALAMANCA Y CIA LTDA', 'AUTIPISTA 8360 BLOQUE INT.', 'jm.salamanca@forymar.cl', NULL, 'Juan Manuel Salamanca', 1, 26, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(217, '16.536.886-K', 'Maria Muñoz Navarrete', 'Los Lilium 1266', 'marymuoz26@gmail.com', '930800778', 'Maria Muñoz', 1, 9, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(218, '77507670-4', 'Pinxcel Graphics Ltda.', 'Avda. Picarte 327, Módulo 26', 'ngarcia@pinxcel.cl', '(63) 2202042', 'Norma Garcia', 1, 37, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(219, '76.925.886-8', 'Arriendo Lusomaq SPA', NULL, 'contacto@lusomaq.cl', '977577061', 'Franchesca Ibarra', 1, 94, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(220, '91.335.000-6', 'Air Productos', NULL, 'gonzals9@airproducts.com', NULL, 'Sandra Urra', 1, 94, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(221, '76.173.340-0', 'Sociedad Comercializadora Dikaios Ltda', NULL, 'jbeltran@dikaios.cl', '974991360', 'Jaime Beltran', 1, 94, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(222, '78.017.612-1', 'KYP Montaje Industrial SPA', NULL, 'patricio.iturriaga@kypserviciosintegrales.com', NULL, 'Patricio Iturriaga', 1, 94, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(223, '89563800-5', 'Importadora Industrial Molychile LTDa', NULL, 'info@molychile.cl', NULL, NULL, 1, 94, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(224, '82.995.700-0', 'Dercocenter SPA', NULL, 'alejandrosoto@dercocenter.cl', '963939316', 'Alejandro Soto Zuñiga', 1, 94, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(225, '76.447.033-8', 'Servicios Integrales Presence SPA', NULL, 'venta@tiendapresence.com', '6005200600', 'Andres Castillo', 1, 94, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(226, '76.599.164-1', 'Climatizacion y Refrigeracion', NULL, 'servicios.c.jofre@gmail.com', '9 56878630', 'Claudio Jofre', 1, 94, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(227, '76.146.210-5', 'Glov Servicios Ltda', NULL, 'carlos.salazar@glov.cl', NULL, 'Mauricio Olivares', 1, 94, '2025-12-30 14:40:20', '2025-12-30 14:40:20', NULL),
(228, '52003384-K', 'EVOLTA', 'Apoquindo 4100, OF 301, Piso 3', 'ventas@evolta.cl', '222429434', '', 1, NULL, '2025-12-30 17:03:03', '2025-12-30 17:03:03', NULL),
(229, '77.575.951-8', 'Soluciones de Fabricacion y Montaje Limitada', 'Educacion 8514', 'seba.emanuel.gl2@gmail.com', '995129502', 'Sebastian Gonzalez', 1, NULL, '2025-12-30 17:03:03', '2025-12-30 17:03:03', NULL),
(230, '76.312.131-3', 'ALTI TEC Ltda', 'Av. Club Hipico 4676 Torre Norte Piso 8', 'proyectos@altitecchile.cl', '2 28870113', 'Jorge Reyes', 1, NULL, '2025-12-30 17:03:03', '2025-12-30 17:03:03', NULL),
(231, '77.739.209-3', 'Confecciones Carlos Ruiz EIRL', 'Los Manantiales 1355', 'ventas@agenplanner.cl', '937125413', 'Carlos Ruiz', 1, NULL, '2025-12-30 17:03:03', '2025-12-30 17:03:03', NULL),
(232, '77.413.460-3', 'Comercial Artipac Chile Limitada', 'Av. Club Hipico 4676 Of 812', 'erhode@artipac.cl', '226232728', 'Eric Rhode', 1, NULL, '2025-12-30 17:03:03', '2025-12-30 17:03:03', NULL),
(233, '76.098.884-7', 'Quimica Manuel Humberto Madrid Sanchez EIRL', 'San Rafael 77', 'ventas@quimicamadrid.cl', '342530425', 'Mario Bodega', 1, NULL, '2025-12-30 17:03:03', '2025-12-30 17:03:03', NULL);

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
(1, 'Admin', 'Acceso total al sistema y configuración'),
(2, 'Bodega', 'Gestión de inventario físico, recepciones y entregas'),
(3, 'Jefe Mantención', 'Administra OTs, asigna trabajos y supervisa consumo'),
(4, 'Técnico Mantención', 'Operativo: Solo confirma recepción y consumo de insumos'),
(5, 'Encargado Compras', 'Gestión de proveedores, cotizaciones y órdenes de compra');

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
  `usuario_id` int(11) DEFAULT NULL,
  `modulo` varchar(50) NOT NULL,
  `accion` varchar(255) NOT NULL,
  `detalle` text DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `sistema_logs`
--

INSERT INTO `sistema_logs` (`id`, `usuario_id`, `modulo`, `accion`, `detalle`, `ip_address`, `created_at`) VALUES
(1, 1, 'Proveedores', 'CREAR', 'Nuevo proveedor: EVOLTA', NULL, '2025-12-30 17:03:03'),
(2, 1, 'Proveedores', 'CREAR', 'Nuevo proveedor: Soluciones de Fabricacion y Montaje Limitada', NULL, '2025-12-30 17:03:03'),
(3, 1, 'Proveedores', 'CREAR', 'Nuevo proveedor: ALTI TEC Ltda', NULL, '2025-12-30 17:03:03'),
(4, 1, 'Proveedores', 'CREAR', 'Nuevo proveedor: Confecciones Carlos Ruiz EIRL', NULL, '2025-12-30 17:03:03'),
(5, 1, 'Proveedores', 'CREAR', 'Nuevo proveedor: Comercial Artipac Chile Limitada', NULL, '2025-12-30 17:03:03'),
(6, 1, 'Proveedores', 'CREAR', 'Nuevo proveedor: Quimica Manuel Humberto Madrid Sanchez EIRL', NULL, '2025-12-30 17:03:03');

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
  `prioridad` enum('BAJA','MEDIA','ALTA','CRITICA') DEFAULT 'MEDIA',
  `origen_tipo` varchar(50) DEFAULT 'Interna',
  `area_negocio` varchar(50) DEFAULT NULL,
  `centro_costo_ot` varchar(50) DEFAULT NULL,
  `solicitante_externo` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `asignado_a` int(11) DEFAULT NULL,
  `firma_tecnico` longtext DEFAULT NULL,
  `comentarios_finales` text DEFAULT NULL,
  `pdf_url` varchar(255) DEFAULT NULL,
  `fecha_cierre` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `solicitudes_ot`
--

INSERT INTO `solicitudes_ot` (`id`, `usuario_solicitante_id`, `activo_id`, `fecha_solicitud`, `fecha_requerida`, `estado_id`, `descripcion_trabajo`, `prioridad`, `origen_tipo`, `area_negocio`, `centro_costo_ot`, `solicitante_externo`, `created_at`, `updated_at`, `asignado_a`, `firma_tecnico`, `comentarios_finales`, `pdf_url`, `fecha_cierre`) VALUES
(18, 5, 1, '2026-01-12 09:05:15', NULL, 6, 'MANTENCION PROGRAMADA: Mantenimiento preventivo', 'MEDIA', 'Preventiva', 'MANTENCION', '6400', 'CRONOGRAMA', '2026-01-12 12:05:15', '2026-01-12 12:05:20', NULL, NULL, NULL, NULL, NULL),
(19, 5, 3, '2026-01-12 09:07:33', NULL, 5, 'MANTENCION PROGRAMADA: Mantenimiento preventivo', 'MEDIA', 'Preventiva', 'MANTENCION', '6400', 'CRONOGRAMA', '2026-01-12 12:07:33', '2026-01-12 12:08:52', NULL, NULL, NULL, NULL, NULL),
(20, 5, 1, '2026-01-12 09:14:26', NULL, 5, 'Mantenimiento preventivo OT 1671', 'MEDIA', 'Interna', 'MANTENCION', NULL, NULL, '2026-01-12 12:14:26', '2026-01-21 16:04:55', 1, 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAA5IAAADECAYAAADtTh5lAAAQAElEQVR4AezdPbLcxhUG0CmvwTnlfbhKUnkLzi0GXoNCUpkDew2ScqeOSe3DVbYyLUN9ycEjOJxfDIC+3X1YgzfzMED37XOZfAXMvD8c/CNAgAABAgQIECBAgAABAg8ICJIPYOU5VCUECBAgQIAAAQIECBCoJyBI1rM382gC1kuAAAECBAgQIECgEwFBspNGWgYBAtsIGJUAAQIECBAgQOBLAUHySxN7CBAgQKBtAdUTIECAAAECGwsIkhsDG54AAQIECBC4R8AxBAgQINCSgCDZUrfUSoAAAQIECBDIJKAWAgSGFRAkh229hRMgQIAAAQIECIwoYM0E1hAQJNdQNAYBAgQIECBAgAABAgS2E0g3siCZriUKIkCAAAECBAgQIECAQG4BQfKe/jiGAAECBAgQIECAAAECBF4EBMkXCi96E7AeAgQIECBAgAABAgS2ERAkt3E1KgECywScRYAAAQIECBAg0ICAINlAk5RIgACB3AKqI0CAAAECBEYTECRH67j1EiBAgACBELARIECAAIEnBATJJ/CcSoAAAQIECBDYU8BcBAgQyCIgSGbphDoIECBAgAABAgR6FLAmAl0KCJJdttWiCBAgQIAAAQIECBBYLuDMWwKC5C0h7xMgQIAAAQIECBAgQIDAZwIpg+RnFfqFAAECBAgQIECAAAECBFIJCJKp2tF0MYonQIAAAQIECBAgQGAQAUFykEZbJoHzAvYSIECAAAECBAgQeFxAkHzczBkECBCoK2B2AgQIECBAgEBlAUGycgNMT4AAAQJjCFglAQIECBDoSUCQ7Kmb1kKAAAECBAisKWAsAgQIELggIEhegLGbAAECBAgQIECgRQE1EyCwh4AguYeyOQgQIECAAAECBAgQuCzgneYEBMnmWqZgAgQIECBAgAABAgQI1BWIIFm3ArMTIECAAAECBAgQIECAQFMCgmRT7ZoX6zUBAgQIECBAgAABAgTqCAiSddzNOqqAdRMgQIAAAQIECBDoQECQ7KCJlkCAwLYCRidAgAABAgQIEPhcQJD83MNvBAgQINCHgFUQIECAAAECGwoIkhviGpoAAQIECBB4RMCxBAgQINCKgCDZSqfUSYAAAQIECBDIKKAmAgSGFBAkh2y7RRMgQIAAAQIECIwsYO0EnhUQJJ8VdD4BAgQIECBAgAABAgS2F0g1gyCZqh2KIUCAAAECBAgQIECAQH4BQfLeHjmOAAECBAgQIECAAAECBD4ICJIfGPzoVcC6CBAgQIAAAQIECBBYX0CQXN/UiAQIPCfgbAIECBAgQIAAgeQCgmTyBimPAAECbQiokgABAgQIEBhJQJAcqdvWSoAAAQIE5gJeEyBAgACBhQKC5EI4pxEgQIAAAQIEagiYkwABAhkEBMkMXVADAQIECBAgQIBAzwLWRqA7AUGyu5ZaEAECBAgQIECAAAECzwsY4ZqAIHlNx3sECBAgQIAAAQIECBAg8IVA2iD5RaV2ECBAgAABAgQIECBAgEAKAUEyRRu6KcJCCBAgQIAAAQIECBAYQECQHKDJlkjguoB3CRAgQIAAAQIECDwmIEg+5uVoAgQI5BBQBQECBAgQIECgooAgWRHf1AQIECAwloDVEiBAgACBXgQEyV46aR0ECBAgQIDAFgLGJECAAIEzAoLkGRS7CBAgQIAAAQIEWhZQOwECWwsIklsLG58AAQIECBAgQIAAgdsCjmhKQJBsql2KJUCAAAECBAgQIECAQH2BKUjWr0QFBAgQIECAAAECBAgQINCEgCDZRJsuFWk/AQIECBAgQIAAAQIE9hcQJPc3N+PoAtZPgAABAgQIECBAoHEBQbLxBiqfAIF9BMxCgAABAgQIECDwSUCQ/GThFQECBAj0JWA1BAgQIECAwEYCguRGsIYlQIAAAQIElgg4hwABAgRaEBAkW+iSGgkQIECAAAECmQXURoDAcAKC5HAtt2ACBAgQIECAAAEChwMDAs8ICJLP6DmXAAECBAgQIECAAAEC+wmkmUmQTNMKhRAgQIAAAQIECBAgQKANAUHykT45lgABAgQIECBAgAABAgQOgqT/BN0LWCABAgQIECBAgAABAusKCJLrehqNAIF1BIxCgAABAgQIECCQWECQTNwcpREgQKAtAdUSIECAAAECowgIkqN02joJECBAgMA5AfsIECBAgMACAUFyAZpTCBAgQIAAAQI1BcxNgACB2gKCZO0OmJ8AAQIECBAgQGAEAWsk0JWAINlVOy2GAAECBAgQIECAAIH1BIx0SUCQvCRjPwECBAgQIECAAAECBAicFUgdJM9WbCcBAgQIECBAgAABAgQIVBUQJKvydzm5RREgQIAAAQIECBAg0LmAINl5gy2PwH0CjiJAgAABAgQIECBwv4Ageb+VIwkQIJBLQDUECBAgQIAAgUoCgmQleNMSIECAwJgCVk2AAAECBHoQECR76KI1ECBAgAABAlsKGJsAAQIETgQEyRMQvxIgQIAAAQIECPQgYA0ECGwpIEhuqWtsAgQIECBAgAABAgTuF3BkMwKCZDOtUigBAgQIECBAgAABAgRyCMyDZI6KVEGAAAECBAgQIECAAAECqQUEydTtuac4xxAgQIAAAQIECBAgQGBfAUFyX2+zEfgo4CcBAgQIECBAgACBhgUEyYabp3QCBPYVMBsBAgQIECBAgMBHAUHyo4OfBAgQINCngFURIECAAAECGwgIkhugGpIAAQIECBB4RuDpc9+WEWIrTx4ECBAgsIWAILmFqjEJECBAgACBWgLvysRvyvaqbB57CpiLAIGhBATJodptsQQIECBAoGuBCJHflBW+L9vrsnkQIHBDwNsElgoIkkvlnEeAAAECBAhkEpiHyG8zFaYWAgQIrCyQYjhBMkUbFEGAAAECBAg8ISBEPoHnVAIECCwRECQfVXM8AQIECBAgkEXgq1KIEFkQPAgQILC3gCC5t7j5qgiYlAABAgS6FPixrGr6TKTbWQuGBwECBPYSECT3kjYPAQKPCjieAAEC1wRcibym4z0CBAhsLCBIbgxseAIECIwlYLUEdhEQIndhNgkBAgQuCwiSl228Q4AAAQIExhBoa5VvS7lxO+v/y7PbWQuCBwECBGoICJI11M1JgAABAgQILBGIL9d5U04UIg+HQ3HwIECAQDUBQbIavYkJECBAgACBBwXiy3XilNflR4TJ8uRBoCkBxRLoRkCQ7KaVFkKAAAECBLoW+K6sLm5pfV+eYytPHgQIENhDwBznBATJcyr2ESBAgAABAtkE4pbWqCmuRsazjQABAgQqCqQPkhVtTE2AAAECBAjkEIirkfH5yB9KOW5pLQgeBAgQqC0gSNbuQJ/zWxUBAgQIEFhTYPpsZHxj65rjGosAAQIEFgoIkgvhnEagPwErIkCAQEqBuBoZhbmlNRRsBAgQSCIgSCZphDIIECCwSMBJBPoXmD4b+VP/S7VCAgQItCMgSLbTK5USIECAQCcClnG3QHxL6/TZyLtPciABAgQIbC8gSG5vbAYCBAgQIEBgmcDfjqdluBp5LMUTAQIECISAIBkKNgIECBAgQCCbQFyJjM9H/rsU5ptaC4LHEgHnECCwlYAguZWscQkQIECAAIFnBCJExvn/iR82AgQGErDUJgQEySbapEgCBAgQIDCUQFyNjC/ZiSuRbmsdqvUWS4BAKwKnQbKVutVJgAABAgQI9CswXY38ud8lWhkBAgTaFhAk2+7fsXpPBAgQIECgG4HpamQsyNXIULARIEAgoYAgmbApShpEwDIJECBA4JzAdDUybmuN7dwx9hEgQIBAZQFBsnIDTE+AQFsCqiVAYHOB6U9+uK11c2oTECBAYLmAILnczpkECBAg0IaAKtsRiNtaY4uK3dYaCjYCBAgkFRAkkzZGWQQIECBAYECB2W2tB7e1HvwjQIBAXgFBMm9vVEaAAAECBEYSiCuR8Sc/Ys1uaw2FFjc1EyAwjIAgOUyrLZQAAQIECKQWmK5GRpGuRoaCjcBOAqYhsERAkFyi5hwCBAgQIEBgbYFXswF9PnKG4SUBAgTOCFTfJUhWb4ECCBAgQIAAgSIwXZF0NbJgeBAgQCC7gCC5pEPOIUCAAAECBNYU+GY2mM9HzjC8JECAQFYBQTJrZ9S1uoABCRAgQCCtwDxIpi1SYQQIECDwSUCQ/GThFQEC+QRURIDAGAJfz5b5fvbaSwIECBBIKiBIJm2MsggQINCugMoJPCwwvyIpSD7M5wQCBAjsLyBI7m9uRgIECBAgkE+gXkVfzab2RTszDC8JECCQWUCQzNwdtREgQIAAgf4FBMkneuxUAgQI1BIQJGvJm5cAAQIECBAIgfltrb/EDhuBzgUsj0AXAoJkF220CAIECBAg0KzAq2YrVzgBAgMJWOqpgCB5KuJ3AgQIECBAYE8Bt7buqW0uAgQIrCTQRJBcaa2GIUCAAAECBHIL+LKd3P1RHQECBF4EBMkXCi9WFjAcAQIECBC4JRBXI+efkfSnP26JeZ8AAQJJBATJJI1QBoEcAqogQIAAAQIECBAgcFtAkLxt5AgCBAjkFlAdgXYFHrkaGVcv212pygkQINCZgCDZWUMthwABAgTaEFDlB4F5OLz2+cgInP8rZ8Q2P6fs8iBAgACBGgKCZA11cxIgQIAAAQL3CkSIfHc8OEJkbMdfd38yIQECBAgcBQTJI4QnAgQIECBAYHeBr2cz/jJ7Pb18W15MIbK8PPx0OBx8Ic/Bv8cEHE2AwBYCguQWqsYkQIAAAQIE7hGYX108vbX1H2WAN2WbHhEgX0+/eCZAoHMBy0svIEimb5ECCRAgQIBAtwLzIBlBcVpo7P9++uX4LEQeITwRIEAgg8C5IJmhLjUQIECAAAECfQvEZx+nFZ5ejfxuemP2fHrM7C0vCRAgQGBvAUFyb/HN5jMwAQIECBBoSmAeJOdXI2MR81ta4/f4bGQ82wgQIEAgiYAgmaQRyhhUwLIJECBAIAR+jR/HLW5rPb58eTr3RTwvb3pBgAABAvsLCJL7m5uRAIHGBZRPgMAqAn+5MMq521pdkbyAZTcBAgRqCQiSteTNS4AAAQJ7Cpgrn8CfZyWd3to6e+vgs5EH/wgQIJBPQJDM1xMVESBAgACB3gVOb1+dh8XZ35b8wPDzh59+ECBAgEAqAUEyVTsUQ4AAAQIEhhCYB8kIkbHFwmP//Et4Yp+tNQH1EiAwhIAgOUSbLZIAAQIECKQSuBQW/3qmyrdn9tlFgMDKAoYj8KiAIPmomOMJECBAgACBZwVezQaYrkbGru/jx2z7YfbaSwIECBD4XKDqb4JkVX6TEyBAgACBIQXOXZH8sUj8sWzT47/lhauRBcGDAAECGQUEyaVdcR4BAgQIECCwlkAEy9M/+/H3tQY3DgECBAisLyBIrm9qxMQCSiNAgACBFALzP/cRIfLdSVXxdyPnx5y87VcCBAgQqC0gSNbugPkJELgl4H0CBPoT+PXKkiJAvr7yGW5v+QAAA+5JREFUvrcIECBAIIGAIJmgCUogQIBAfwJWROCqQHz28bczR0SI/PbMfrsIECBAIJmAIJmsIcohQIAAAQLVBPad+F8n0wmRJyB+JUCAQGYBQTJzd9RGgAABAgT6FfhnWdqfyha3scazK5EFY8nDOQQIEKghIEjWUDcnAQIECBAgEALxNyTji3XiOX63ERhFwDoJNC8gSDbfQgsgQIAAAQIECBAgQGB7ATPMBQTJuYbXBAgQIECAAAECBAgQIHBToJkgeXMlDiBAgAABAgQIECBAgACBXQQEyV2Yh53EwgkQIECAAAECBAgQ6FBAkOywqZZE4DkBZxMgQIAAAQIECBC4LiBIXvfxLgECBNoQUCUBAgQIECBAYEcBQXJHbFMRIECAAIG5gNcECBAgQKBVAUGy1c6pmwABAgQIEKghYE4CBAgQKAKCZEHwIECAAAECBAgQ6FnA2ggQWFtAkFxb1HgECBAgQIAAAQIECDwvYITUAoJk6vYojgABAgQIECBAgAABAvkELgXJfJWqiAABAgQIECBAgAABAgRSCAiSKdqwVhHGIUCAAAECBAgQIECAwPYCguT2xmYgcF3AuwQIECBAgAABAgQaExAkG2uYcgkQyCGgCgIECBAgQIDAyAKC5Mjdt3YCBAiMJWC1BAgQIECAwEoCguRKkIYhQIAAAQIEthAwJgECBAhkFBAkM3ZFTQQIECBAgACBlgXUToBA9wKCZPcttkACBAgQIECAAAECtwUcQeARAUHyES3HEiBAgAABAgQIECBAII9AtUoEyWr0JiZAgAABAgQIECBAgECbAoLkM31zLgECBAgQIECAAAECBAYUECQHbProS7Z+AgQIECBAgAABAgSeExAkn/NzNgEC+wiYhQABAgQIECBAIJGAIJmoGUohQIBAXwJWQ4AAAQIECPQqIEj22lnrIkCAAAECSwScQ4AAAQIE7hAQJO9AcggBAgQIECBAILOA2ggQILC3gCC5t7j5CBAgQIAAAQIECBwODAg0LSBINt0+xRMgQIAAAQIECBAgsJ+AmSYBQXKS8EyAAAECBAgQIECAAAECdwk0FSTvWpGDCBAgQIAAAQIECBAgQGBTAUFyU16DHw4HCAQIECBAgAABAgQIdCYgSHbWUMshsI6AUQgQIECAAAECBAhcFhAkL9t4hwABAm0JqJYAAQIECBAgsJOAILkTtGkIECBAgMA5AfsIECBAgECLAoJki11TMwECBAgQIFBTwNwECBAYXkCQHP6/AAACBAgQIECAwAgC1kiAwJoCguSamsYiQIAAAQIECBAgQGA9ASOlFRAk07ZGYQQIECBAgAABAgQIEMgp8DsAAAD//5B9n3gAAAAGSURBVAMA03RricMWNH0AAAAASUVORK5CYII=', '', '/uploads/pdfs/OT_FINAL_20_1769011495.pdf', '2026-01-21 13:04:55'),
(21, 5, 2, '2026-01-12 11:19:31', NULL, 1, 'Mantenimiento preventivo OT 1673', 'MEDIA', 'Interna', 'MANTENCION', NULL, NULL, '2026-01-12 14:19:31', '2026-01-12 19:57:26', NULL, NULL, NULL, NULL, NULL),
(22, 5, 4, '2026-01-12 11:25:25', NULL, 1, 'MANTENCION PROGRAMADA (EDITADO): Mantenimiento preventivo OT 1703', 'MEDIA', 'Preventiva', 'MANTENCION', '6400', 'CRONOGRAMA', '2026-01-12 14:25:25', '2026-01-12 17:11:35', NULL, NULL, NULL, NULL, NULL),
(23, 5, 28, '2026-01-12 15:30:45', NULL, 1, 'MANTENCION PROGRAMADA: Mantenimiento preventivo', 'MEDIA', 'Preventiva', 'MANTENCION', '6400', 'CRONOGRAMA', '2026-01-12 18:30:45', '2026-01-12 18:30:45', NULL, NULL, NULL, NULL, NULL),
(24, 5, 29, '2026-01-12 15:31:56', NULL, 6, 'MANTENCION PROGRAMADA: Mantenimiento preventivo', 'MEDIA', 'Preventiva', 'MANTENCION', '6400', 'CRONOGRAMA', '2026-01-12 18:31:56', '2026-01-13 14:07:45', NULL, NULL, NULL, NULL, NULL),
(25, 5, 30, '2026-01-12 15:33:27', NULL, 1, 'MANTENCION PROGRAMADA: Mantenimiento preventivo ', 'MEDIA', 'Preventiva', 'MANTENCION', '6400', 'CRONOGRAMA', '2026-01-12 18:33:27', '2026-01-12 18:33:27', NULL, NULL, NULL, NULL, NULL),
(26, 5, 31, '2026-01-12 15:34:12', NULL, 1, 'Mantenimiento preventivo', 'MEDIA', 'Interna', 'MANTENCION', NULL, NULL, '2026-01-12 18:34:12', '2026-01-12 19:56:49', NULL, NULL, NULL, NULL, NULL),
(27, 5, 34, '2026-01-12 15:40:11', NULL, 6, 'MANTENCION PROGRAMADA: Auditoría Perú', 'MEDIA', 'Preventiva', 'MANTENCION', '6400', 'CRONOGRAMA', '2026-01-12 18:40:11', '2026-01-12 20:03:18', NULL, NULL, NULL, NULL, NULL),
(28, 5, NULL, '2026-01-12 16:53:37', NULL, 1, 'Cambio de contador de metabisulfito OT 1710', 'MEDIA', 'Servicio', NULL, '6130', 'Froilan Urdaneta ', '2026-01-12 19:53:37', '2026-01-12 19:53:37', NULL, NULL, NULL, NULL, NULL),
(29, 5, 34, '2026-01-12 17:03:50', NULL, 1, 'Auditoría Perú', 'MEDIA', 'Interna', 'MANTENCION', NULL, NULL, '2026-01-12 20:03:50', '2026-01-20 14:58:57', 1, NULL, NULL, NULL, NULL),
(30, 1, 30, '2026-01-20 11:41:04', NULL, 5, '', 'MEDIA', 'Interna', NULL, NULL, NULL, '2026-01-20 14:41:04', '2026-01-20 14:52:00', NULL, NULL, NULL, NULL, NULL),
(31, 1, 1, '2026-01-20 12:01:05', NULL, 1, '', 'MEDIA', 'Interna', NULL, NULL, NULL, '2026-01-20 15:01:05', '2026-01-20 15:01:19', 1, NULL, NULL, NULL, NULL),
(32, 1, 1, '2026-01-20 12:12:37', NULL, 1, '', 'MEDIA', 'Interna', NULL, NULL, NULL, '2026-01-20 15:12:37', '2026-01-20 15:13:05', 1, NULL, NULL, NULL, NULL),
(33, 1, 30, '2026-01-21 15:41:46', NULL, 1, 'MANTENCION PROGRAMADA: Mantencion preventivo', 'MEDIA', 'Preventiva', 'MANTENCION', '6400', 'CRONOGRAMA', '2026-01-21 18:41:46', '2026-01-21 18:41:46', NULL, NULL, NULL, NULL, NULL),
(34, 1, 30, '2026-01-21 15:41:47', NULL, 1, 'MANTENCION PROGRAMADA: Mantencion preventivo', 'MEDIA', 'Preventiva', 'MANTENCION', '6400', 'CRONOGRAMA', '2026-01-21 18:41:47', '2026-01-21 18:41:47', NULL, NULL, NULL, NULL, NULL),
(35, 1, 30, '2026-01-21 15:42:38', NULL, 1, 'MANTENCION PROGRAMADA: Mantencion', 'MEDIA', 'Preventiva', 'MANTENCION', '6400', 'CRONOGRAMA', '2026-01-21 18:42:38', '2026-01-21 18:42:38', NULL, NULL, NULL, NULL, NULL),
(36, 1, 30, '2026-01-21 15:42:38', NULL, 1, 'MANTENCION PROGRAMADA: Mantencion', 'MEDIA', 'Preventiva', 'MANTENCION', '6400', 'CRONOGRAMA', '2026-01-21 18:42:38', '2026-01-21 18:42:38', NULL, NULL, NULL, NULL, NULL),
(37, 1, 30, '2026-01-21 15:52:38', NULL, 1, 'MANTENCION PROGRAMADA: Mantencion General', 'MEDIA', 'Preventiva', 'MANTENCION', '6400', 'CRONOGRAMA', '2026-01-21 18:52:38', '2026-01-21 18:52:38', NULL, NULL, NULL, NULL, NULL),
(38, 1, 30, '2026-01-21 15:52:38', NULL, 1, 'MANTENCION PROGRAMADA: Mantencion General', 'MEDIA', 'Preventiva', 'MANTENCION', '6400', 'CRONOGRAMA', '2026-01-21 18:52:38', '2026-01-21 18:52:38', NULL, NULL, NULL, NULL, NULL),
(39, 1, 30, '2026-01-21 15:52:38', NULL, 1, 'MANTENCION PROGRAMADA: Mantencion General', 'MEDIA', 'Preventiva', 'MANTENCION', '6400', 'CRONOGRAMA', '2026-01-21 18:52:38', '2026-01-21 18:52:38', NULL, NULL, NULL, NULL, NULL),
(40, 1, 30, '2026-01-21 15:52:38', NULL, 1, 'MANTENCION PROGRAMADA: Mantencion General', 'MEDIA', 'Preventiva', 'MANTENCION', '6400', 'CRONOGRAMA', '2026-01-21 18:52:38', '2026-01-21 18:52:38', NULL, NULL, NULL, NULL, NULL);

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
(1, 'Contado');

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
-- Estructura de tabla para la tabla `ubicaciones_envio`
--

CREATE TABLE `ubicaciones_envio` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  `activo` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `ubicaciones_envio`
--

INSERT INTO `ubicaciones_envio` (`id`, `nombre`, `descripcion`, `activo`, `created_at`) VALUES
(1, 'Planta 1', 'Planta principal de Insuban', 1, '2026-01-14 19:13:01'),
(2, 'Planta 2', 'Planta secundaria de Insuban', 1, '2026-01-14 19:13:01'),
(3, 'HOR', 'Andes Biotech Solutions', 1, '2026-01-14 19:13:01'),
(4, 'Comafri', 'Matadero de Rancagua', 1, '2026-01-14 19:13:01'),
(5, 'Camer', 'Matadero de la Pintana', 1, '2026-01-14 19:13:01'),
(6, 'Coexca', 'Matadero de Talca', 1, '2026-01-14 19:13:01');

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
  `activo` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id`, `nombre`, `apellido`, `username`, `password_hash`, `email`, `telefono`, `rol_id`, `activo`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 'Nicolas', 'Salas', 'nsalas', '$2a$12$NLkp39h0OD0des7c12uhleid1Yts5xA9A99FtWel23h1vAOOf7LRa', 'nsalas@insuban.cl', NULL, 1, 1, '2025-12-29 18:59:17', '2026-01-07 03:11:23', NULL),
(2, 'Froilan', 'Urdaneta', 'furdaneta', '$2a$12$NLkp39h0OD0des7c12uhleid1Yts5xA9A99FtWel23h1vAOOf7LRa', 'furdaneta@insuban.cl', NULL, 3, 1, '2025-12-29 18:59:17', '2026-01-07 03:11:42', NULL),
(3, 'Carlos', 'Ruiz', 'cruiz', '$2a$12$NLkp39h0OD0des7c12uhleid1Yts5xA9A99FtWel23h1vAOOf7LRa', 'cruiz@insuban.cl', NULL, 5, 1, '2025-12-29 18:59:17', '2026-01-12 11:47:11', NULL),
(4, 'Rafael', 'Morales', 'rmorales', '$2a$12$NLkp39h0OD0des7c12uhleid1Yts5xA9A99FtWel23h1vAOOf7LRa', 'rmorales@insuban.cl', NULL, 2, 1, '2025-12-29 18:59:17', '2026-01-07 03:11:49', NULL),
(5, 'Carla', 'Tapia', 'ctapia', '$2y$10$WIVqXIUaSOseyegN9H446enRhqPHJZPc8sUSdES9ImZy2eYVaT.Ei', 'ctapia@insuban.cl', '', 1, 1, '2026-01-12 00:32:34', '2026-01-12 16:09:14', NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuario_permisos`
--

CREATE TABLE `usuario_permisos` (
  `id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `permiso_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `usuario_permisos`
--

INSERT INTO `usuario_permisos` (`id`, `usuario_id`, `permiso_id`) VALUES
(215, 1, 13),
(216, 1, 14),
(217, 1, 16),
(218, 1, 17),
(219, 1, 18),
(220, 1, 19),
(221, 1, 20),
(222, 1, 21),
(223, 1, 22),
(224, 1, 23),
(225, 1, 24),
(226, 1, 25),
(227, 1, 26),
(228, 1, 27),
(229, 1, 28),
(230, 1, 29),
(231, 1, 30),
(232, 1, 31),
(233, 1, 32),
(234, 1, 33),
(235, 1, 34),
(236, 1, 35),
(237, 1, 36),
(238, 1, 37),
(239, 1, 38),
(240, 1, 39),
(241, 1, 40),
(242, 1, 41),
(243, 1, 42),
(244, 1, 43),
(245, 1, 44),
(246, 1, 45),
(247, 1, 46),
(248, 1, 47),
(249, 1, 48),
(250, 1, 49),
(251, 1, 50),
(252, 1, 51),
(254, 1, 52),
(253, 1, 53),
(255, 2, 23),
(256, 2, 24),
(257, 2, 25),
(258, 2, 26),
(259, 2, 27),
(260, 2, 28),
(261, 2, 29),
(262, 2, 32),
(263, 2, 34),
(264, 2, 35),
(265, 2, 37),
(266, 2, 39),
(267, 2, 41),
(268, 2, 43),
(269, 2, 46),
(270, 2, 47),
(271, 2, 48),
(272, 2, 49),
(273, 2, 50),
(868, 3, 13),
(869, 3, 16),
(870, 3, 17),
(871, 3, 18),
(872, 3, 19),
(873, 3, 20),
(874, 3, 21),
(875, 3, 22),
(876, 3, 31),
(877, 3, 33),
(878, 3, 34),
(879, 3, 35),
(880, 3, 36),
(881, 3, 51),
(882, 3, 52),
(883, 3, 53),
(884, 3, 54),
(885, 3, 55),
(886, 3, 56),
(887, 3, 57),
(888, 3, 58),
(889, 3, 59),
(890, 3, 60),
(891, 3, 61),
(892, 3, 62),
(893, 3, 63),
(894, 3, 64),
(895, 3, 65),
(896, 3, 66),
(897, 3, 67),
(898, 3, 68),
(903, 3, 69),
(899, 3, 70),
(900, 3, 71),
(901, 3, 72),
(902, 3, 73),
(274, 4, 16),
(275, 4, 22),
(276, 4, 51),
(277, 4, 52),
(278, 4, 53),
(793, 5, 13),
(794, 5, 16),
(795, 5, 17),
(796, 5, 18),
(797, 5, 19),
(798, 5, 20),
(799, 5, 21),
(800, 5, 22),
(801, 5, 23),
(802, 5, 24),
(803, 5, 25),
(804, 5, 26),
(805, 5, 27),
(806, 5, 28),
(807, 5, 29),
(808, 5, 30),
(809, 5, 31),
(810, 5, 32),
(811, 5, 33),
(812, 5, 34),
(813, 5, 35),
(814, 5, 36),
(815, 5, 37),
(816, 5, 38),
(817, 5, 39),
(818, 5, 40),
(819, 5, 41),
(820, 5, 42),
(821, 5, 43),
(822, 5, 44),
(823, 5, 45),
(824, 5, 46),
(825, 5, 47),
(826, 5, 48),
(827, 5, 49),
(828, 5, 50),
(829, 5, 51),
(830, 5, 52),
(831, 5, 53),
(834, 5, 54),
(833, 5, 55),
(832, 5, 56),
(835, 5, 57);

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
-- Indices de la tabla `activos_imagenes`
--
ALTER TABLE `activos_imagenes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `activo_id` (`activo_id`);

--
-- Indices de la tabla `activos_insumos`
--
ALTER TABLE `activos_insumos`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_activo_insumo` (`activo_id`,`insumo_id`),
  ADD KEY `activos_insumos_ibfk_2` (`insumo_id`);

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
  ADD KEY `fk_comuna_region` (`region_id`);

--
-- Indices de la tabla `cotizaciones`
--
ALTER TABLE `cotizaciones`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_cot_usuario` (`usuario_id`),
  ADD KEY `fk_cot_estado` (`estado_id`);

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
  ADD KEY `fecha_programada` (`fecha_programada`),
  ADD KEY `fk_crono_ot` (`solicitud_ot_id`),
  ADD KEY `crono_activo_fk` (`activo_id`),
  ADD KEY `fk_cron_insumo` (`insumo_id`);

--
-- Indices de la tabla `detalle_cotizacion`
--
ALTER TABLE `detalle_cotizacion`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_det_cot_id` (`cotizacion_id`),
  ADD KEY `fk_det_cot_insumo` (`insumo_id`);

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
  ADD KEY `fk_emp_usu_final` (`usuario_id`);

--
-- Indices de la tabla `entregas_personal`
--
ALTER TABLE `entregas_personal`
  ADD PRIMARY KEY (`id`),
  ADD KEY `insumo_id` (`insumo_id`),
  ADD KEY `usuario_operario_id` (`usuario_operario_id`),
  ADD KEY `usuario_bodeguero_id` (`usuario_bodeguero_id`),
  ADD KEY `estado_id` (`estado_id`);

--
-- Indices de la tabla `estados_cotizacion`
--
ALTER TABLE `estados_cotizacion`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `estados_entrega`
--
ALTER TABLE `estados_entrega`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `codigo` (`codigo`);

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
  ADD KEY `categoria_id` (`categoria_id`);

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
  ADD KEY `fk_movimiento_empleado` (`empleado_id`),
  ADD KEY `fk_movimiento_ubicacion` (`ubicacion_id`),
  ADD KEY `movimientos_inventario_ibfk_3` (`usuario_id`),
  ADD KEY `fk_mov_ubicacion_envio` (`ubicacion_envio_id`);

--
-- Indices de la tabla `ordenes_compra`
--
ALTER TABLE `ordenes_compra`
  ADD PRIMARY KEY (`id`),
  ADD KEY `proveedor_id` (`proveedor_id`),
  ADD KEY `usuario_creador_id` (`usuario_creador_id`),
  ADD KEY `estado_id` (`estado_id`);

--
-- Indices de la tabla `ot_checklist_respuestas`
--
ALTER TABLE `ot_checklist_respuestas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `solicitud_ot_id` (`solicitud_ot_id`);

--
-- Indices de la tabla `paises`
--
ALTER TABLE `paises`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `permisos`
--
ALTER TABLE `permisos`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `codigo` (`codigo`);

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
  ADD KEY `fk_region_pais` (`pais_id`);

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
  ADD KEY `estado_id` (`estado_id`),
  ADD KEY `fk_ot_asignado` (`asignado_a`);

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
  ADD UNIQUE KEY `codigo` (`codigo`),
  ADD KEY `fk_ubicacion_sector` (`sector_id`);

--
-- Indices de la tabla `ubicaciones_envio`
--
ALTER TABLE `ubicaciones_envio`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `rol_id` (`rol_id`);

--
-- Indices de la tabla `usuario_permisos`
--
ALTER TABLE `usuario_permisos`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_perm` (`usuario_id`,`permiso_id`),
  ADD KEY `fk_up_permiso` (`permiso_id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `activos`
--
ALTER TABLE `activos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=35;

--
-- AUTO_INCREMENT de la tabla `activos_docs`
--
ALTER TABLE `activos_docs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `activos_imagenes`
--
ALTER TABLE `activos_imagenes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `activos_insumos`
--
ALTER TABLE `activos_insumos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=135;

--
-- AUTO_INCREMENT de la tabla `areas_negocio`
--
ALTER TABLE `areas_negocio`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT de la tabla `categorias_insumo`
--
ALTER TABLE `categorias_insumo`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6534;

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
-- AUTO_INCREMENT de la tabla `cotizaciones`
--
ALTER TABLE `cotizaciones`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `cronograma_insumos`
--
ALTER TABLE `cronograma_insumos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=499;

--
-- AUTO_INCREMENT de la tabla `cronograma_mantencion`
--
ALTER TABLE `cronograma_mantencion`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT de la tabla `detalle_cotizacion`
--
ALTER TABLE `detalle_cotizacion`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `detalle_orden_compra`
--
ALTER TABLE `detalle_orden_compra`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT de la tabla `detalle_solicitud`
--
ALTER TABLE `detalle_solicitud`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=224;

--
-- AUTO_INCREMENT de la tabla `empleados`
--
ALTER TABLE `empleados`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `entregas_personal`
--
ALTER TABLE `entregas_personal`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- AUTO_INCREMENT de la tabla `estados_cotizacion`
--
ALTER TABLE `estados_cotizacion`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `estados_entrega`
--
ALTER TABLE `estados_entrega`
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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1576;

--
-- AUTO_INCREMENT de la tabla `insumo_stock_ubicacion`
--
ALTER TABLE `insumo_stock_ubicacion`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=83;

--
-- AUTO_INCREMENT de la tabla `movimientos_inventario`
--
ALTER TABLE `movimientos_inventario`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=121;

--
-- AUTO_INCREMENT de la tabla `ordenes_compra`
--
ALTER TABLE `ordenes_compra`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=240002;

--
-- AUTO_INCREMENT de la tabla `ot_checklist_respuestas`
--
ALTER TABLE `ot_checklist_respuestas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=57;

--
-- AUTO_INCREMENT de la tabla `paises`
--
ALTER TABLE `paises`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de la tabla `permisos`
--
ALTER TABLE `permisos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=75;

--
-- AUTO_INCREMENT de la tabla `proveedores`
--
ALTER TABLE `proveedores`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=234;

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1000;

--
-- AUTO_INCREMENT de la tabla `sectores`
--
ALTER TABLE `sectores`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT de la tabla `sistema_logs`
--
ALTER TABLE `sistema_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `solicitudes_ot`
--
ALTER TABLE `solicitudes_ot`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=41;

--
-- AUTO_INCREMENT de la tabla `tipos_movimiento`
--
ALTER TABLE `tipos_movimiento`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `tipos_venta`
--
ALTER TABLE `tipos_venta`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `ubicaciones`
--
ALTER TABLE `ubicaciones`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=92;

--
-- AUTO_INCREMENT de la tabla `ubicaciones_envio`
--
ALTER TABLE `ubicaciones_envio`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `usuario_permisos`
--
ALTER TABLE `usuario_permisos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=904;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `activos_docs`
--
ALTER TABLE `activos_docs`
  ADD CONSTRAINT `activos_docs_ibfk_1` FOREIGN KEY (`activo_id`) REFERENCES `activos` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `activos_imagenes`
--
ALTER TABLE `activos_imagenes`
  ADD CONSTRAINT `activos_imagenes_ibfk_1` FOREIGN KEY (`activo_id`) REFERENCES `activos` (`id`) ON DELETE CASCADE;

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
  ADD CONSTRAINT `fk_comuna_region` FOREIGN KEY (`region_id`) REFERENCES `regiones` (`id`);

--
-- Filtros para la tabla `cotizaciones`
--
ALTER TABLE `cotizaciones`
  ADD CONSTRAINT `fk_cot_estado` FOREIGN KEY (`estado_id`) REFERENCES `estados_cotizacion` (`id`),
  ADD CONSTRAINT `fk_cot_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`);

--
-- Filtros para la tabla `cronograma_insumos`
--
ALTER TABLE `cronograma_insumos`
  ADD CONSTRAINT `fk_crono_ins_detail` FOREIGN KEY (`insumo_id`) REFERENCES `insumos` (`id`),
  ADD CONSTRAINT `fk_crono_main` FOREIGN KEY (`cronograma_id`) REFERENCES `cronograma_mantencion` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `cronograma_mantencion`
--
ALTER TABLE `cronograma_mantencion`
  ADD CONSTRAINT `crono_activo_fk` FOREIGN KEY (`activo_id`) REFERENCES `activos` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_cron_insumo` FOREIGN KEY (`insumo_id`) REFERENCES `insumos` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_crono_ot` FOREIGN KEY (`solicitud_ot_id`) REFERENCES `solicitudes_ot` (`id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `detalle_cotizacion`
--
ALTER TABLE `detalle_cotizacion`
  ADD CONSTRAINT `fk_det_cot_id` FOREIGN KEY (`cotizacion_id`) REFERENCES `cotizaciones` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_det_cot_insumo` FOREIGN KEY (`insumo_id`) REFERENCES `insumos` (`id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `detalle_orden_compra`
--
ALTER TABLE `detalle_orden_compra`
  ADD CONSTRAINT `detalle_orden_compra_ibfk_1` FOREIGN KEY (`orden_compra_id`) REFERENCES `ordenes_compra` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `detalle_orden_compra_ibfk_2` FOREIGN KEY (`insumo_id`) REFERENCES `insumos` (`id`);

--
-- Filtros para la tabla `detalle_solicitud`
--
ALTER TABLE `detalle_solicitud`
  ADD CONSTRAINT `detalle_solicitud_ibfk_1` FOREIGN KEY (`solicitud_id`) REFERENCES `solicitudes_ot` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `detalle_solicitud_ibfk_2` FOREIGN KEY (`insumo_id`) REFERENCES `insumos` (`id`),
  ADD CONSTRAINT `detalle_solicitud_ibfk_3` FOREIGN KEY (`orden_compra_id`) REFERENCES `ordenes_compra` (`id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `empleados`
--
ALTER TABLE `empleados`
  ADD CONSTRAINT `fk_emp_usu_final` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `entregas_personal`
--
ALTER TABLE `entregas_personal`
  ADD CONSTRAINT `entregas_personal_ibfk_1` FOREIGN KEY (`insumo_id`) REFERENCES `insumos` (`id`),
  ADD CONSTRAINT `entregas_personal_ibfk_2` FOREIGN KEY (`usuario_operario_id`) REFERENCES `usuarios` (`id`),
  ADD CONSTRAINT `entregas_personal_ibfk_3` FOREIGN KEY (`usuario_bodeguero_id`) REFERENCES `usuarios` (`id`),
  ADD CONSTRAINT `entregas_personal_ibfk_4` FOREIGN KEY (`estado_id`) REFERENCES `estados_entrega` (`id`);

--
-- Filtros para la tabla `insumos`
--
ALTER TABLE `insumos`
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
  ADD CONSTRAINT `fk_mov_ubicacion_envio` FOREIGN KEY (`ubicacion_envio_id`) REFERENCES `ubicaciones_envio` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_movimiento_empleado` FOREIGN KEY (`empleado_id`) REFERENCES `empleados` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_movimiento_ubicacion` FOREIGN KEY (`ubicacion_id`) REFERENCES `ubicaciones` (`id`),
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
-- Filtros para la tabla `ot_checklist_respuestas`
--
ALTER TABLE `ot_checklist_respuestas`
  ADD CONSTRAINT `ot_checklist_respuestas_ibfk_1` FOREIGN KEY (`solicitud_ot_id`) REFERENCES `solicitudes_ot` (`id`) ON DELETE CASCADE;

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
  ADD CONSTRAINT `fk_region_pais` FOREIGN KEY (`pais_id`) REFERENCES `paises` (`id`);

--
-- Filtros para la tabla `sistema_logs`
--
ALTER TABLE `sistema_logs`
  ADD CONSTRAINT `sistema_logs_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `solicitudes_ot`
--
ALTER TABLE `solicitudes_ot`
  ADD CONSTRAINT `fk_ot_asignado` FOREIGN KEY (`asignado_a`) REFERENCES `usuarios` (`id`),
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

--
-- Filtros para la tabla `usuario_permisos`
--
ALTER TABLE `usuario_permisos`
  ADD CONSTRAINT `fk_up_permiso` FOREIGN KEY (`permiso_id`) REFERENCES `permisos` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_up_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
