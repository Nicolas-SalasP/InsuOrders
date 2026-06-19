-- Migración: Tipo de trabajo en OT + registro de permiso retirado
-- Ejecutar una sola vez en producción

-- 1. Nueva tabla para categorías de trabajo
CREATE TABLE IF NOT EXISTS `tipos_trabajo` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Columna tipo_trabajo_id en solicitudes_ot
ALTER TABLE `solicitudes_ot`
  ADD COLUMN IF NOT EXISTS `tipo_trabajo_id` int(11) DEFAULT NULL AFTER `ubicacion`;

-- 3. Columnas auditoría de permiso de trabajo retirado
ALTER TABLE `solicitudes_ot`
  ADD COLUMN IF NOT EXISTS `permiso_retirado` TINYINT(1) NULL DEFAULT NULL AFTER `descripcion_permiso`,
  ADD COLUMN IF NOT EXISTS `permiso_retirado_usuario_id` INT(11) NULL DEFAULT NULL AFTER `permiso_retirado`,
  ADD COLUMN IF NOT EXISTS `permiso_retirado_fecha` DATETIME NULL DEFAULT NULL AFTER `permiso_retirado_usuario_id`;

-- 4. FK idempotente: eliminar si existe, luego crear
ALTER TABLE `solicitudes_ot` DROP FOREIGN KEY IF EXISTS `fk_sot_tipo_trabajo`;
ALTER TABLE `solicitudes_ot`
  ADD CONSTRAINT `fk_sot_tipo_trabajo` FOREIGN KEY (`tipo_trabajo_id`) REFERENCES `tipos_trabajo` (`id`) ON DELETE SET NULL;
