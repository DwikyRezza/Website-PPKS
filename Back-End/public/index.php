<?php
// Back-End/public/index.php

use Services\Router;

ini_set('display_errors', 1);
error_reporting(E_ALL);

define('ROOT_PATH', dirname(__DIR__));

spl_autoload_register(function ($class) {
    $file = ROOT_PATH . '/' . str_replace('\\', '/', $class) . '.php';
    
    if (file_exists($file)) {
        require_once $file;
    }
});

header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    $router = new Router();
    $router->run(); 
} catch (\Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Kesalahan Server Internal: ' . $e->getMessage()]);
}
?>