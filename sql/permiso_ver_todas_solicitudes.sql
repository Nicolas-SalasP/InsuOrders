-- ============================================================
-- PERMISO: Ver todas las solicitudes del portal
-- ============================================================
-- Crea el permiso 'solicitudes_ver_todas'. Cualquier usuario cuyo
-- rol tenga este permiso (o sea Admin) verá TODAS las solicitudes
-- del portal, no solo las propias.
-- ============================================================

-- 1. Crear el permiso (id 87, siguiente disponible tras el 86)
INSERT INTO `permisos` (`id`, `codigo`, `modulo`, `descripcion`) VALUES
(87, 'solicitudes_ver_todas', 'Cliente', 'Ver todas las solicitudes del portal, no solo las propias');

-- 2. Asignar el permiso a los roles que lo necesiten.
--    Ajusta los rol_id según tu tabla `roles`.
--    Ejemplo: asignarlo al rol con id = 2 (ajustar según corresponda).
--
-- INSERT INTO `rol_permisos` (`rol_id`, `permiso_id`) VALUES (2, 87);
--
-- Para ver los roles disponibles y elegir el correcto:
--   SELECT id, nombre FROM roles;
--
-- Nota: el rol 'Admin' ya ve todo automáticamente, no requiere esta asignación.
