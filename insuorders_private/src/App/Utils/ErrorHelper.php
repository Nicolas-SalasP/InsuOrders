<?php
namespace App\Utils;

class ErrorHelper
{
    public static function safeMessage(\Exception $e): string
    {
        if ($e instanceof \PDOException) {
            error_log("[DB] " . $e->getMessage());
            return "Error interno del servidor.";
        }
        return $e->getMessage();
    }
}
