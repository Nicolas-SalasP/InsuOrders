-- Migración: Registro de permiso retirado por técnico (auditoría individual)
-- Ejecutar una sola vez en producción

CREATE TABLE IF NOT EXISTS `ot_permiso_retirado` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `ot_id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `retirado` tinyint(1) NOT NULL,
  `fecha` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_ot_usuario` (`ot_id`, `usuario_id`),
  KEY `idx_ot_id` (`ot_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
