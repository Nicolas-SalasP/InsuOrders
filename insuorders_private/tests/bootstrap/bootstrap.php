<?php
require_once __DIR__ . '/../../vendor/autoload.php';

$_ENV['APP_ENV']    = $_ENV['APP_ENV']    ?? 'testing';
$_ENV['DB_HOST']    = $_ENV['DB_HOST']    ?? '127.0.0.1';
$_ENV['DB_NAME']    = $_ENV['DB_NAME']    ?? 'insuban_test';
$_ENV['DB_USER']    = $_ENV['DB_USER']    ?? 'root';
$_ENV['DB_PASS']    = $_ENV['DB_PASS']    ?? '';
$_ENV['JWT_SECRET'] = $_ENV['JWT_SECRET'] ?? 'test_secret_key_for_phpunit_only';

\App\Config\Config::resetForTesting();
