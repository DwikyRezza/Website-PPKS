<?php
// Back-End/services/Router.php

namespace Services;

class Router {
    private $routes = [];

    public function __construct() {
        // == 1. AUTHENTICATION (index.html) ==
        $this->addRoute('POST', '/api/auth/login', 'Controllers\\AuthController@login');
        $this->addRoute('GET', '/api/auth/logout', 'Controllers\\AuthController@logout');
        
        // == 2. PUBLIC REPORTING API (Form Lapor.html) ==
        $this->addRoute('POST', '/api/lapor/submit', 'Controllers\\LaporApiController@submit');

        // == 3. MONITORING API (Monitoring.html) ==
        $this->addRoute('GET', '/api/monitoring/status/([A-Z0-9]+)', 'Controllers\\MonitoringController@getReportStatus');
        $this->addRoute('GET', '/api/monitoring/timeline/(\d+)', 'Controllers\\MonitoringController@getTimelineSteps');

        // == 4. ADMIN: LAPORAN & KASUS (dashboard.html, detail-kasus.html) ==
        $this->addRoute('GET', '/api/admin/laporan', 'Controllers\\LaporanController@index');
        $this->addRoute('GET', '/api/admin/laporan/(\d+)', 'Controllers\\LaporanController@show');
        $this->addRoute('PUT', '/api/admin/kasus/(\d+)', 'Controllers\\LaporanController@updateCaseStatus');
        $this->addRoute('DELETE', '/api/admin/laporan/(\d+)', 'Controllers\\LaporanController@delete');
        $this->addRoute('GET', '/api/admin/stats', 'Controllers\\LaporanController@getStats');
        
        // == 5. ADMIN: POST / BLOG (blogspot.html) ==
        $this->addRoute('GET', '/api/posts', 'Controllers\\PostController@index'); 
        $this->addRoute('POST', '/api/posts', 'Controllers\\PostController@create'); 
        $this->addRoute('GET', '/api/posts/(\d+)', 'Controllers\\PostController@show'); 
        $this->addRoute('POST', '/api/posts/(\d+)', 'Controllers\\PostController@update');
        $this->addRoute('DELETE', '/api/posts/(\d+)', 'Controllers\\PostController@delete');
    }

    public function addRoute(string $method, string $uri, string $handler) {
        $uri = '#^' . str_replace('/', '\/', $uri) . '$#';
        $this->routes[] = ['method' => $method, 'uri' => $uri, 'handler' => $handler];
    }

    public function run() {
        $method = $_SERVER['REQUEST_METHOD'];
        $uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
        $base_path = str_replace('/index.php', '', $_SERVER['SCRIPT_NAME']);
        $uri = str_replace($base_path, '', $uri);

        if ($method === 'POST' && isset($_POST['_method'])) {
            $method = strtoupper($_POST['_method']);
        }
        
        foreach ($this->routes as $route) {
            if ($route['method'] === $method) {
                if (preg_match($route['uri'], $uri, $matches)) {
                    list($controllerClass, $methodName) = explode('@', $route['handler']);
                    $controller = new $controllerClass();
                    
                    array_shift($matches);
                    call_user_func_array([$controller, $methodName], $matches);
                    return;
                }
            }
        }

        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Endpoint API tidak ditemukan.']);
    }
}