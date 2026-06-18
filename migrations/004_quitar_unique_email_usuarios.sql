-- Migración: Quitar restricción UNIQUE del email en tabla usuarios
-- Ejecutar una sola vez en producción

ALTER TABLE `usuarios` DROP INDEX IF EXISTS `email`;
