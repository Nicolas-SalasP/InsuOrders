-- ============================================================
-- ELIMINAR TODAS LAS OTs Y DATOS ASOCIADOS
-- ============================================================
-- IMPORTANTE: NO usar TRUNCATE. TRUNCATE resetea el AUTO_INCREMENT
-- y provoca que IDs reutilizados "hereden" datos huérfanos.
-- Este script usa DELETE para preservar el contador AUTO_INCREMENT.
--
-- NO toca: ordenes_compra, inventario, insumos, activos,
-- entregas_personal de bodega general, ni movimientos de stock.
--
-- Ejecutar dentro de una transacción para poder revertir si algo sale mal.
-- ============================================================

START TRANSACTION;

-- Desactivar temporalmente verificación de FK para orden flexible
SET FOREIGN_KEY_CHECKS = 0;

-- 1. Respuestas de checklist de OT
DELETE FROM ot_checklist_respuestas;

-- 2. Asignaciones de técnicos a OT
DELETE FROM ot_asignaciones;

-- 3. Detalle de insumos solicitados por OT
DELETE FROM detalle_solicitud;

-- 4. Entregas a personal vinculadas a una OT (solo las que tienen referencia_ot_id)
--    Las entregas de bodega general (referencia_ot_id IS NULL) NO se tocan.
DELETE FROM entregas_personal WHERE referencia_ot_id IS NOT NULL;

-- 5. Desvincular eventos de cronograma de las OTs (sin borrar el cronograma)
UPDATE cronograma SET solicitud_ot_id = NULL WHERE solicitud_ot_id IS NOT NULL;

-- 6. Finalmente, las OTs
DELETE FROM solicitudes_ot;

-- Reactivar verificación de FK
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- IMPORTANTE: NO reseteamos AUTO_INCREMENT a propósito.
-- Si quisieras reiniciar el contador (NO recomendado si hay
-- datos huérfanos posibles), descomenta la siguiente línea:
-- ALTER TABLE solicitudes_ot AUTO_INCREMENT = 1;
-- ============================================================

-- Verificación: estas consultas deben devolver 0
SELECT 'solicitudes_ot' AS tabla, COUNT(*) AS registros FROM solicitudes_ot
UNION ALL
SELECT 'detalle_solicitud', COUNT(*) FROM detalle_solicitud
UNION ALL
SELECT 'ot_asignaciones', COUNT(*) FROM ot_asignaciones
UNION ALL
SELECT 'ot_checklist_respuestas', COUNT(*) FROM ot_checklist_respuestas
UNION ALL
SELECT 'entregas_personal con OT', COUNT(*) FROM entregas_personal WHERE referencia_ot_id IS NOT NULL;

-- Si todo se ve bien (todos en 0), confirma con:
COMMIT;

-- Si algo salió mal, en vez de COMMIT ejecuta:
-- ROLLBACK;
