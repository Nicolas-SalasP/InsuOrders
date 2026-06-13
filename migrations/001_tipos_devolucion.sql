-- Migración: Crear tabla tipos_devolucion y agregar columna a devoluciones_pendientes
-- Ejecutar una sola vez en el servidor de producción

CREATE TABLE IF NOT EXISTS `tipos_devolucion` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `codigo` varchar(30) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  `reintegra_stock` tinyint(1) NOT NULL DEFAULT 1,
  `requiere_organizacion` tinyint(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_codigo` (`codigo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT IGNORE INTO `tipos_devolucion` (`codigo`, `nombre`, `descripcion`, `reintegra_stock`, `requiere_organizacion`) VALUES
('SOBRANTE',       'Devolución (Sobrante)',       'El técnico recibió el material pero le sobró. Vuelve a bodega para organizar.',         1, 1),
('RECHAZO_DANIO',  'Rechazo por Daño',            'El técnico recibió el producto pero está dañado. No vuelve al stock disponible.',       0, 0),
('RECHAZO_NO_REC', 'Rechazo por No Recibido',     'El técnico nunca recibió el producto físicamente. Se reintegra el stock de inmediato.', 1, 0);

ALTER TABLE `devoluciones_pendientes`
  ADD COLUMN IF NOT EXISTS `tipo_devolucion_id` int(11) DEFAULT 1;
